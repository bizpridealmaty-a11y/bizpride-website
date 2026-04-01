import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/pages/blog');
const dataDir = path.join(process.cwd(), 'src/data');
const outputFile = path.join(dataDir, 'blogPosts.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.astro') && f !== 'index.astro');

const posts = files.map(filename => {
    const content = fs.readFileSync(path.join(blogDir, filename), 'utf-8');

    // Extract metadata using Regex from <BlogLayout ...> or <article ...> blocks
    const titleMatch = content.match(/title="([^"]+)"/);
    const descMatch = content.match(/description="([^"]+)"/);
    const dateMatch = content.match(/pubDate="([^"]+)"/);

    // Some posts might not have explicit title in BlogLayout, fallback
    const title = titleMatch ? titleMatch[1] : (filename.replace('.astro', '').replace(/-/g, ' '));
    const description = descMatch ? descMatch[1] : '';
    const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString();

    return {
        slug: '/blog/' + filename.replace('.astro', ''),
        title,
        description,
        pubDate
    };
});

// Sort by date descending
posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Indexed ${posts.length} blog posts into src/data/blogPosts.json`);
