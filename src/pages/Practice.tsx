import { useEffect, useMemo, useRef, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import { Question, QuizState } from "../types";
import {
  recordAnswer,
  saveSequenceProgress,
  toggleFavorite,
} from "../utils/storage";
import { shuffleQuestions } from "../utils/questionUtils";

interface PracticeProps {
  title?: string;
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
  startQuestionId?: number;
  randomDefault?: boolean;
  progressMode?: "sequence" | "none";
}

export default function Practice({
  title = "刷题",
  questions,
  state,
  setState,
  startQuestionId,
  randomDefault = false,
  progressMode = "none",
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
  const isSequenceMode = progressMode === "sequence" && !random;

  useEffect(() => {
    return () => {
      if (autoNextTimer.current) {
        window.clearTimeout(autoNextTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (question && isSequenceMode) {
      updateSequenceProgress(state, index);
    }
  }, []);

  if (!question) {
    return (
      <main className="page">
        <section className="empty-state">暂无题目</section>
      </main>
    );
  }

  function getCompletedCount(nextState: QuizState) {
    return Object.keys(nextState.latestByQuestion).length;
  }

  function updateSequenceProgress(
    baseState: QuizState,
    nextIndex: number,
    isCompleted = false,
  ) {
    if (!isSequenceMode) return baseState;
    const safeIndex = Math.min(Math.max(nextIndex, 0), orderedQuestions.length - 1);
    const nextQuestion = orderedQuestions[safeIndex];
    if (!nextQuestion) return baseState;

    const nextState = saveSequenceProgress(baseState, {
      currentQuestionId: nextQuestion.id,
      currentIndex: safeIndex,
      completedCount: getCompletedCount(baseState),
      isCompleted,
    });
    setState(nextState);
    return nextState;
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
      updateSequenceProgress(nextState, index);
      return;
    }

    autoNextTimer.current = window.setTimeout(() => {
      if (index < orderedQuestions.length - 1) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setCompletionMessage("");
        updateSequenceProgress(nextState, nextIndex);
      } else {
        setCompletionMessage("已完成全部题目");
        updateSequenceProgress(nextState, index, true);
      }
    }, 700);
  }

  function moveTo(nextIndex: number) {
    if (autoNextTimer.current) {
      window.clearTimeout(autoNextTimer.current);
    }
    setCompletionMessage("");
    const safeIndex = Math.min(Math.max(nextIndex, 0), orderedQuestions.length - 1);
    setIndex(safeIndex);
    updateSequenceProgress(state, safeIndex);
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
