/**
 * Influential books data with notes explaining their impact.
 * Used on the /reading page alongside Goodreads RSS for currently reading.
 */

export interface Book {
	title: string;
	author: string;
	note?: string;
	goodreadsUrl?: string;
	yearRead?: number;
}

export interface BookCategory {
	title: string;
	books: Book[];
}

/**
 * Core influential books - these are curated and static.
 * Currently reading is fetched from Goodreads RSS.
 */
export const influentialBooks: BookCategory[] = [
	{
		title: "Favorites",
		books: [
			{
				title: "The Psychology of Money",
				author: "Morgan Housel",
				note: "Timeless lessons on wealth and behavior",
			},
			{
				title: "Thinking, Fast and Slow",
				author: "Daniel Kahneman",
				note: "Two systems of thought",
			},
			{
				title: "The Mom Test",
				author: "Rob Fitzpatrick",
				note: "How to talk to customers",
			},
			{
				title: "Atomic Habits",
				author: "James Clear",
				note: "Small changes, remarkable results",
			},
			{
				title: "The Courage to Be Disliked",
				author: "Ichiro Kishimi",
				note: "Adlerian psychology for modern life",
			},
			{
				title: "Inspired",
				author: "Marty Cagan",
				note: "How to create products customers love",
			},
		],
	},
	{
		title: "Philosophy & Life",
		books: [
			{
				title: "Meditations",
				author: "Marcus Aurelius",
				note: "Stoic wisdom",
			},
			{
				title: "Man's Search for Meaning",
				author: "Viktor Frankl",
				note: "Finding purpose in suffering",
			},
			{
				title: "The Subtle Art of Not Giving a F*ck",
				author: "Mark Manson",
				note: "Counterintuitive life advice",
			},
		],
	},
	{
		title: "Business & Strategy",
		books: [
			{
				title: "Zero to One",
				author: "Peter Thiel",
				note: "Notes on startups",
			},
			{
				title: "The Hard Thing About Hard Things",
				author: "Ben Horowitz",
				note: "Building a business when there are no easy answers",
			},
			{
				title: "Good Strategy Bad Strategy",
				author: "Richard Rumelt",
				note: "The difference and why it matters",
			},
		],
	},
	{
		title: "Technology & Future",
		books: [
			{
				title: "The Innovator's Dilemma",
				author: "Clayton Christensen",
				note: "Why great companies fail",
			},
			{
				title: "Superintelligence",
				author: "Nick Bostrom",
				note: "Paths, dangers, strategies",
			},
		],
	},
];

/**
 * Goodreads RSS URL for currently reading shelf.
 * Format: https://www.goodreads.com/review/list_rss/USER_ID?shelf=currently-reading
 */
export const GOODREADS_RSS_URL =
	"https://www.goodreads.com/review/list_rss/18135797?shelf=currently-reading";
export const GOODREADS_PROFILE_URL = "https://www.goodreads.com/kirso";
