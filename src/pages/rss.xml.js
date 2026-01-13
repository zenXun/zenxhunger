import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const collections = ['studio', 'cafe', 'club', 'library'];
    let allPosts = [];

    for (const name of collections) {
        const posts = await getCollection(name, ({ data }) => {
            return import.meta.env.PROD ? !data.draft : true;
        });
        // Attach collection name to each post for URL generation
        const postsWithCollection = posts.map(post => ({ ...post, collection: name }));
        allPosts = allPosts.concat(postsWithCollection);
    }

    // Sort by publication date (newest first)
    allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    return rss({
        title: 'Zen X Hunger',
        description: 'Thinking · Exploring · Tasting',
        site: context.site,
        items: allPosts.map((post) => {
            // Logic from [slug].astro: standardizing slugs
            const baseSlug = post.slug.split('/').pop();
            const locale = post.data.locale || 'en';

            // Construct URL based on locale
            // zh -> /collection/slug
            // en -> /en/collection/slug
            let link = '';
            if (locale === 'zh') {
                link = `/${post.collection}/${baseSlug}/`;
            } else {
                link = `/en/${post.collection}/${baseSlug}/`;
            }

            return {
                title: post.data.title,
                pubDate: post.data.pubDate,
                description: post.data.description,
                link: link,
                // Optional: Adding custom data to indicate locale
                customData: `<language>${locale}</language>`,
            };
        }),
        customData: `<language>zh-cn</language>`,
    });
}
