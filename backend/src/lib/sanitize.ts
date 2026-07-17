import sanitizeHtml from "sanitize-html";

/**
 * Server-side sanitation for editor HTML before storage/echo.
 * Allows the TipTap vocabulary (headings, lists, tables, code, images)
 * and strips everything else — scripts, event handlers, iframes.
 */
export function sanitizeEditorHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "br", "hr",
      "strong", "em", "u", "s", "code", "pre", "blockquote",
      "ul", "ol", "li", "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      pre: ["class"],
      code: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
