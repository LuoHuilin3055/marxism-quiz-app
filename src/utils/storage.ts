import { AnswerRecord, QuizState, SequenceProgress } from "../types";

const STORAGE_KEY = "marxism_quiz_state_v1";

const emptyState: QuizState = {
  latestByQuestion: {},
  history: [],
  favorites: [],
  wrongBook: [],
  sequenceProgress: undefined,
};

function unique(values: number[]): number[] {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function normalizeRecord(
  record: AnswerRecord,
  history: AnswerRecord[],
): AnswerRecord {
  const attempts = history.filter((item) => item.questionId === record.questionId);
  const correctCount =
    record.correctCount ?? attempts.filter((item) => item.isCorrect).length;
  const wrongCount =
    record.wrongCount ?? attempts.filter((item) => !item.isCorrect).length;

  return {
    ...record,
    isCompleted: record.isCompleted ?? (correctCount > 0 || record.isCorrect),
    correctCount,
    wrongCount,
  };
}

export function loadQuizState(): QuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    const history = parsed.history ?? [];
    const latestByQuestion = Object.fromEntries(
      Object.entries(parsed.latestByQuestion ?? {}).map(([questionId, record]) => [
        questionId,
        normalizeRecord(record, history),
      ]),
    );
    return {
      latestByQuestion,
      history,
      favorites: unique(parsed.favorites ?? []),
      wrongBook: unique(parsed.wrongBook ?? []),
      sequenceProgress: parsed.sequenceProgress,
    };
  } catch {
    return emptyState;
  }
}

export function saveQuizState(state: QuizState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordAnswer(
  state: QuizState,
  questionId: number,
  userAnswer: string[],
  correctAnswer: string[],
  isCorrect: boolean,
): QuizState {
  const previousAttempts = state.history.filter(
    (record) => record.questionId === questionId,
  ).length;
  const previousRecord = state.latestByQuestion[questionId];
  const isFavorite = state.favorites.includes(questionId);
  const wrongBook = isCorrect
    ? state.wrongBook.filter((id) => id !== questionId)
    : unique([...state.wrongBook, questionId]);
  const correctCount = (previousRecord?.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const wrongCount = (previousRecord?.wrongCount ?? 0) + (isCorrect ? 0 : 1);

  const record: AnswerRecord = {
    questionId,
    userAnswer,
    isCorrect,
    isCompleted: Boolean(previousRecord?.isCompleted || isCorrect),
    correctCount,
    wrongCount,
    correctAnswer,
    answeredAt: new Date().toISOString(),
    attemptNumber: previousAttempts + 1,
    isFavorite,
    isWrongBook: !isCorrect,
  };

  const nextState: QuizState = {
    ...state,
    latestByQuestion: {
      ...state.latestByQuestion,
      [questionId]: record,
    },
    history: [record, ...state.history],
    wrongBook,
  };
  saveQuizState(nextState);
  return nextState;
}

export function saveSequenceProgress(
  state: QuizState,
  progress: Omit<SequenceProgress, "lastPracticedAt">,
): QuizState {
  const nextState: QuizState = {
    ...state,
    sequenceProgress: {
      ...progress,
      lastPracticedAt: new Date().toISOString(),
    },
  };
  saveQuizState(nextState);
  return nextState;
}

export function toggleFavorite(state: QuizState, questionId: number): QuizState {
  const isFavorite = state.favorites.includes(questionId);
  const favorites = isFavorite
    ? state.favorites.filter((id) => id !== questionId)
    : unique([...state.favorites, questionId]);

  const latest = state.latestByQuestion[questionId];
  const nextState: QuizState = {
    ...state,
    favorites,
    latestByQuestion: latest
      ? {
          ...state.latestByQuestion,
          [questionId]: { ...latest, isFavorite: !isFavorite },
        }
      : state.latestByQuestion,
    history: state.history.map((record) =>
      record.questionId === questionId
        ? { ...record, isFavorite: !isFavorite }
        : record,
    ),
  };
  saveQuizState(nextState);
  return nextState;
}

export function clearAllRecords(): QuizState {
  saveQuizState(emptyState);
  return emptyState;
}

export function clearWrongBook(state: QuizState): QuizState {
  const nextState: QuizState = {
    ...state,
    wrongBook: [],
    latestByQuestion: Object.fromEntries(
      Object.entries(state.latestByQuestion).map(([id, record]) => [
        id,
        { ...record, isWrongBook: false },
      ]),
    ),
    history: state.history.map((record) => ({ ...record, isWrongBook: false })),
  };
  saveQuizState(nextState);
  return nextState;
}

export function resetProgress(state: QuizState): QuizState {
  const nextState: QuizState = {
    latestByQuestion: {},
    history: [],
    favorites: state.favorites,
    wrongBook: [],
    sequenceProgress: undefined,
  };
  saveQuizState(nextState);
  return nextState;
}
