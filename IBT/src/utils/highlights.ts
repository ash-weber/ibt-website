/**
 * Auto-generates key highlights and features from card content (description, title, tags).
 * Ensures every highlight item is a clean, single-line phrase under ~40 characters.
 */
export function generateKeyHighlights(
  description?: string | null,
  title?: string | null,
  tags?: string[] | null,
  explicitFeatures?: string[] | null
): string[] {
  // If explicit features are provided, clean and sanitize them
  if (explicitFeatures && explicitFeatures.length > 0) {
    return explicitFeatures.map((f) => cleanHighlightPhrase(f));
  }

  const highlights: string[] = [];

  const cleanText = (raw: string) => {
    return raw
      .replace(/<ul class="custom-key-highlights"[^>]*>[\s\S]*?<\/ul>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const rawDesc = description || '';
  const textContent = cleanText(rawDesc);
  const combinedContext = (textContent + ' ' + (title || '') + ' ' + (tags || []).join(' ')).toLowerCase();

  // 1. Try extracting explicit HTML list items <li>...</li>
  const liMatches = rawDesc.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    for (const item of liMatches) {
      const cleaned = cleanHighlightPhrase(cleanText(item));
      if (cleaned.length >= 3 && cleaned.length <= 50 && !highlights.includes(cleaned)) {
        highlights.push(cleaned);
      }
    }
  }

  // 2. Extract actual meaningful phrases & clauses directly from user description
  if (highlights.length < 4 && textContent.length > 0) {
    const rawParts = rawDesc
      .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, ' ');

    const parts = cleanText(rawParts)
      .split(/(?:\n|\. |; | \| |,\s*(?=[A-Z0-9]))/g)
      .map((p) => p.trim())
      .filter((p) => p.length >= 5);

    for (let part of parts) {
      if (highlights.length >= 4) break;

      let concise = part
        .replace(/^(the|a|an)\s+/i, '')
        .replace(/^.*?website\s+(showcases|features|provides|offers)\s*/i, '')
        .replace(/^.*?is\s+(an?|the)\s+(innovative|smart|custom|modern|advanced|trusted)?\s*(platform|tool|system|app|solution|ecosystem|website)?\s*(designed|built|created)?\s*(to|for)?\s*/i, '')
        .replace(/^(designed|built|created)\s+(to|for)\s*/i, '')
        .replace(/^our mission is to\s*/i, '')
        .replace(/^with\s+.*?\s*/i, '')
        .trim();

      const words = concise.split(/\s+/);
      if (words.length > 6) {
        concise = words.slice(0, 6).join(' ');
      }

      concise = cleanHighlightPhrase(concise);

      if (concise.length >= 4 && concise.length <= 48 && !highlights.includes(concise)) {
        highlights.push(concise);
      }
    }
  }

  // 3. Extract domain-specific highlights if user description doesn't yield enough clauses
  const domainRules: Array<{ regex: RegExp; highlight: string }> = [
    { regex: /ai|machine learning|intelligence|roadmap|growth|coach/i, highlight: 'AI-Driven Performance Optimization' },
    { regex: /feedback|evaluation|rating|review|score/i, highlight: 'Automated Feedback & Growth System' },
    { regex: /realtime|real-time|socket|websocket|live|dashboard/i, highlight: 'Realtime Dashboard Reporting' },
    { regex: /security|secure|encryption|auth|cloud|api/i, highlight: 'Integrated Security & Cloud APIs' },
    { regex: /scale|scalable|architecture|performance|ssr/i, highlight: 'High Performance Scalable Engine' },
    { regex: /workflow|analytic|insight|stat|track/i, highlight: 'Custom User Workflows & Analytics' },
    { regex: /mobile|flutter|app|ios|android/i, highlight: 'Cross-Platform Mobile Application' },
    { regex: /team|empower|collaborate|organization/i, highlight: 'Collaborative Team Management' },
    { regex: /ecommerce|payment|checkout|cart|store/i, highlight: 'Digital Storefront Architecture' },
    { regex: /ats|resume|job|career|portal/i, highlight: 'Automated Candidate Pipeline' },
    { regex: /ehr|hospital|patient|health|medical/i, highlight: 'Electronic Health Records Portal' },
    { regex: /jewellery|gold|diamond|gemstone/i, highlight: 'Jewellery Search & Filter System' },
  ];

  for (const rule of domainRules) {
    if (highlights.length >= 4) break;
    if (rule.regex.test(combinedContext) && !highlights.includes(rule.highlight)) {
      highlights.push(rule.highlight);
    }
  }

  // 4. Fallback defaults if list is still less than 4 items
  const titleClean = (title || '').trim();
  const defaults = [
    titleClean ? `${titleClean} Core Features` : 'High Performance Scalable Engine',
    'Custom Workflows & Analytics',
    'Integrated Security & Cloud APIs',
    'Realtime Dashboard Reporting',
  ];

  for (const def of defaults) {
    if (highlights.length >= 4) break;
    if (!highlights.includes(def)) {
      highlights.push(def);
    }
  }

  return highlights.slice(0, 4);
}

/**
 * Helper to ensure a phrase is clean, properly capitalized, and free of trailing punctuation or '...'.
 */
function cleanHighlightPhrase(phrase: string): string {
  let cleaned = phrase
    .replace(/\.{2,}/g, '')
    .replace(/[,;:\-\s]+$/, '')
    .trim();

  if (!cleaned) return 'Key Feature Highlight';

  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned;
}
