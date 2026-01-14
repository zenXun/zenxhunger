import { visit } from 'unist-util-visit';
import { bookLinkerConfig } from '../config/book-linker.mjs';

console.log('DEBUG: LINKER PLUGIN MODULE LOADED');

export default function linker() {
    console.log('DEBUG: LINKER PLUGIN FUNCTION CALLED');
    return (tree, file) => {
        console.log('DEBUG: LINKER TRANSFORMER CALLED FOR', file.history ? file.history[0] : 'unknown');

        visit(tree, 'text', (node, index, parent) => {
            if (node.value && node.value.includes('High Output Management')) {
                console.log('DEBUG: FOUND TEXT MATCH IN:', file.history[0]);
                console.log('DEBUG: Parent type:', parent ? parent.type : 'null');
            }
        });
    };
}
