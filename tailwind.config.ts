import type { Config } from "tailwindcss";

/**
 * S-TIER EDITORIAL TYPOGRAPHY CONFIG
 *
 * Clean, refined prose styling for optimal reading experience.
 * No decorative borders (dashed/dotted), solid and subtle only.
 */
export default {
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			typography: () => ({
				DEFAULT: {
					css: {
						/* ========================================
						   BASE TYPOGRAPHY
						   ======================================== */

						// Optimal line-height for body text
						lineHeight: "1.75",
						fontSize: "1.0625rem", // 17px

						// Paragraph spacing - generous but not excessive
						p: {
							marginTop: "1.5em",
							marginBottom: "1.5em",
						},

						// First paragraph after heading - tighter
						"h1 + p, h2 + p, h3 + p, h4 + p": {
							marginTop: "1em",
						},

						/* ========================================
						   HEADINGS - Clear hierarchy
						   ======================================== */

						h1: {
							fontSize: "1.875rem", // 30px
							fontWeight: "700",
							letterSpacing: "-0.02em",
							lineHeight: "1.25",
							marginTop: "0",
							marginBottom: "1rem",
						},

						h2: {
							fontSize: "1.5rem", // 24px
							fontWeight: "600",
							letterSpacing: "-0.02em",
							lineHeight: "1.3",
							marginTop: "2.5rem",
							marginBottom: "1rem",
							paddingBottom: "0.5rem",
							borderBottom: "1px solid var(--color-border-light)",
						},

						h3: {
							fontSize: "1.25rem", // 20px
							fontWeight: "600",
							letterSpacing: "-0.01em",
							lineHeight: "1.375",
							marginTop: "2rem",
							marginBottom: "0.75rem",
						},

						h4: {
							fontSize: "1.0625rem", // 17px
							fontWeight: "600",
							letterSpacing: "0",
							lineHeight: "1.5",
							marginTop: "1.5rem",
							marginBottom: "0.5rem",
						},

						/* ========================================
						   LINKS - Classic 2000s blog style
						   Clear black underlines, no blue
						   ======================================== */

						a: {
							color: "var(--color-global-text)",
							textDecoration: "underline",
							textDecorationColor: "currentColor",
							textUnderlineOffset: "2px",
							textDecorationThickness: "1px",
							fontWeight: "500",
							"&:hover": {
								textDecorationThickness: "2px",
							},
						},

						/* ========================================
						   BLOCKQUOTES - Refined, not loud
						   ======================================== */

						blockquote: {
							fontStyle: "normal",
							fontWeight: "400",
							color: "var(--color-text-secondary)",
							borderLeftWidth: "2px",
							borderLeftColor: "var(--color-border)",
							paddingLeft: "1.25rem",
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
							quotes: "none",
						},

						"blockquote p:first-of-type::before": {
							content: "none",
						},

						"blockquote p:last-of-type::after": {
							content: "none",
						},

						/* ========================================
						   CODE - Clean, minimal
						   ======================================== */

						code: {
							fontFamily: "var(--font-mono)",
							fontSize: "0.875em",
							fontWeight: "400",
							backgroundColor: "var(--color-code-bg)",
							padding: "0.2em 0.4em",
							borderRadius: "0.25rem",
							// No decorative border
						},

						"code::before": {
							content: "none",
						},

						"code::after": {
							content: "none",
						},

						// Pre blocks - clean
						pre: {
							backgroundColor: "var(--color-code-bg)",
							borderRadius: "0.375rem",
							padding: "1rem 1.25rem",
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
							overflowX: "auto",
							border: "1px solid var(--color-border-light)",
						},

						"pre code": {
							backgroundColor: "transparent",
							padding: "0",
							fontSize: "0.875rem",
							lineHeight: "1.7",
						},

						/* ========================================
						   LISTS - Clean bullets/numbers
						   ======================================== */

						ul: {
							marginTop: "1.25rem",
							marginBottom: "1.25rem",
							paddingLeft: "1.5rem",
						},

						ol: {
							marginTop: "1.25rem",
							marginBottom: "1.25rem",
							paddingLeft: "1.5rem",
						},

						li: {
							marginTop: "0.5rem",
							marginBottom: "0.5rem",
						},

						"li::marker": {
							color: "var(--color-text-tertiary)",
						},

						// Nested lists
						"ul ul, ul ol, ol ul, ol ol": {
							marginTop: "0.5rem",
							marginBottom: "0.5rem",
						},

						/* ========================================
						   HORIZONTAL RULES - Subtle
						   ======================================== */

						hr: {
							borderColor: "var(--color-border)",
							borderTopWidth: "1px",
							marginTop: "3rem",
							marginBottom: "3rem",
						},

						/* ========================================
						   TABLES - Clean, readable
						   ======================================== */

						table: {
							width: "100%",
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
							fontSize: "0.9375rem",
							lineHeight: "1.5",
						},

						thead: {
							borderBottomWidth: "1px",
							borderBottomColor: "var(--color-border)",
						},

						"thead th": {
							fontWeight: "600",
							paddingTop: "0.75rem",
							paddingBottom: "0.75rem",
							paddingLeft: "0.75rem",
							paddingRight: "0.75rem",
							textAlign: "left",
							verticalAlign: "bottom",
						},

						"tbody tr": {
							borderBottomWidth: "1px",
							borderBottomColor: "var(--color-border-light)",
						},

						"tbody tr:last-child": {
							borderBottomWidth: "0",
						},

						"tbody td": {
							paddingTop: "0.75rem",
							paddingBottom: "0.75rem",
							paddingLeft: "0.75rem",
							paddingRight: "0.75rem",
							verticalAlign: "top",
						},

						tfoot: {
							borderTopWidth: "1px",
							borderTopColor: "var(--color-border)",
						},

						'th[align="center"], td[align="center"]': {
							textAlign: "center",
						},

						'th[align="right"], td[align="right"]': {
							textAlign: "right",
						},

						/* ========================================
						   IMAGES & FIGURES
						   ======================================== */

						img: {
							marginTop: "2rem",
							marginBottom: "2rem",
							borderRadius: "0.25rem",
						},

						figure: {
							marginTop: "2rem",
							marginBottom: "2rem",
						},

						figcaption: {
							fontSize: "0.875rem",
							color: "var(--color-text-secondary)",
							marginTop: "0.75rem",
							textAlign: "center",
						},

						/* ========================================
						   MISC ELEMENTS
						   ======================================== */

						strong: {
							fontWeight: "600",
							color: "var(--color-global-text)",
						},

						em: {
							fontStyle: "italic",
						},

						kbd: {
							fontFamily: "var(--font-mono)",
							fontSize: "0.875em",
							fontWeight: "500",
							backgroundColor: "var(--color-code-bg)",
							padding: "0.2em 0.4em",
							borderRadius: "0.25rem",
							border: "1px solid var(--color-border)",
							boxShadow: "0 1px 0 var(--color-border)",
						},

						// Footnotes
						sup: {
							marginInlineStart: "0.125rem",
							a: {
								color: "var(--color-text-secondary)",
								textDecoration: "none",
								"&::before": {
									content: "'['",
								},
								"&::after": {
									content: "']'",
								},
								"&:hover": {
									color: "var(--color-global-text)",
								},
							},
						},

						// Custom component spacing
						".expressive-code, .admonition, .github-card": {
							marginTop: "2rem",
							marginBottom: "2rem",
						},
					},
				},

				// Larger prose variant for wider content
				lg: {
					css: {
						fontSize: "1.125rem", // 18px
						lineHeight: "1.8",

						h1: {
							fontSize: "2.25rem", // 36px
						},

						h2: {
							fontSize: "1.75rem", // 28px
						},

						h3: {
							fontSize: "1.375rem", // 22px
						},
					},
				},

				// Smaller prose for compact content
				sm: {
					css: {
						fontSize: "0.9375rem", // 15px
						lineHeight: "1.7",

						code: {
							fontSize: "0.8125rem",
						},
					},
				},
			}),
		},
	},
} satisfies Config;
