export type QuestionType = "single" | "multiple";

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string | string[];
  analysis: string;
  type: QuestionType;
}

export interface AnswerRecord {
  questionId: number;
  userAnswer: string[];
  isCorrect: boolean;
  correctAnswer: string[];
  answeredAt: string;
  attemptNumber: number;
  isFavorite: boolean;
  isWrongBook: boolean;
}

export interface QuizState {
  latestByQuestion: Record<number, AnswerRecord>;
  history: AnswerRecord[];
  favorites: number[];
  wrongBook: number[];
}

export type RouteName =
  | "home"
  | "practice"
  | "wrong"
  | "favorites"
  | "history"
  | "statistics";
