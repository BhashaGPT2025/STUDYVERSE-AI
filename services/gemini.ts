import { GoogleGenAI, Type } from "@google/genai";
import { Lesson, LessonStatus, AvatarConfig } from "../types";

// Initialize the Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_FAST = "gemini-3-flash-preview";
const MODEL_SMART = "gemini-3-pro-preview";

/**
 * Generates avatar configuration from a description.
 */
export const generateAvatarConfig = async (description: string): Promise<AvatarConfig> => {
  if (!process.env.API_KEY) {
    return { top: 'longHair', hairColor: 'pink' }; // Mock fallback
  }

  const prompt = `
    Generate a DiceBear Avataaars configuration JSON based on this description: "${description}".
    
    Allowed Options (pick one string for each key):
    - top: [longHair, shortHair, eyepatch, hat, hijab, turban, winterHat1, winterHat2, bob, bun, curly, curvy, dreads, frida, fro, froBand, miaWallace, shavedSides, straight01, straight02]
    - accessories: [kurt, prescription01, prescription02, round, sunglasses, wayfarers]
    - hairColor: [auburn, black, blonde, brown, pastelPink, platinum, red, silverGray]
    - facialHair: [beardLight, beardMajestic, moustacheMagnum]
    - clothing: [blazerAndShirt, blazerAndSweater, collarAndSweater, graphicShirt, hoodie, overall, shirtCrewNeck, shirtScoopNeck, shirtVNeck]
    - eyes: [close, cry, default, dizzy, eyeRoll, happy, hearts, side, squint, surprised, wink, winkWacky]
    - eyebrows: [angry, default, raisedExcited, sadConcerned]
    - mouth: [concerned, default, disbelief, eating, grimace, sad, scream, smile, tongue, twinkle, vomit]
    - skinColor: [tanned, yellow, pale, light, brown, darkBrown, black]
    
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            top: { type: Type.STRING },
            accessories: { type: Type.STRING },
            hairColor: { type: Type.STRING },
            facialHair: { type: Type.STRING },
            clothing: { type: Type.STRING },
            eyes: { type: Type.STRING },
            eyebrows: { type: Type.STRING },
            mouth: { type: Type.STRING },
            skinColor: { type: Type.STRING },
          }
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Avatar gen failed", error);
    return { top: 'shortHair', clothing: 'hoodie' };
  }
};

/**
 * Generates a list of gamified lessons based on raw syllabus text.
 */
export const generateSyllabus = async (
  syllabusText: string,
  days: number,
  hardestTopic: string
): Promise<Lesson[]> => {
  if (!process.env.API_KEY) {
    return mockSyllabus(syllabusText);
  }

  const prompt = `
    The user has a specific syllabus:
    "${syllabusText}"
    
    They have ${days} days to study this.
    Their hardest topic is: ${hardestTopic}.
    
    Break this syllabus down into 10-15 logical, gamified "levels" or lessons.
    Title them creatively (like RPG quests or adventure levels) but keep the subject clear.
    Add a short, fun description for each.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `lesson-${Date.now()}-${index}`,
      title: item.title,
      description: item.description,
      status: index === 0 ? LessonStatus.OPEN : LessonStatus.LOCKED,
      order: index,
      subject: "Custom Syllabus",
    }));
  } catch (error) {
    console.error("Gemini syllabus generation failed", error);
    return mockSyllabus(syllabusText);
  }
};

/**
 * Chat with Nova (the AI tutor).
 */
export const chatWithNova = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentLesson: string,
  userMessage: string
): Promise<string> => {
  if (!process.env.API_KEY) return "I need an API Key to think! (Check metadata.json)";

  const chat = ai.chats.create({
    model: MODEL_SMART,
    config: {
      systemInstruction: `You are Nova, an elite study companion.
      The student is currently in a deep work session for the lesson: "${currentLesson}".
      
      Your goal is to clarify doubts instantly so they can get back to studying.
      Keep answers concise, precise, and encouraging.
      If they ask for an explanation, give a simple analogy first.`,
    },
    history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
  });

  const result = await chat.sendMessage({ message: userMessage });
  return result.text || "I'm lost for words!";
};


// --- MOCKS ---

const mockSyllabus = (text: string): Lesson[] => {
  const topic = text.substring(0, 15) + "...";
  return [
    { id: 'l1', title: `The Journey Begins: ${topic}`, description: "Overview and initial concepts", status: LessonStatus.OPEN, order: 0, subject: text },
    { id: 'l2', title: `Deep Dive I`, description: "Core theories and definitions", status: LessonStatus.LOCKED, order: 1, subject: text },
    { id: 'l3', title: `The Obstacle`, description: "Tackling the hardest parts", status: LessonStatus.LOCKED, order: 2, subject: text },
    { id: 'l4', title: `Skill Check`, description: "Applying what you learned", status: LessonStatus.LOCKED, order: 3, subject: text },
    { id: 'l5', title: `Mastery Level`, description: "Advanced applications", status: LessonStatus.LOCKED, order: 4, subject: text },
    { id: 'l6', title: `Final Boss`, description: "Complete syllabus review", status: LessonStatus.LOCKED, order: 5, subject: text },
  ];
};
