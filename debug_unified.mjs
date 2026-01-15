import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeBookLinker from './src/plugins/rehype-book-linker.mjs';

const content = `Based on the iterative observation of AI capabilities and following the methodology of Syntopical Reading proposed by Mortimer Adler in *How to Read a Book*—which is the core methodology of my writing series—I am preparing to test the following three key hypotheses during my transition:

### 1. From "Multiplying Others" to "Multiplying Self": Seeking "Escape Velocity"

As *The Staff Engineer’s Path* suggests, the true value of a Staff Engineer lies in solving systemic deadlocks with an elegant, cross-team technical solution that a manager couldn't resolve even with ten additional hires.`;

const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeBookLinker)
    .use(rehypeStringify);

async function run() {
    const result = await processor.process(content);
    console.log(result.toString());
}

run();
