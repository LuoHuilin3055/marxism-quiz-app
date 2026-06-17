import { AnswerRecord, Question } from "../types";

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

export function calculateOverview(
  questions: Question[],
  latestByQuestion: Record<number, AnswerRecord>,
  favorites: number[],
  wrongBook: number[],
) {
  const latest = Object.values(latestByQuestion);
  const completed = latest.length;
  const correct = latest.filter((record) => record.isCorrect).length;
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;

  return {
    total: questions.length,
    completed,
    remaining: Math.max(questions.length - completed, 0),
    accuracy,
    wrong: wrongBook.length,
    favorites: favorites.length,
  };
}
