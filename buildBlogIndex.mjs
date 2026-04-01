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

    // Extract metadata using Regex from <BlogLayout ...> or frontmatter
    const titleMatchAttr = content.match(/title="([^"]+)"/);
    const descMatchAttr = content.match(/description="([^"]+)"/);
    const dateMatchAttr = content.match(/pubDate="([^"]+)"/);

    const titleMatchProp = content.match(/title:\s*"([^"]+)"/);
    const descMatchProp = content.match(/description:\s*(?:"([^"]+)"|'([^']+)'|([^,]+))/);
    const dateMatchProp = content.match(/date:\s*(?:new Date\(\)\.toLocaleDateString\([^)]+\)|"([^"]+)")/);
    const imageMatchProp = content.match(/image:\s*"([^"]+)"/);
    const heroImageMatch = content.match(/class="hero-img"\s+src="([^"]+)"/);

    // Resolve matching values
    let title = titleMatchAttr ? titleMatchAttr[1] : (titleMatchProp ? titleMatchProp[1] : filename.replace('.astro', '').replace(/-/g, ' '));
    // For description, some are concatenated strings like "description: "Посмотреть полное видео на тему: " + "..."", simple approach:
    let description = descMatchAttr ? descMatchAttr[1] : (descMatchProp ? (descMatchProp[1] || descMatchProp[2] || "Смотреть статью...") : "");
    if (description.includes('+')) description = "Статья или видеоразбор для предпринимателей.";

    let pubDate = dateMatchAttr ? dateMatchAttr[1] : (dateMatchProp && dateMatchProp[1] ? dateMatchProp[1] : new Date().toISOString());
    let image = imageMatchProp ? imageMatchProp[1] : (heroImageMatch ? heroImageMatch[1] : null);

    return {
        slug: '/blog/' + filename.replace('.astro', ''),
        title,
        description,
        pubDate,
        image
    };
});

// Sort by date descending
posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Indexed ${posts.length} blog posts into src/data/blogPosts.json`);
