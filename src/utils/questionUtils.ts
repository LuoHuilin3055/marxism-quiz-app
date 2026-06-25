import { AnswerRecord, Question, QuizState } from "../types";

export function normalizeAnswer(answer: string | string[]): string[] {
  return Array.isArray(answer) ? answer : [answer];
}

export function isSameAnswer(left: string[], right: string[]): boolean {
  return [...left].sort().join("") === [...right].sort().join("");
}

export function getQuestionBrief(question: Question, length = 42): string {
  return question.question.length > length
    ? `${question.question.slice(0, length)}...`
    : question.question;
}

export function getQuestionGroups(questions: Question[], size = 20) {
  const groups: { name: string; questions: Question[] }[] = [];
  for (let index = 0; index < questions.length; index += size) {
    const chunk = questions.slice(index, index + size);
    groups.push({
      name: `${chunk[0].id}-${chunk[chunk.length - 1].id}`,
      questions: chunk,
    });
  }
  return groups;
}

export function shuffleQuestions(questions: Question[]): Question[] {
  return [...questions]
    .map((question) => ({ question, value: Math.random() }))
    .sort((left, right) => left.value - right.value)
    .map((item) => item.question);
}

export function isQuestionCompleted(
  state: Pick<QuizState, "latestByQuestion" | "history">,
  questionId: number,
): boolean {
  const latest = state.latestByQuestion[questionId];
  return Boolean(
    latest?.isCompleted ||
      latest?.isCorrect ||
      state.history.some(
        (record) => record.questionId === questionId && record.isCorrect,
      ),
  );
}

export function getIncompleteQuestions(
  questions: Question[],
  state: Pick<QuizState, "latestByQuestion" | "history">,
): Question[] {
  return questions.filter((question) => !isQuestionCompleted(state, question.id));
}

export function findNextIncompleteIndex(
  questions: Question[],
  state: Pick<QuizState, "latestByQuestion" | "history">,
  startIndex: number,
): number {
  if (!questions.length) return -1;
  const safeStart = Math.min(Math.max(startIndex, 0), questions.length - 1);
  for (let index = safeStart; index < questions.length; index += 1) {
    if (!isQuestionCompleted(state, questions[index].id)) return index;
  }
  for (let index = 0; index < safeStart; index += 1) {
    if (!isQuestionCompleted(state, questions[index].id)) return index;
  }
  return -1;
}

export function calculateOverview(
  questions: Question[],
  latestByQuestion: Record<number, AnswerRecord>,
  history: AnswerRecord[],
  favorites: number[],
  wrongBook: number[],
) {
  const latest = Object.values(latestByQuestion);
  const completed = latest.filter(
    (record) => record.isCompleted || record.isCorrect,
  ).length;
  const attempts = history.length || latest.length;
  const correctAttempts = history.length
    ? history.filter((record) => record.isCorrect).length
    : latest.filter((record) => record.isCorrect).length;
  const accuracy = attempts ? Math.round((correctAttempts / attempts) * 100) : 0;

  return {
    total: questions.length,
    completed,
    remaining: Math.max(questions.length - completed, 0),
    accuracy,
    wrong: wrongBook.length,
    favorites: favorites.length,
  };
}
