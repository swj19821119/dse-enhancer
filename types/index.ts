export interface User {
  id: string;
  email: string;
  phone?: string;
  nickname: string;
  avatarUrl?: string;
  grade: 'prep' | 'form3' | 'form4' | 'form5' | 'form6';
  targetLevel: number;
  currentLevel: number;
  learningMode: 'easy' | 'hard';
  isVip: boolean;
  vipExpireAt?: Date;
  parentAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAbility {
  id: string;
  userId: string;
  readingLevel: number;
  listeningLevel: number;
  writingLevel: number;
  speakingLevel: number;
  vocabularyLevel: number;
  grammarLevel: number;
  updatedAt: Date;
}

export interface Vocabulary {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  frequency: number;
  topic?: string;
  example?: string;
  difficulty: number;
  part: 'part_a' | 'part_b';
  createdAt: Date;
}

export interface Question {
  id: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';
  subType?: string;
  part: 'part_a' | 'part_b';
  topic?: string;
  difficulty: number;
  targetGrade?: string;
  content: any;
  answer?: any;
  explanation?: string;
  source?: string;
  year?: number;
  isApproved: boolean;
  createdAt: Date;
}

export interface DailyStudyRecord {
  id: string;
  userId: string;
  studyDate: Date;
  totalMinutes: number;
  totalScore: number;
  vocabularyScore?: number;
  grammarScore?: number;
  readingScore?: number;
  listeningScore?: number;
  writingScore?: number;
  speakingScore?: number;
  learningMode: 'easy' | 'hard';
  completed: boolean;
  speedBonus?: number;
  createdAt: Date;
}
