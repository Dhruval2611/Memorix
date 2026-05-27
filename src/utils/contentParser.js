/* ============================================
   Content Parser — Extract learning items
   from text and PDF content
   ============================================ */

/**
 * Parse raw text content into structured learning items.
 * Extracts key terms, definitions, Q&A pairs, vocabulary.
 */
export function parseTextContent(text) {
  if (!text || typeof text !== 'string') return [];

  const items = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Pattern 1: General Language Pair (handles : - = -> => →)
    const pairMatch = line.match(/^\s*(.+?)\s*(?::|-|=|->|=>|→)\s*(.+?)\s*$/);
    if (pairMatch) {
      let term = pairMatch[1].trim();
      let definition = pairMatch[2].trim();

      const item = {
        term,
        definition,
        type: 'definition',
      };

      items.push(item);
      continue;
    }

    // Pattern 4: "term (translation/meaning)"
    const parenMatch = line.match(/^(.+?)\s*\((.+?)\)$/);
    if (parenMatch && parenMatch[1].split(' ').length <= 4) {
      items.push({
        term: parenMatch[1].trim(),
        definition: parenMatch[2].trim(),
        type: 'vocabulary',
      });
      continue;
    }

    // Pattern 5: "Q: question / A: answer"
    const qaMatch = line.match(/^[Qq]\s*[:.]\s*(.+?)\s*[/|]\s*[Aa]\s*[:.]\s*(.+)$/);
    if (qaMatch) {
      items.push({
        term: qaMatch[1].trim(),
        definition: qaMatch[2].trim(),
        type: 'qa',
      });
      continue;
    }

    // Pattern 6: Tab-separated "term\tdefinition"
    const tabMatch = line.match(/^(.+?)\t+(.+)$/);
    if (tabMatch && tabMatch[1].split(' ').length <= 6) {
      items.push({
        term: tabMatch[1].trim(),
        definition: tabMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // Pattern 7: Numbered items "1. term - definition" or "1) term - definition"
    const numberedMatch = line.match(/^\d+[.)]\s*(.+?)\s*[-–—:]\s+(.+)$/);
    if (numberedMatch && numberedMatch[1].split(' ').length <= 6) {
      items.push({
        term: numberedMatch[1].trim(),
        definition: numberedMatch[2].trim(),
        type: 'definition',
      });
      continue;
    }

    // Pattern 8: "X is Y" or "X means Y" or "X refers to Y"
    const isMatch = line.match(/^(.{2,40}?)\s+(?:is|means|refers to|is defined as)\s+(.{10,})$/i);
    if (isMatch) {
      items.push({
        term: isMatch[1].trim(),
        definition: isMatch[2].trim(),
        type: 'concept',
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
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Auto-detect and parse content - try structured parsing first,
 * then fall back to sentence-based extraction
 */
export function autoParseContent(text) {
  // Try structured parsing first
  let items = parseTextContent(text);
  
  // If very few items found, try sentence-based extraction
  if (items.length < 3) {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 200);
    
    // Create fill-in-the-blank items from sentences
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/);
      // Pick important words (longer words, likely nouns/verbs)
      const importantWords = words.filter(w => 
        w.length > 4 && 
        !/^(the|and|but|for|are|was|were|been|have|has|had|will|would|could|should|with|from|this|that|these|those|which|where|when|what|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|all|each|every|both|few|more|most|other|some|such|only|same|than|very)$/i.test(w)
      );
      
      if (importantWords.length > 0) {
        const targetWord = importantWords[Math.floor(Math.random() * importantWords.length)];
        const blanked = sentence.replace(new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '___');
        items.push({
          id: `item_${Date.now()}_${items.length}`,
          term: targetWord,
          definition: blanked,
          type: 'fill-blank',
        });
      }
    }
  }
  
  return items;
}
