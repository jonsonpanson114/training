/**
 * Gamification utility for Verbalize
 */

export interface UserStats {
  exp: number;
  level: number;
  totalEntries: number;
  streak: number;
  badges: string[];
}

export const LEVEL_EXP_BASE = 100;
export const LEVEL_EXP_MULTIPLIER = 1.2;

/**
 * Calculate level based on EXP
 * Level 1: 0 - 99
 * Level 2: 100 - 219 (100 * 1.2)
 */
export function calculateLevel(exp: number): number {
  let level = 1;
  let remainingExp = exp;
  let nextLevelExp = LEVEL_EXP_BASE;

  while (remainingExp >= nextLevelExp) {
    remainingExp -= nextLevelExp;
    level++;
    nextLevelExp = Math.floor(nextLevelExp * LEVEL_EXP_MULTIPLIER);
  }

  return level;
}

/**
 * Calculate EXP gained for an entry
 */
export function calculateExpGain(content: string, score: number = 70): number {
  // Base EXP for completion
  let exp = 20;

  // Length bonus (1 EXP per 50 characters, max 30)
  const lengthBonus = Math.min(Math.floor(content.length / 50), 30);
  exp += lengthBonus;

  // Score bonus (0.5 EXP per score point above 50)
  if (score > 50) {
    exp += Math.floor((score - 50) * 0.5);
  }

  return exp;
}

/**
 * Get Rank name based on level
 */
export function getRankName(level: number): string {
  const ranks = [
    '思考の種まき',
    '言葉の芽生え',
    '表現のアプレンティス',
    '言語の職人',
    '思考の彫刻家',
    '意味の建築家',
    '知性の詩人',
    '言語の錬金術師',
    '真理の語り手',
    '言葉のマスター',
    '無音の哲学者'
  ];
  return ranks[Math.min(Math.floor((level - 1) / 5), ranks.length - 1)];
}

/**
 * Check for newly unlocked badges
 */
export function checkBadges(stats: UserStats): string[] {
  const newBadges: string[] = [];
  
  if (stats.totalEntries >= 1 && !stats.badges.includes('first_step')) {
    newBadges.push('first_step'); // はじめての言語化
  }
  if (stats.streak >= 3 && !stats.badges.includes('streak_3')) {
    newBadges.push('streak_3'); // 三日坊主卒業
  }
  if (stats.streak >= 7 && !stats.badges.includes('streak_7')) {
    newBadges.push('streak_7'); // 継続の達人
  }
  if (stats.level >= 5 && !stats.badges.includes('level_5')) {
    newBadges.push('level_5'); // 中級者
  }
  
  return newBadges;
}
