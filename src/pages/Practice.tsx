import { useEffect, useMemo, useRef, useState } from "react";
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
  const [completionMessage, setCompletionMessage] = useState("");
  const autoNextTimer = useRef<number | undefined>();
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

  useEffect(() => {
    return () => {
      if (autoNextTimer.current) {
        window.clearTimeout(autoNextTimer.current);
      }
    };
  }, []);

  if (!question) {
    return (
      <main className="page">
        <section className="empty-state">暂无题目</section>
      </main>
    );
  }

  function saveAnswer(answer: string[], isCorrect: boolean) {
    const nextState = recordAnswer(
      state,
      question.id,
      answer,
      Array.isArray(question.answer) ? question.answer : [question.answer],
      isCorrect,
    );
    setState(nextState);

    if (autoNextTimer.current) {
      window.clearTimeout(autoNextTimer.current);
    }

    if (!isCorrect) {
      setCompletionMessage("");
      return;
    }

    autoNextTimer.current = window.setTimeout(() => {
      if (index < orderedQuestions.length - 1) {
        setIndex((value) => Math.min(value + 1, orderedQuestions.length - 1));
        setCompletionMessage("");
      } else {
        setCompletionMessage("已完成全部题目");
      }
    }, 700);
  }

  function moveTo(nextIndex: number) {
    if (autoNextTimer.current) {
      window.clearTimeout(autoNextTimer.current);
    }
    setCompletionMessage("");
    setIndex(Math.min(Math.max(nextIndex, 0), orderedQuestions.length - 1));
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

      {completionMessage ? (
        <div className="result-panel right-panel completion-panel">
          <strong>{completionMessage}</strong>
        </div>
      ) : null}

      <div className="pager">
        <button
          className="secondary-button"
          disabled={index === 0}
          onClick={() => moveTo(index - 1)}
        >
          上一题
        </button>
        <button
          className="primary-button"
          disabled={index === orderedQuestions.length - 1}
          onClick={() => moveTo(index + 1)}
        >
          下一题
        </button>
      </div>
    </main>
  );
}
