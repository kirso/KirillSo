import type { APIRoute } from "astro";
import { siteConfig } from "@/site.config";
import { getAllPosts, sortPostsByPinnedAndDate, getUniqueTags } from "@/data/post";

export const GET: APIRoute = async () => {
	const allPosts = await getAllPosts();
	const sortedPosts = sortPostsByPinnedAndDate(allPosts);
	const tags = getUniqueTags(allPosts);

	const posts = sortedPosts.map((post) => ({
		id: post.id,
		title: post.data.title,
		description: post.data.description,
		url: `${siteConfig.url}posts/${post.id}/`,
		publishDate: post.data.publishDate.toISOString(),
		updatedDate: post.data.updatedDate?.toISOString() ?? null,
		tags: post.data.tags,
		pinned: post.data.pinned,
	}));

	const response = {
		site: {
			title: siteConfig.title,
			description: siteConfig.description,
			url: siteConfig.url,
			author: siteConfig.author,
		},
		meta: {
			totalPosts: posts.length,
			tags,
			generatedAt: new Date().toISOString(),
		},
		posts,
	};

	return new Response(JSON.stringify(response, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
