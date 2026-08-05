import * as React from "react";

/**
 * Minimal Markdown renderer for journal content.
 *
 * Supports exactly what the editorial team uses — h2/h3, paragraphs, bullet
 * lists and bold — and renders to JSX rather than HTML strings, so nothing is
 * ever passed through `dangerouslySetInnerHTML`.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Split on **bold** while keeping the delimiters' contents.
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((chunk, i) => {
    const key = `${keyPrefix}-${i}`;
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return <strong key={key}>{chunk.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={key}>{chunk}</React.Fragment>;
  });
}

export function ArticleBody({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  const nodes: React.ReactNode[] = [];

  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (!listBuffer.length) return;
    nodes.push(
      <ul key={key}>
        {listBuffer.map((item, i) => (
          <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  blocks.forEach((block, index) => {
    const key = `block-${index}`;

    if (block.startsWith("### ")) {
      flushList(`${key}-list`);
      nodes.push(<h3 key={key}>{renderInline(block.slice(4), key)}</h3>);
      return;
    }

    if (block.startsWith("## ")) {
      flushList(`${key}-list`);
      nodes.push(<h2 key={key}>{renderInline(block.slice(3), key)}</h2>);
      return;
    }

    if (block.startsWith("- ")) {
      listBuffer = block
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2));
      flushList(key);
      return;
    }

    flushList(`${key}-list`);
    nodes.push(<p key={key}>{renderInline(block, key)}</p>);
  });

  flushList("trailing-list");

  return <div className="prose-luxe max-w-none">{nodes}</div>;
}
