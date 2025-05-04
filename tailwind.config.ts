import type { Config } from "tailwindcss";

export default {
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
             a: {
        color: "var(--color-accent)",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        textDecorationThickness: "2px",
        transitionProperty: "color, text-decoration-color, text-decoration-thickness",
        transitionDuration: "150ms",
        "&:hover": {
          color: "var(--color-accent)", // keep link color on hover
          textDecorationColor: "var(--color-link)",
        },
      },
            blockquote: {
              borderLeftWidth: "0",
            },
            code: {
              border: "1px dotted #666",
              borderRadius: "2px",
            },
            kbd: {
              "&:where([data-theme='dark'], [data-theme='dark'] *)": {
                background: "var(--color-global-text)",
              },
            },
            hr: {
              borderTopStyle: "dashed",
            },
            strong: {
              fontWeight: "700",
            },
            sup: {
              marginInlineStart: "calc(var(--spacing) * 0.5)",
              a: {
                "&:after": {
                  content: "']'",
                },
                "&:before": {
                  content: "'['",
                },
                "&:hover": {
                  "@media (hover: hover)": {
                    color: "var(--color-link)",
                  },
                },
              },
            },
            /* Table */
            "tbody tr": {
              borderBottomWidth: "none",
            },
            tfoot: {
              borderTop: "1px dashed #666",
            },
            thead: {
              borderBottomWidth: "none",
            },
            "thead th": {
              borderBottom: "1px dashed #666",
              fontWeight: "700",
            },
            'th[align="center"], td[align="center"]': {
              "text-align": "center",
            },
            'th[align="right"], td[align="right"]': {
              "text-align": "right",
            },
            'th[align="left"], td[align="left"]': {
              "text-align": "left",
            },
          },
        },
        sm: {
          css: {
            code: {
              fontSize: "var(--text-sm)",
              fontWeight: "400",
            },
          },
        },
      }),
    },
  },
} satisfies Config;
