export interface AvatarConfig {
  top?: string;
  accessories?: string;
  hairColor?: string;
  facialHair?: string;
  clothing?: string;
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  skinColor?: string;
  backgroundColor?: string;
}

export interface User {
  uid: string;
  displayName: string | null;
  xp: number;
  streak: number;
  lastStudyDate: string; // ISO Date string
  setupComplete: boolean;
  hardestSubject: string;
  favoriteSubject: string;
  dailyGoalHours: number;
  avatarConfig: AvatarConfig; // Replaces avatarSeed
}

export enum LessonStatus {
  LOCKED = 'LOCKED',
  OPEN = 'OPEN',
  DONE = 'DONE',
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  status: LessonStatus;
  order: number;
  subject: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface DailyMission {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}
