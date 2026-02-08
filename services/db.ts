import { Lesson, User, LessonStatus, AvatarConfig } from "../types";

const KEY_USER = 'studyverse_user';
const KEY_LESSONS = 'studyverse_lessons';

// Default Avatar Configuration
const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: 'light',
  top: 'shortHair',
  hairColor: 'brown',
  clothing: 'hoodie',
  eyes: 'happy',
  mouth: 'smile',
  backgroundColor: 'b6e3f4'
};

export const getUser = async (): Promise<User | null> => {
  const data = localStorage.getItem(KEY_USER);
  return data ? JSON.parse(data) : null;
};

export const createUser = async (setupData: Partial<User>): Promise<User> => {
  const newUser: User = {
    uid: 'user-' + Date.now(),
    displayName: 'Traveler',
    xp: 0,
    streak: 0,
    lastStudyDate: new Date().toISOString(),
    setupComplete: true,
    hardestSubject: setupData.hardestSubject || '',
    favoriteSubject: setupData.favoriteSubject || '',
    dailyGoalHours: setupData.dailyGoalHours || 1,
    avatarConfig: DEFAULT_AVATAR,
  };
  localStorage.setItem(KEY_USER, JSON.stringify(newUser));
  return newUser;
};

export const updateUserAvatar = async (config: AvatarConfig): Promise<User> => {
  const user = await getUser();
  if (!user) throw new Error("No user");
  user.avatarConfig = config;
  localStorage.setItem(KEY_USER, JSON.stringify(user));
  return user;
};

export const updateUserXP = async (amount: number): Promise<User> => {
  const user = await getUser();
  if (!user) throw new Error("No user");
  
  const today = new Date().toDateString();
  const last = new Date(user.lastStudyDate).toDateString();
  
  if (today !== last) {
    user.streak += 1;
    user.lastStudyDate = new Date().toISOString();
  }

  user.xp += amount;
  localStorage.setItem(KEY_USER, JSON.stringify(user));
  return user;
};

export const getLessons = async (): Promise<Lesson[]> => {
  const data = localStorage.getItem(KEY_LESSONS);
  return data ? JSON.parse(data) : [];
};

export const saveLessons = async (lessons: Lesson[]) => {
  localStorage.setItem(KEY_LESSONS, JSON.stringify(lessons));
};

export const completeLesson = async (lessonId: string) => {
  const lessons = await getLessons();
  const index = lessons.findIndex(l => l.id === lessonId);
  
  if (index !== -1) {
    lessons[index].status = LessonStatus.DONE;
    if (index + 1 < lessons.length) {
      lessons[index + 1].status = LessonStatus.OPEN;
    }
    await saveLessons(lessons);
  }
};
