import type { SiteConfig } from "@/types";
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export const siteConfig: SiteConfig = {
  author: "Kirill So",
  date: {
    locale: "en-GB",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  // Used as the default description meta property and webmanifest description
  description: "Product manager, occasional writer and part-time maker.",
  // HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
  lang: "en-GB",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_GB",
  // Used to construct the meta title property found in src/components/BaseHead.astro L:11, and webmanifest name found in astro.config.ts L:42
  title: "Kirill So",
  url: "https://www.kirillso.com/" ,
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
  {
    path: "/",
    title: "Home",
  },
  {
    path: "/posts/",
    title: "Blog",
  },
  {
    path: "/notes/",
    title: "Notes",
  },
  {
    path: "/tags/",
    title: "Tags",
  },
  {
    path: "/about/",
    title: "About",
  },
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  styleOverrides: {
    borderRadius: "4px",
    codeFontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    codeFontSize: "0.875rem",
    codeLineHeight: "1.7142857rem",
    codePaddingInline: "1rem",
    frames: {
      frameBoxShadowCssValue: "none",
    },
    uiLineHeight: "inherit",
  },
  themeCssSelector(theme, { styleVariants }) {
    // If one dark and one light theme are available
    // generate theme CSS selectors compatible with cactus-theme dark mode switch
    if (styleVariants.length >= 2) {
      const baseTheme = styleVariants[0]?.theme;
      const altTheme = styleVariants.find(
        (v) => v.theme.type !== baseTheme?.type,
      )?.theme;
      if (theme === baseTheme || theme === altTheme)
        return `[data-theme='${theme.type}']`;
    }
    // return default selector
    return `[data-theme="${theme.name}"]`;
  },
  // One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
  themes: ["houston", "github-light"],
  useThemedScrollbars: false,
};
