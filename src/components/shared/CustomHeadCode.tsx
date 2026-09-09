import React from "react";

interface ParsedTag {
  tagName: string;
  attrs: Record<string, string | boolean>;
  innerContent: string;
}

function parseAttributes(attrString: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  const regex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1];
    const val =
      match[2] !== undefined
        ? match[2]
        : match[3] !== undefined
        ? match[3]
        : match[4] !== undefined
        ? match[4]
        : true;
    attrs[key] = val;
  }
  return attrs;
}

export function parseHeadTags(html: string): ParsedTag[] {
  if (!html || typeof html !== "string") return [];

  // Remove HTML comments
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!cleanHtml) return [];

  // Regex for head tags without needing the 's' flag (using [\s\S] instead)
  const tagRegex = /<([a-zA-Z0-9]+)([\s\S]*?)?(?:\/>|>([\s\S]*?)<\/\1>|>)/gi;
  const tags: ParsedTag[] = [];
  let match;

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const tagName = match[1].toLowerCase();
    const rawAttrs = match[2] || "";
    const innerContent = match[3] || "";
    const attrs = parseAttributes(rawAttrs);

    tags.push({
      tagName,
      attrs,
      innerContent: innerContent.trim(),
    });
  }

  // If someone just entered a verification string like "google-site-verification=abc..." or a plain token
  if (tags.length === 0 && cleanHtml.length > 0 && !cleanHtml.startsWith("<")) {
    const token = cleanHtml.replace(/^google-site-verification\s*[:=]\s*/i, "").trim();
    tags.push({
      tagName: "meta",
      attrs: {
        name: "google-site-verification",
        content: token,
      },
      innerContent: "",
    });
  }

  return tags;
}

export function CustomHeadCode({ code }: { code?: string | null }) {
  if (!code || !code.trim()) return null;

  const tags = parseHeadTags(code);

  return (
    <>
      {tags.map((tag, idx) => {
        const key = `head-tag-${tag.tagName}-${idx}`;
        switch (tag.tagName) {
          case "meta":
            return <meta key={key} {...(tag.attrs as React.MetaHTMLAttributes<HTMLMetaElement>)} />;
          case "link":
            return <link key={key} {...(tag.attrs as React.LinkHTMLAttributes<HTMLLinkElement>)} />;
          case "style":
            return (
              <style
                key={key}
                {...(tag.attrs as React.StyleHTMLAttributes<HTMLStyleElement>)}
                dangerouslySetInnerHTML={{ __html: tag.innerContent }}
              />
            );
          case "script":
            if (tag.innerContent) {
              return (
                <script
                  key={key}
                  {...(tag.attrs as React.ScriptHTMLAttributes<HTMLScriptElement>)}
                  dangerouslySetInnerHTML={{ __html: tag.innerContent }}
                />
              );
            }
            return <script key={key} {...(tag.attrs as React.ScriptHTMLAttributes<HTMLScriptElement>)} />;
          case "noscript":
            return (
              <noscript
                key={key}
                dangerouslySetInnerHTML={{ __html: tag.innerContent }}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export function CustomBodyCode({ code }: { code?: string | null }) {
  if (!code || !code.trim()) return null;

  return (
    <div
      id="custom-body-injections"
      className="contents"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
