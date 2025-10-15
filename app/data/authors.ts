export type AuthorKey = "Woolf" | "Joyce" | "Eliot" | "Faulkner";

export interface AuthorMetrics {
  name: AuthorKey;
  avgParenthesisTokens: number;
  per1k: number;
  chapterDistribution: Array<{ chapter: number; value: number }>;
}

export const authors: Record<AuthorKey, AuthorMetrics> = {
  Woolf: {
    name: "Woolf",
    avgParenthesisTokens: 11.2,
    per1k: 52,
    chapterDistribution: [
      { chapter: 1, value: 0.4 },
      { chapter: 2, value: 0.6 },
      { chapter: 3, value: 0.5 },
      { chapter: 4, value: 0.62 },
      { chapter: 5, value: 0.58 },
    ],
  },
  Joyce: {
    name: "Joyce",
    avgParenthesisTokens: 9.4,
    per1k: 38,
    chapterDistribution: [
      { chapter: 1, value: 0.3 },
      { chapter: 2, value: 0.32 },
      { chapter: 3, value: 0.36 },
      { chapter: 4, value: 0.31 },
      { chapter: 5, value: 0.34 },
    ],
  },
  Eliot: {
    name: "Eliot",
    avgParenthesisTokens: 7.8,
    per1k: 25,
    chapterDistribution: [
      { chapter: 1, value: 0.2 },
      { chapter: 2, value: 0.22 },
      { chapter: 3, value: 0.28 },
      { chapter: 4, value: 0.27 },
      { chapter: 5, value: 0.26 },
    ],
  },
  Faulkner: {
    name: "Faulkner",
    avgParenthesisTokens: 12.6,
    per1k: 44,
    chapterDistribution: [
      { chapter: 1, value: 0.35 },
      { chapter: 2, value: 0.41 },
      { chapter: 3, value: 0.39 },
      { chapter: 4, value: 0.45 },
      { chapter: 5, value: 0.47 },
    ],
  },
};


