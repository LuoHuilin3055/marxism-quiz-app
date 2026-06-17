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
  isCompleted?: boolean;
  correctCount?: number;
  wrongCount?: number;
  correctAnswer: string[];
  answeredAt: string;
  attemptNumber: number;
  isFavorite: boolean;
  isWrongBook: boolean;
}

export interface SequenceProgress {
  currentQuestionId: number;
  currentIndex: number;
  completedCount: number;
  lastPracticedAt: string;
  isCompleted: boolean;
}

export type PracticeMode = "sequence" | "random" | "wrong" | "favorite" | "normal";

export interface QuizState {
  latestByQuestion: Record<number, AnswerRecord>;
  history: AnswerRecord[];
  favorites: number[];
  wrongBook: number[];
  sequenceProgress?: SequenceProgress;
}

export type RouteName =
  | "home"
  | "practice"
  | "wrong"
  | "favorites"
  | "history"
  | "statistics";
