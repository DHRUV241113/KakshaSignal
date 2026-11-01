import React from 'react';

/**
 * SafeMarkdown: A pure-React, XSS-safe Markdown & Math renderer.
 * Zero external dependencies, zero dangerouslySetInnerHTML.
 * Supports headings, bold, italic, bullet lists, numbered lists,
 * key-value definition callouts, mathematical fractions, and formulas.
 */

// Helper to format inline text with bold, italic, code, and mathematical notation
function renderInlineText(text, keyPrefix = 'inline') {
  if (!text) return null;

  // Split by inline markdown tokens: `code`, **bold**, *italic*
  // Regex matches: (`[^`]+`) | (\*\*[^*]+\*\*) | (\*[^*]+\*)
  const tokens = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'text', val: text.substring(lastIdx, match.index) });
    }
    const tokenStr = match[0];
    if (tokenStr.startsWith('`') && tokenStr.endsWith('`')) {
      tokens.push({ type: 'code', val: tokenStr.slice(1, -1) });
    } else if (tokenStr.startsWith('**') && tokenStr.endsWith('**')) {
      tokens.push({ type: 'bold', val: tokenStr.slice(2, -2) });
    } else if (tokenStr.startsWith('*') && tokenStr.endsWith('*')) {
      tokens.push({ type: 'italic', val: tokenStr.slice(1, -1) });
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    tokens.push({ type: 'text', val: text.substring(lastIdx) });
  }

  // Helper to format mathematical fractions and symbols in plain text segments
  const formatMathText = (str, subKey) => {
    // Check for common fraction patterns like " 3/4", "7/3", "1/2", "2/5"
    const fractionRegex = /\b(\d+)\/(\d+)\b/g;
    const parts = [];
    let pLast = 0;
    let fMatch;

    while ((fMatch = fractionRegex.exec(str)) !== null) {
      if (fMatch.index > pLast) {
        parts.push(str.substring(pLast, fMatch.index));
      }
      const num = fMatch[1];
      const den = fMatch[2];
      parts.push(
        <span
          key={`frac_${subKey}_${fMatch.index}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-950 font-mono text-xs font-bold border border-indigo-200/80 mx-0.5 align-baseline"
          title={`Fraction: ${num} over ${den}`}
        >
          <span>{num}</span>
          <span className="opacity-40 mx-0.5">/</span>
          <span>{den}</span>
        </span>
      );
      pLast = fractionRegex.lastIndex;
    }

    if (pLast < str.length) {
      parts.push(str.substring(pLast));
    }

    return parts.length > 0 ? parts : str;
  };

  return tokens.map((token, i) => {
    const k = `${keyPrefix}_${i}`;
    switch (token.type) {
      case 'bold':
        return (
          <strong key={k} className="font-extrabold text-slate-900">
            {formatMathText(token.val, k)}
          </strong>
        );
      case 'italic':
        return (
          <em key={k} className="italic text-slate-800">
            {formatMathText(token.val, k)}
          </em>
        );
      case 'code':
        return (
          <code
            key={k}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-900 font-mono text-xs font-semibold border border-slate-200"
          >
            {token.val}
          </code>
        );
      default:
        return <span key={k}>{formatMathText(token.val, k)}</span>;
    }
  });
}

export default function SafeMarkdown({ content, className = '' }) {
  if (!content || typeof content !== 'string') {
    return (
      <div className={`text-slate-400 italic text-xs ${className}`}>
        No content available.
      </div>
    );
  }

  // Parse lines into blocks
  const rawLines = content.split('\n');
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Empty line -> paragraph separator
    if (!line) {
      flushList();
      continue;
    }

    // Heading: # H1, ## H2, ### H3
    if (line.startsWith('### ')) {
      flushList();
      blocks.push({
        type: 'h3',
        text: line.slice(4)
      });
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      blocks.push({
        type: 'h2',
        text: line.slice(3)
      });
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      blocks.push({
        type: 'h1',
        text: line.slice(2)
      });
      continue;
    }

    // Numbered list item: e.g. "1. ", "2. "
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numMatch[2]);
      continue;
    }

    // Bullet item: e.g. "• ", "- ", "* "
    const bulletMatch = line.match(/^(?:•|-|\*)\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // If it's a section header like "**Key Concepts:**" on its own line
    if (line.startsWith('**') && line.endsWith('**') && line.length < 50) {
      flushList();
      blocks.push({
        type: 'subhead',
        text: line.slice(2, -2)
      });
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push({
      type: 'p',
      text: line
    });
  }

  flushList();

  return (
    <div className={`space-y-3 break-words whitespace-normal text-slate-700 leading-relaxed text-sm ${className}`}>
      {blocks.map((block, idx) => {
        const key = `block_${idx}`;

        switch (block.type) {
          case 'h1':
            return (
              <h1 key={key} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-4 mb-2">
                {renderInlineText(block.text, key)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={key} className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-3 mb-1.5">
                {renderInlineText(block.text, key)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} className="text-base sm:text-lg font-bold text-slate-900 mt-2.5 mb-1">
                {renderInlineText(block.text, key)}
              </h3>
            );
          case 'subhead':
            return (
              <div key={key} className="pt-2 text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                <span>{renderInlineText(block.text, key)}</span>
              </div>
            );
          case 'ul':
            return (
              <ul key={key} className="space-y-1.5 pl-4 sm:pl-5 list-disc text-slate-700 my-2">
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}_li_${itemIdx}`} className="leading-relaxed">
                    {renderInlineText(item, `${key}_li_${itemIdx}`)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="space-y-1.5 pl-4 sm:pl-5 list-decimal text-slate-700 my-2 font-medium">
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}_li_${itemIdx}`} className="leading-relaxed">
                    {renderInlineText(item, `${key}_li_${itemIdx}`)}
                  </li>
                ))}
              </ol>
            );
          case 'p':
          default:
            return (
              <p key={key} className="leading-relaxed">
                {renderInlineText(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
