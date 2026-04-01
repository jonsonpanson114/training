// Prompt types
export type PromptCategory = 'basic' | 'emotion' | 'work' | 'abduction' | 'synapse' | 'metaphor' | 'metaphor-coach' | 'analogy' | 'fogcatcher' | 'whysos' | 'sowhat' | '5w1h' | 'prep' | 'abduction-lens';
export type PromptType = 'fixed' | 'dynamic';

export interface Prompt {
  id: string;
  category: PromptCategory;
  type: PromptType;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  order?: number;
}

export interface DynamicPrompt {
  category: PromptCategory;
  title: string;
  description: string;
  generatedContent?: string;
  imageUrl?: string;
}

// Entry types
export interface Entry {
  id: string;
  userId: string;
  promptId?: string;
  category: PromptCategory;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Abduction specific
export interface AbductionEntry extends Entry {
  observations: string[];
  hypotheses: Array<{
    hypothesis: string;
    reasoning: string;
  }>;
  scores?: {
    logic: number;
    creativity: number;
    persuasiveness: number;
    total: number;
  };
  feedback?: string;
}

// Synapse Match specific
export interface SynapseEntry extends Entry {
  word1: string;
  word2: string;
  connections: string[];
  score?: number;
  feedback?: string;
}

// Metaphor Maker specific
export interface MetaphorEntry extends Entry {
  concept: string;
  metaphor: string;
  scores?: {
    clarity: number;
    appropriateness: number;
    total: number;
  };
  feedback?: string;
}

// Fog Catcher specific
export interface FogCatcherEntry extends Entry {
  keywords: string[];
  themes: string[];
}

// AI Feedback types
export interface AIFeedback {
  score: number;
  feedback: string;
  suggestions?: string[];
}

// Streak types
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  lastEntryDate?: Date;
}

// Analogy Training specific
export interface AnalogyEntry extends Entry {
  theme: string;
  bigTheme: string;
  mindMap?: {
    themeElements: string[];
    bigThemeElements: string[];
    connections: string[];
  };
  solutions: string[];
}

// Metaphor Coach specific
export interface MetaphorCoachEntry extends Entry {
  target: string;
  features: string[];
  associations: string[];
  tone: string;
  comparison: string;
  refinement: string;
}
