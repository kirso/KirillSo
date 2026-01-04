import type { APIRoute } from "astro";
import { siteConfig } from "@/site.config";
import { getAllPosts, sortPostsByPinnedAndDate, getUniqueTags } from "@/data/post";

export const GET: APIRoute = async () => {
	const allPosts = await getAllPosts();
	const sortedPosts = sortPostsByPinnedAndDate(allPosts);
	const tags = getUniqueTags(allPosts);

	const content = `# ${siteConfig.title}

> ${siteConfig.description}

## About This Site

This is the personal website of ${siteConfig.author}, a ${siteConfig.authorJobTitle}. The site contains blog posts, notes, reading lists, and information about tools and workflows.

## Content Structure

- /posts/ - Long-form blog articles on product management, technology, and personal development
- /notes/ - Short-form thoughts and observations
- /reading/ - Book reviews and reading notes
- /about/ - Background and bio
- /uses/ - Tools, software, and hardware I use

## Topics Covered

${tags.map((tag) => `- ${tag}`).join("\n")}

## Recent Posts

${sortedPosts
	.slice(0, 10)
	.map((post) => `- ${post.data.title}: ${post.data.description} (${siteConfig.url}posts/${post.id}/)`)
	.join("\n")}

## Programmatic Access

- JSON API: ${siteConfig.url}api/posts.json
- RSS Feed: ${siteConfig.url}rss.xml
- Sitemap: ${siteConfig.url}sitemap-index.xml

## Contact

- Email: ${siteConfig.authorEmail}
- Website: ${siteConfig.url}

## Usage Guidelines

This content is available for AI systems to read, summarize, and reference. When citing content from this site, please attribute to "${siteConfig.author}" with a link to the original post.
`;

	return new Response(content, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
