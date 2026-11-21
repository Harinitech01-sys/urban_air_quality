import fs from 'fs';
import path from 'path';

export interface KnowledgeSnippet {
  id: string;
  sourceFile: string;
  section: string;
  content: string;
}

let cachedSnippets: KnowledgeSnippet[] | null = null;

export function loadKnowledgeSnippets(): KnowledgeSnippet[] {
  if (cachedSnippets) return cachedSnippets;

  const knowledgeDir = path.join(process.cwd(), 'knowledge');
  const snippets: KnowledgeSnippet[] = [];

  try {
    if (!fs.existsSync(knowledgeDir)) {
      return [];
    }

    const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const fullPath = path.join(knowledgeDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Split into sections by H2
      const sections = content.split(/^##\s+/m);
      const title = sections[0].replace(/^#\s+/m, '').trim();

      for (let i = 1; i < sections.length; i++) {
        const secText = sections[i];
        const lines = secText.split('\n');
        const header = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();

        snippets.push({
          id: `${file}_sec_${i}`,
          sourceFile: file,
          section: `${title} -> ${header}`,
          content: body,
        });
      }
    }

    cachedSnippets = snippets;
    return snippets;
  } catch (err) {
    console.error('Error loading knowledge snippets:', err);
    return [];
  }
}

/**
 * Retrieves the top K relevant snippets for a given query.
 */
export function retrieveKnowledge(query: string, topK = 3): KnowledgeSnippet[] {
  const snippets = loadKnowledgeSnippets();
  if (snippets.length === 0) return [];

  const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = snippets.map(snippet => {
    const text = (snippet.section + ' ' + snippet.content).toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      if (snippet.section.toLowerCase().includes(term)) {
        score += 5; // Heavy weight for header match
      }
      if (text.includes(term)) {
        score += 2;
      }
    }

    return { snippet, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.snippet);
}

export function formatRetrievedContext(snippets: KnowledgeSnippet[]): string {
  if (snippets.length === 0) return 'No specific knowledge snippets retrieved.';
  return snippets
    .map(s => `[SOURCE: ${s.sourceFile} | ${s.section}]\n${s.content}`)
    .join('\n\n---\n\n');
}
