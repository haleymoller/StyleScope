// Mock Virginia Woolf text passages and analysis functions

export const sampleWoolfText = `She was thinking, her book yielding to the vision that had created it. (And indeed it was impossible to think of her, of Virginia Woolf, now, without seeing her as she was in that last struggle with madness.) The flowers in the window box (how they remind her of childhood summers in Cornwall) seemed to pulse with life. Mrs. Ramsay, she thought, would understand. (Time passes, she had written, but does it really?) The waves continued their eternal conversation with the shore.

In the distance, she could hear the voices of children (their laughter mixing with the cry of gulls), and she was reminded of those long afternoons at Monk's House. (Leonard would be in his study now, she knew, working on his political pamphlets.) The manuscript before her seemed both foreign and familiar. (Could words truly capture the flow of consciousness?)

She paused, remembering how her sister Vanessa had painted (with such bold strokes) the portrait that now hung in the drawing room. (Art, she mused, was perhaps the only honest response to existence.) The parenthetical thoughts that filled her mind (like tributaries feeding a great river) found their way onto the page.`;

export const sampleAnalysisData = {
  totalWords: 156,
  parentheticalSpans: 8,
  perThousandWords: 51.3,
  medianSpanLength: 7,
  spans: [
    {
      id: 1,
      text: "And indeed it was impossible to think of her, of Virginia Woolf, now, without seeing her as she was in that last struggle with madness.",
      context: "She was thinking, her book yielding to the vision that had created it. (And indeed it was impossible to think of her, of Virginia Woolf, now, without seeing her as she was in that last struggle with madness.) The flowers in the window box",
      startIndex: 84,
      tokens: 26,
      position: 0.12
    },
    {
      id: 2,
      text: "how they remind her of childhood summers in Cornwall",
      context: "The flowers in the window box (how they remind her of childhood summers in Cornwall) seemed to pulse with life.",
      startIndex: 245,
      tokens: 9,
      position: 0.28
    },
    {
      id: 3,
      text: "Time passes, she had written, but does it really?",
      context: "Mrs. Ramsay, she thought, would understand. (Time passes, she had written, but does it really?) The waves continued their eternal conversation with the shore.",
      startIndex: 356,
      tokens: 9,
      position: 0.35
    },
    {
      id: 4,
      text: "their laughter mixing with the cry of gulls",
      context: "In the distance, she could hear the voices of children (their laughter mixing with the cry of gulls), and she was reminded of those long afternoons at Monk's House.",
      startIndex: 498,
      tokens: 8,
      position: 0.52
    },
    {
      id: 5,
      text: "Leonard would be in his study now, she knew, working on his political pamphlets.",
      context: "and she was reminded of those long afternoons at Monk's House. (Leonard would be in his study now, she knew, working on his political pamphlets.) The manuscript before her seemed both foreign and familiar.",
      startIndex: 612,
      tokens: 15,
      position: 0.61
    },
    {
      id: 6,
      text: "Could words truly capture the flow of consciousness?",
      context: "The manuscript before her seemed both foreign and familiar. (Could words truly capture the flow of consciousness?) She paused, remembering how her sister Vanessa had painted",
      startIndex: 724,
      tokens: 9,
      position: 0.71
    },
    {
      id: 7,
      text: "with such bold strokes",
      context: "She paused, remembering how her sister Vanessa had painted (with such bold strokes) the portrait that now hung in the drawing room.",
      startIndex: 833,
      tokens: 4,
      position: 0.81
    },
    {
      id: 8,
      text: "Art, she mused, was perhaps the only honest response to existence.",
      context: "the portrait that now hung in the drawing room. (Art, she mused, was perhaps the only honest response to existence.) The parenthetical thoughts that filled her mind",
      startIndex: 912,
      tokens: 12,
      position: 0.89
    }
  ]
};

export const mockClassifications = {
  1: ["interiority", "reflection"],
  2: ["scene-setting", "memory"], 
  3: ["interiority", "philosophy"],
  4: ["scene-setting", "sensory"],
  5: ["aside", "character"],
  6: ["interiority", "philosophy"],
  7: ["aside", "description"],
  8: ["interiority", "philosophy"]
};

export function analyzeText(text: string) {
  // Simple parentheses extraction for demo purposes
  const parenthesesRegex = /\([^)]+\)/g;
  const matches = [...text.matchAll(parenthesesRegex)];
  const words = text.split(/\s+/).length;
  
  const spans = matches.map((match, index) => {
    const fullMatch = match[0];
    const innerText = fullMatch.slice(1, -1); // Remove parentheses
    const startIndex = match.index || 0;
    const tokens = innerText.split(/\s+/).length;
    
    // Get context (±50 characters)
    const contextStart = Math.max(0, startIndex - 50);
    const contextEnd = Math.min(text.length, startIndex + fullMatch.length + 50);
    const context = text.slice(contextStart, contextEnd);
    
    return {
      id: index + 1,
      text: innerText,
      context,
      startIndex,
      tokens,
      position: startIndex / text.length
    };
  });
  
  const spanLengths = spans.map(s => s.tokens);
  const medianLength = spanLengths.length > 0 
    ? spanLengths.sort((a, b) => a - b)[Math.floor(spanLengths.length / 2)]
    : 0;
  
  return {
    totalWords: words,
    parentheticalSpans: spans.length,
    perThousandWords: words > 0 ? (spans.length / words) * 1000 : 0,
    medianSpanLength: medianLength,
    spans
  };
}

export const longestSpans = [
  "And indeed it was impossible to think of her, of Virginia Woolf, now, without seeing her as she was in that last struggle with madness.",
  "Leonard would be in his study now, she knew, working on his political pamphlets.",
  "Art, she mused, was perhaps the only honest response to existence.",
  "how they remind her of childhood summers in Cornwall",
  "Time passes, she had written, but does it really?",
  "Could words truly capture the flow of consciousness?",
  "their laughter mixing with the cry of gulls",
  "with such bold strokes"
];
