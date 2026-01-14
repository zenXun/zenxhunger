import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { visitParents } from 'unist-util-visit-parents';
import { bookLinkerConfig } from '../config/book-linker.mjs';

// Cache for library mappings
let libraryMapping = null;

function loadLibraryMappings(root) {
    if (libraryMapping) return libraryMapping;

    libraryMapping = new Map();
    const libraryDir = path.join(root, 'src/content/library');

    if (!fs.existsSync(libraryDir)) return libraryMapping;

    function scanDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const { data } = matter(content);

                    const relativePath = path.relative(libraryDir, fullPath);
                    const slug = relativePath
                        .replace(/\\/g, '/')
                        .replace(/\.[^/.]+$/, '');

                    const pathParts = slug.split('/');
                    const entryLocale = pathParts.length > 1 ? pathParts[0] : (data.locale || 'en');
                    const slugBaseName = pathParts.length > 1 ? pathParts.slice(1).join('/') : slug;

                    const keys = [];
                    if (data.book_title) keys.push(data.book_title.toLowerCase());
                    if (data.title) keys.push(data.title.toLowerCase());
                    if (data.alias && Array.isArray(data.alias)) {
                        data.alias.forEach(a => keys.push(a.toLowerCase()));
                    }

                    keys.forEach(key => {
                        if (!libraryMapping.has(key)) {
                            libraryMapping.set(key, {});
                        }
                        const entryMap = libraryMapping.get(key);
                        entryMap[entryLocale] = slugBaseName;
                    });

                } catch (e) {
                    console.error(`Error parsing ${file}:`, e);
                }
            }
        }
    }

    scanDir(libraryDir);
    return libraryMapping;
}

function getBestSlug(key, mapping, currentLocale) {
    const entryMap = mapping.get(key);
    if (!entryMap) return null;

    if (entryMap[currentLocale]) return { slug: entryMap[currentLocale], locale: currentLocale };
    if (entryMap['en']) return { slug: entryMap['en'], locale: 'en' };

    const locales = Object.keys(entryMap);
    if (locales.length > 0) return { slug: entryMap[locales[0]], locale: locales[0] };

    return null;
}

export default function rehypeBookLinker() {
    return (tree, file) => {
        const root = process.cwd();
        const mapping = loadLibraryMappings(root);

        if (mapping.size === 0) return;

        let currentLocale = 'zh';
        if (file.history && file.history.length > 0) {
            const filePath = file.history[0];
            if (filePath.includes('/en/')) currentLocale = 'en';
            else if (filePath.includes('/zh/')) currentLocale = 'zh';
        }

        const tagMapping = {
            'emphasis': 'em',
            'strong': 'strong'
        };

        const allowedTags = bookLinkerConfig.allowedParentTypes.map(t => tagMapping[t] || t);

        visitParents(tree, 'text', (node, ancestors) => {
            // 1. Skip if inside existing link (<a> tag)
            const insideLink = ancestors.some(a => a.type === 'element' && a.tagName === 'a');
            if (insideLink) return;

            const content = node.value;
            if (!content || content.length < 2) return;

            let bestMatch = null;

            for (const key of mapping.keys()) {
                const idx = content.toLowerCase().indexOf(key);
                if (idx !== -1) {
                    if (!bestMatch || key.length > bestMatch.key.length || (key.length === bestMatch.key.length && idx < bestMatch.index)) {

                        // Rule 1: Text Delimiters
                        const leftChar = idx > 0 ? content[idx - 1] : '';
                        const rightChar = idx + key.length < content.length ? content[idx + key.length] : '';
                        const hasBookMarks = bookLinkerConfig.textDelimiters.some(d =>
                            leftChar === d.left && rightChar === d.right
                        );

                        // Rule 2: Parent Tag Check
                        const parent = ancestors[ancestors.length - 1];
                        const isEmphasized = parent && parent.type === 'element' && allowedTags.includes(parent.tagName);

                        // Also check explicit ignore? No.

                        if (hasBookMarks || isEmphasized) {
                            const result = getBestSlug(key, mapping, currentLocale);
                            if (result) {
                                const { slug, locale } = result;
                                let cleanSlug = slug;
                                if (cleanSlug.startsWith('en/')) cleanSlug = cleanSlug.substring(3);
                                if (cleanSlug.startsWith('zh/')) cleanSlug = cleanSlug.substring(3);
                                const prefix = locale === 'en' ? '/en/library' : '/library';

                                bestMatch = {
                                    key,
                                    url: `${prefix}/${cleanSlug}`,
                                    index: idx,
                                    originalText: content.substr(idx, key.length)
                                };
                            }
                        }
                    }
                }
            }

            if (bestMatch) {
                const before = content.slice(0, bestMatch.index);
                const match = bestMatch.originalText;
                const after = content.slice(bestMatch.index + match.length);

                const newNodes = [];
                if (before) newNodes.push({ type: 'text', value: before });

                // Construct Element Node for Link (HAST)
                const linkNode = {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                        href: bestMatch.url,
                        title: `Read notes for ${bestMatch.key}`
                    },
                    children: [{ type: 'text', value: match }]
                };
                newNodes.push(linkNode);

                if (after) newNodes.push({ type: 'text', value: after });

                // Replace the text node in the parent's children array
                const parent = ancestors[ancestors.length - 1];
                const index = parent.children.indexOf(node);

                if (index !== -1) {
                    parent.children.splice(index, 1, ...newNodes);
                }
            }
        });
    };
}
