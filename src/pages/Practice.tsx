import { useMemo, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import { Question, QuizState } from "../types";
import { recordAnswer, toggleFavorite } from "../utils/storage";
import { shuffleQuestions } from "../utils/questionUtils";

interface PracticeProps {
  title?: string;
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
  startQuestionId?: number;
  randomDefault?: boolean;
}

export default function Practice({
  title = "刷题",
  questions,
  state,
  setState,
  startQuestionId,
  randomDefault = false,
}: PracticeProps) {
  const [random, setRandom] = useState(randomDefault);
  const orderedQuestions = useMemo(
    () => (random ? shuffleQuestions(questions) : questions),
    [questions, random],
  );
  const startIndex = Math.max(
    orderedQuestions.findIndex((item) => item.id === startQuestionId),
    0,
  );
  const [index, setIndex] = useState(startIndex);
  const question = orderedQuestions[index];

  if (!question) {
    return (
      <main className="page">
        <section className="empty-state">暂无题目</section>
      </main>
    );
  }

  function saveAnswer(answer: string[], isCorrect: boolean) {
    setState(
      recordAnswer(
        state,
        question.id,
        answer,
        Array.isArray(question.answer) ? question.answer : [question.answer],
        isCorrect,
      ),
    );
  }

  return (
    <main className="page practice-page">
      <div className="page-title-row">
        <h1>{title}</h1>
        <label className="switch">
          <input
            type="checkbox"
            checked={random}
            onChange={(event) => {
              setRandom(event.target.checked);
              setIndex(0);
            }}
          />
          随机
        </label>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        index={index}
        total={orderedQuestions.length}
        isFavorite={state.favorites.includes(question.id)}
        latestAnswer={state.latestByQuestion[question.id]?.userAnswer}
        onAnswer={saveAnswer}
        onToggleFavorite={() => setState(toggleFavorite(state, question.id))}
      />

      <div className="pager">
        <button
          className="secondary-button"
          disabled={index === 0}
          onClick={() => setIndex((value) => Math.max(value - 1, 0))}
        >
          上一题
        </button>
        <button
          className="primary-button"
          disabled={index === orderedQuestions.length - 1}
          onClick={() =>
            setIndex((value) => Math.min(value + 1, orderedQuestions.length - 1))
          }
        >
          下一题
        </button>
      </div>
    </main>
  );
}
