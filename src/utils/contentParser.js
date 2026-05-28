/* ============================================
   Content Parser — Extract learning items
   from text and PDF content
   ============================================ */
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to a highly reliable external CDN specifically matching our installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * STRICT SEMANTIC PARSER
 * =====================================================
 * Rules:
 * - Preserve original content exactly
 * - Never remove any word (articles, prepositions, etc.)
 * - Preserve full phrases as single semantic units
 * - Only trim unnecessary outer whitespace
 * - Preserve multilingual text, emojis, symbols exactly
 * - Skip malformed lines without affecting valid lines
 *
 * Supported separators: :  -  =  ->  =>  →
 * Dash (-) requires spaces on both sides to avoid
 * splitting compound words or hyphenated terms.
 * =====================================================
 */
export function parseTextContent(text) {
  if (!text || typeof text !== 'string') return [];

  const items = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // ─── Pattern 0: Inline Q(question) A(answer) ───
    // Handles: Topic(Keyword) Q(Was ist...?) A(Das ist...)
    // Extracts question and answer, preserving them exactly.
    const qaParenMatch = line.match(/Q\s*\((.+?)\)\s*A\s*\((.+?)\)\s*$/i);
    if (qaParenMatch) {
      items.push({
        term: qaParenMatch[1].trim(),
        definition: qaParenMatch[2].trim(),
        type: 'qa',
      });
      continue;
    }

    // ─── Pattern 1: Multi-line Q: / A: on separate lines ───
    // Handles:
    //   Q: Was machen Sie mit Urlaubsort?
    //   A: Ich benutze Urlaubsort.
    if (/^[Qq]\s*[:.]\s*.+/.test(line) && idx + 1 < lines.length && /^[Aa]\s*[:.]\s*.+/.test(lines[idx + 1])) {
      const q = line.replace(/^[Qq]\s*[:.]\s*/, '').trim();
      const a = lines[idx + 1].replace(/^[Aa]\s*[:.]\s*/, '').trim();
      items.push({ term: q, definition: a, type: 'qa' });
      idx++; // skip the A: line
      continue;
    }

    // ─── Pattern 2: Single-line Q: question / A: answer ───
    const qaSlashMatch = line.match(/^[Qq]\s*[:.]\s*(.+?)\s*[/|]\s*[Aa]\s*[:.]\s*(.+)$/);
    if (qaSlashMatch) {
      items.push({
        term: qaSlashMatch[1].trim(),
        definition: qaSlashMatch[2].trim(),
        type: 'qa',
      });
      continue;
    }

    // ─── Pattern 3: Arrow separators (-> => →) ───
    // Check multi-char arrows BEFORE single-char separators
    const arrowMatch = line.match(/^\s*(.+?)\s*(?:->|=>|→)\s*(.+)\s*$/);
    if (arrowMatch) {
      items.push({
        term: arrowMatch[1].trim(),
        definition: arrowMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 4: Colon separator (term : definition) ───
    const colonMatch = line.match(/^\s*(.+?)\s*:\s*(.+)\s*$/);
    if (colonMatch) {
      items.push({
        term: colonMatch[1].trim(),
        definition: colonMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 5: Equals separator (term = definition) ───
    const equalsMatch = line.match(/^\s*(.+?)\s*=\s*(.+)\s*$/);
    if (equalsMatch) {
      items.push({
        term: equalsMatch[1].trim(),
        definition: equalsMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 6: Dash separator WITH spaces (term - definition) ───
    // Requires at least one space on each side of the dash to avoid
    // destructively splitting compound words like "blu-ray" or articles "A-level".
    const dashMatch = line.match(/^\s*(.+?)\s+[-–—]\s+(.+)\s*$/);
    if (dashMatch) {
      items.push({
        term: dashMatch[1].trim(),
        definition: dashMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 7: Tab-separated "term\tdefinition" ───
    const tabMatch = line.match(/^(.+?)\t+(.+)$/);
    if (tabMatch) {
      items.push({
        term: tabMatch[1].trim(),
        definition: tabMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 8: Numbered items "1. term - definition" ───
    const numberedMatch = line.match(/^\d+[.)]\s*(.+?)\s+[-–—:]\s+(.+)$/);
    if (numberedMatch) {
      items.push({
        term: numberedMatch[1].trim(),
        definition: numberedMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // ─── Pattern 9: "term (translation)" ───
    // Only if the ENTIRE line is term(definition) with nothing after the closing paren
    const parenMatch = line.match(/^(.+?)\s*\((.+)\)$/);
    if (parenMatch && !line.match(/Q\s*\(/i)) {
      items.push({
        term: parenMatch[1].trim(),
        definition: parenMatch[2].trim(),
        type: 'vocabulary',
      });
      continue;
    }
  }

  // Add unique IDs
  return items.map((item, i) => ({
    ...item,
    id: `item_${Date.now()}_${i}`,
  }));
}

/**
 * Extract text from a PDF file using pdf.js
 */
export async function extractTextFromPDF(file) {

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let pageText = '';
    let lastY = -1;
    
    for (const item of content.items) {
      // If Y coordinate changes by more than 5 points, we're on a new line
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      } else if (lastY !== -1) {
        // Same line, add a space if needed (basic heuristic)
        pageText += ' ';
      }
      pageText += item.str;
      lastY = item.transform[5];
    }
    
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

export function autoParseContent(text) {
  // Try structured parsing
  let items = parseTextContent(text);
  
  // Per strict extraction rules: Do not rewrite or filter meaningful words.
  // We strictly return the matched patterns and do not generate random fill-in-the-blanks.
  
  return items;
}
