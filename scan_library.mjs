import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const libraryPath = './src/content/library';

function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else if (file.endsWith('.md')) {
            allFiles.push(name);
        }
    }
    return allFiles;
}

const allMdFiles = getFiles(libraryPath);
const results = [];

allMdFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const { data } = matter(content);
    // Astro collection ID is usually relative to the collection folder
    const relativePath = path.relative(libraryPath, file);
    const id = relativePath.replace(/\.md$/, '');

    results.push({
        file,
        id,
        title: data.title,
        status: data.status,
        locale: data.locale,
        draft: data.draft
    });
});

console.log('--- Scan results ---');
results.forEach(res => {
    console.log(`File: ${res.file}`);
    console.log(`  ID: ${res.id}`);
    console.log(`  Locale: ${res.locale}`);
    console.log(`  Status: ${res.status}`);
    console.log('---');
});

// Check for ID collisions if someone were to strip the prefix
const slugCollisions = {};
results.forEach(res => {
    const baseSlug = path.basename(res.id);
    if (!slugCollisions[baseSlug]) slugCollisions[baseSlug] = [];
    slugCollisions[baseSlug].push(res);
});

console.log('\n--- Slug collision check (by filename) ---');
Object.entries(slugCollisions).forEach(([slug, posts]) => {
    if (posts.length > 1) {
        console.log(`Slug "${slug}" is shared by:`);
        posts.forEach(p => console.log(`  - ${p.file} (Locale: ${p.locale}, Status: ${p.status})`));
    }
});
