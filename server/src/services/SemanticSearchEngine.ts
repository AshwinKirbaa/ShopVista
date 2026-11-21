import natural from 'natural';

const PorterStemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;
const JaroWinklerDistance = natural.JaroWinklerDistance;

// Domain concept dictionary mapping synonyms & intents to canonical semantic concepts
const CONCEPT_SYNONYMS: Record<string, string[]> = {
  // Device categories
  phone: ['smartphone', 'mobile', 'cellular', 'handset', 'iphone', 'galaxy', 'pixel', 'android', 'ios'],
  laptop: ['notebook', 'macbook', 'ultrabook', 'computer', 'pc', 'chromebook', 'thinkpad'],
  headphone: ['earphone', 'headset', 'earbuds', 'airpods', 'anc', 'audio', 'sound', 'music', 'cans'],
  watch: ['smartwatch', 'wearable', 'timepiece', 'wrist', 'fitness', 'tracker', 'band'],
  mouse: ['trackpad', 'pointer', 'clicker', 'peripheral', 'pointing'],
  tablet: ['ipad', 'pad', 'tab', 'slate'],

  // Hardware intents & features
  wireless: ['bluetooth', 'cordless', 'wifi', 'unwired', 'tws'],
  wired: ['corded', 'cable', 'usb'],
  noise_cancelling: ['anc', 'noise-cancelling', 'cancellation', 'silence', 'ambient'],
  gaming: ['gamer', 'rgb', 'esports', 'rtx', 'fps', 'low latency'],
  storage: ['rom', 'ssd', 'hdd', 'gb', 'tb', 'memory', 'space'],
  camera: ['photography', 'sensor', 'lens', 'megapixel', 'zoom', 'video'],
  fast: ['performance', 'speed', 'm1', 'm2', 'm3', 'm4', 'm5', 'snapdragon', 'bionic'],
  affordable: ['budget', 'cheap', 'value', 'economical', 'low price'],
  premium: ['flagship', 'pro', 'ultra', 'luxury', 'titanium', 'high end'],
};

// Inverted concept lookup
const TERM_TO_CONCEPTS: Map<string, string[]> = new Map();
for (const [concept, synonyms] of Object.entries(CONCEPT_SYNONYMS)) {
  const allTerms = [concept, ...synonyms];
  for (const t of allTerms) {
    const stem = PorterStemmer.stem(t.toLowerCase());
    const existing = TERM_TO_CONCEPTS.get(stem) || [];
    if (!existing.includes(concept)) existing.push(concept);
    TERM_TO_CONCEPTS.set(stem, existing);
    TERM_TO_CONCEPTS.set(t.toLowerCase(), existing);
  }
}

export interface SemanticSearchResult<T> {
  item: T;
  score: number;
  matchReasons: string[];
}

export class SemanticSearchEngine {
  /**
   * Tokenize and stem query terms
   */
  static tokenizeAndStem(text: string): string[] {
    const tokens = natural.WordTokenizer ? new natural.WordTokenizer().tokenize(text.toLowerCase()) || [] : text.toLowerCase().split(/\W+/);
    return tokens
      .filter((t: string) => t.length > 1)
      .map((t: string) => PorterStemmer.stem(t));
  }

  /**
   * Extract high-level semantic concepts from input text
   */
  static extractConcepts(text: string): Set<string> {
    const concepts = new Set<string>();
    const tokens = text.toLowerCase().split(/[\s,./\-_()]+/).filter(Boolean);

    for (const tok of tokens) {
      const direct = TERM_TO_CONCEPTS.get(tok);
      if (direct) direct.forEach(c => concepts.add(c));
      const stem = PorterStemmer.stem(tok);
      const stemmed = TERM_TO_CONCEPTS.get(stem);
      if (stemmed) stemmed.forEach(c => concepts.add(c));
    }
    return concepts;
  }

  /**
   * Calculate semantic similarity between a query and a target document
   */
  static scoreSemanticMatch(
    query: string,
    target: { title: string; description?: string; category?: string; specs?: any }
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const normQuery = query.toLowerCase().trim();
    const fullTargetText = `${target.title} ${target.description || ''} ${target.category || ''}`.toLowerCase();

    // 1. Exact Substring Match (Highest priority)
    if (fullTargetText.includes(normQuery)) {
      score += 0.5;
      reasons.push('exact_phrase_match');
    }

    // 2. Semantic Concept Overlap
    const queryConcepts = this.extractConcepts(normQuery);
    const targetConcepts = this.extractConcepts(fullTargetText);

    let sharedConcepts = 0;
    for (const qc of queryConcepts) {
      if (targetConcepts.has(qc)) {
        sharedConcepts++;
        reasons.push(`concept:${qc}`);
      }
    }

    if (queryConcepts.size > 0) {
      const conceptScore = (sharedConcepts / queryConcepts.size) * 0.35;
      score += conceptScore;
    }

    // 3. Stemmed Word Token Jaccard & TF-IDF
    const queryStems = this.tokenizeAndStem(normQuery);
    const targetStems = new Set(this.tokenizeAndStem(fullTargetText));

    let matchedStems = 0;
    for (const qs of queryStems) {
      if (targetStems.has(qs)) {
        matchedStems++;
      }
    }

    if (queryStems.length > 0) {
      const stemScore = (matchedStems / queryStems.length) * 0.25;
      score += stemScore;
      if (matchedStems > 0) {
        reasons.push(`terms:${matchedStems}/${queryStems.length}`);
      }
    }

    // 4. Jaro-Winkler Fuzzy String Distance for Typos
    const jaroScore = JaroWinklerDistance(normQuery, target.title.toLowerCase().slice(0, normQuery.length * 2));
    if (jaroScore > 0.8) {
      score += (jaroScore - 0.8) * 0.2;
      reasons.push(`fuzzy:${jaroScore.toFixed(2)}`);
    }

    return { score: Math.min(1, score), reasons };
  }

  /**
   * Reranks a list of products using semantic relevance
   */
  static rankProducts<T extends { name?: string; title?: string; description?: string; category?: any }>(
    query: string,
    items: T[],
    minScoreThreshold = 0.15
  ): Array<SemanticSearchResult<T>> {
    const scored = items.map((item) => {
      const title = item.name || item.title || '';
      const categoryName = typeof item.category === 'object' ? item.category?.name : (item.category || '');
      const match = this.scoreSemanticMatch(query, {
        title,
        description: item.description,
        category: categoryName,
      });

      return {
        item,
        score: match.score,
        matchReasons: match.reasons,
      };
    });

    return scored
      .filter((s) => s.score >= minScoreThreshold)
      .sort((a, b) => b.score - a.score);
  }
}
