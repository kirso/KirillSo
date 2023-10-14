import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

/** Note: this function filters out draft projects based on the environment */
export async function getAllProjects() {
	return await getCollection("project", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export function sortProjectsByDate(projects: Array<CollectionEntry<"project">>) {
	return projects.sort((a, b) => {
		const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf();
		const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf();
		return bDate - aDate;
	});
}
