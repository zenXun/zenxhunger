/**
 * Configuration for the remark-book-linker plugin.
 * 
 * You can customize how book titles are detected here.
 */
export const bookLinkerConfig = {
    /**
     * Text delimiters that surround a book title.
     * The plugin will strictly check if the matched keyword is surrounded by these characters.
     */
    textDelimiters: [
        { left: '《', right: '》' },
        { left: '「', right: '」' },
        { left: '(', right: ')' }
        // Uncomment the line below to support double quotes (e.g. "High Output Management")
        // { left: '"', right: '"' } 
    ],

    /**
     * Markdown node types that can act as a container for a book title.
     * For example, 'emphasis' corresponds to *Title* or _Title_, 
     * and 'strong' corresponds to **Title**.
     */
    allowedParentTypes: [
        'emphasis',
        'strong'
    ]
};
