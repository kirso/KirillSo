import type { Config } from "tailwindcss";

/**
 * S-TIER EDITORIAL TYPOGRAPHY CONFIG
 *
 * Optimized for Geist font family (Vercel).
 * OKLCH colors, fluid typography, 65ch measure.
 * Clean, refined prose for optimal reading.
 */
export default {
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			typography: () => ({
				DEFAULT: {
					css: {
						/* ========================================
						   BASE TYPOGRAPHY — Geist Optimized
						   ======================================== */

						// Geist works best with slightly tighter line-height
						lineHeight: "1.65",
						fontSize: "var(--text-body)",
						maxWidth: "65ch", // Optimal measure

						// Paragraph spacing - using 4px grid
						p: {
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
						},

						// First paragraph after heading - tighter
						"h1 + p, h2 + p, h3 + p, h4 + p": {
							marginTop: "1rem",
						},

						/* ========================================
						   HEADINGS — Fluid Scale
						   ======================================== */

						h1: {
							fontSize: "var(--text-display)",
							fontWeight: "700",
							letterSpacing: "-0.015em",
							lineHeight: "1.2",
							marginTop: "0",
							marginBottom: "1rem",
						},

						h2: {
							fontSize: "var(--text-title)",
							fontWeight: "700",
							letterSpacing: "-0.015em",
							lineHeight: "1.3",
							marginTop: "3rem",
							marginBottom: "1rem",
						},

						h3: {
							fontSize: "var(--text-large)",
							fontWeight: "700",
							letterSpacing: "-0.01em",
							lineHeight: "1.35",
							marginTop: "2rem",
							marginBottom: "0.75rem",
						},

						h4: {
							fontSize: "var(--text-body)",
							fontWeight: "700",
							letterSpacing: "0",
							lineHeight: "1.5",
							marginTop: "1.5rem",
							marginBottom: "0.5rem",
						},

						/* ========================================
						   LINKS — Underline thickens on hover
						   ======================================== */

						a: {
							color: "var(--color-ink)",
							textDecoration: "underline",
							textDecorationColor: "currentColor",
							textUnderlineOffset: "3px",
							textDecorationThickness: "1px",
							fontWeight: "500",
							transition: "text-decoration-thickness 150ms cubic-bezier(0.33, 1, 0.68, 1)",
							"&:hover": {
								textDecorationThickness: "2px",
							},
						},

						/* ========================================
						   BLOCKQUOTES — Refined, not loud
						   ======================================== */

						blockquote: {
							fontStyle: "normal",
							fontWeight: "400",
							color: "var(--color-ink-secondary)",
							borderLeftWidth: "2px",
							borderLeftColor: "var(--color-rule)",
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
						   CODE — Clean, minimal
						   ======================================== */

						code: {
							fontFamily: "var(--font-mono)",
							fontSize: "0.875em",
							fontWeight: "400",
							backgroundColor: "var(--color-surface)",
							padding: "0.2em 0.4em",
							borderRadius: "0.25rem",
						},

						"code::before": {
							content: "none",
						},

						"code::after": {
							content: "none",
						},

						pre: {
							backgroundColor: "var(--color-surface)",
							borderRadius: "0.375rem",
							padding: "1rem 1.25rem",
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
							overflowX: "auto",
							border: "1px solid var(--color-rule-light)",
						},

						"pre code": {
							backgroundColor: "transparent",
							padding: "0",
							fontSize: "var(--text-small)",
							lineHeight: "1.6",
						},

						/* ========================================
						   LISTS — Clean bullets/numbers
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
							color: "var(--color-ink-tertiary)",
						},

						"ul ul, ul ol, ol ul, ol ol": {
							marginTop: "0.5rem",
							marginBottom: "0.5rem",
						},

						/* ========================================
						   HORIZONTAL RULES — Subtle
						   ======================================== */

						hr: {
							borderColor: "var(--color-rule)",
							borderTopWidth: "1px",
							marginTop: "3rem",
							marginBottom: "3rem",
						},

						/* ========================================
						   TABLES — Clean, readable
						   ======================================== */

						table: {
							width: "100%",
							marginTop: "1.5rem",
							marginBottom: "1.5rem",
							fontSize: "var(--text-small)",
							lineHeight: "1.5",
						},

						thead: {
							borderBottomWidth: "1px",
							borderBottomColor: "var(--color-rule)",
						},

						"thead th": {
							fontWeight: "700",
							paddingTop: "0.75rem",
							paddingBottom: "0.75rem",
							paddingLeft: "0.75rem",
							paddingRight: "0.75rem",
							textAlign: "left",
							verticalAlign: "bottom",
						},

						"tbody tr": {
							borderBottomWidth: "1px",
							borderBottomColor: "var(--color-rule-light)",
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
							borderTopColor: "var(--color-rule)",
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
							fontSize: "var(--text-small)",
							color: "var(--color-ink-secondary)",
							marginTop: "0.75rem",
							textAlign: "center",
						},

						/* ========================================
						   MISC ELEMENTS
						   ======================================== */

						strong: {
							fontWeight: "700",
							color: "var(--color-ink)",
						},

						em: {
							fontStyle: "italic",
						},

						kbd: {
							fontFamily: "var(--font-mono)",
							fontSize: "0.875em",
							fontWeight: "500",
							backgroundColor: "var(--color-surface)",
							padding: "0.2em 0.4em",
							borderRadius: "0.25rem",
							border: "1px solid var(--color-rule)",
							boxShadow: "0 1px 0 var(--color-rule)",
						},

						// Footnotes
						sup: {
							marginInlineStart: "0.125rem",
							a: {
								color: "var(--color-ink-secondary)",
								textDecoration: "none",
								"&::before": {
									content: "'['",
								},
								"&::after": {
									content: "']'",
								},
								"&:hover": {
									color: "var(--color-ink)",
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

				// Larger prose variant
				lg: {
					css: {
						fontSize: "1.125rem",
						lineHeight: "1.7",
						maxWidth: "70ch",

						h1: {
							fontSize: "2.25rem",
						},

						h2: {
							fontSize: "1.75rem",
						},

						h3: {
							fontSize: "1.375rem",
						},
					},
				},

				// Smaller prose for compact content
				sm: {
					css: {
						fontSize: "var(--text-small)",
						lineHeight: "1.6",
						maxWidth: "60ch",

						code: {
							fontSize: "0.8125rem",
						},
					},
				},
			}),
		},
	},
} satisfies Config;
