import { useEffect, useMemo, useRef, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import { PracticeMode, Question, QuizState } from "../types";
import {
  recordAnswer,
  saveSequenceProgress,
  toggleFavorite,
} from "../utils/storage";
import {
  findNextIncompleteIndex,
  getIncompleteQuestions,
  isQuestionCompleted,
  shuffleQuestions,
} from "../utils/questionUtils";

interface PracticeProps {
  title?: string;
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
  startQuestionId?: number;
  randomDefault?: boolean;
  mode?: PracticeMode;
  showPreviousAnswer?: boolean;
}

export default function Practice({
  title = "刷题",
  questions,
  state,
  setState,
  startQuestionId,
  randomDefault = false,
  mode = "normal",
  showPreviousAnswer = true,
}: PracticeProps) {
  const [sessionQuestions] = useState(questions);
  const practiceQuestions =
    mode === "wrong" || mode === "favorite" ? sessionQuestions : questions;
  const [random, setRandom] = useState(randomDefault || mode === "random");
  const [includeCompletedRandom, setIncludeCompletedRandom] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [isQuestionNavOpen, setIsQuestionNavOpen] = useState(false);
  const autoNextTimer = useRef<number | undefined>();
  const orderedQuestions = useMemo(
    () => {
      if (mode === "random" && random) {
        const randomPool = includeCompletedRandom
          ? practiceQuestions
          : getIncompleteQuestions(practiceQuestions, state);
        return shuffleQuestions(randomPool);
      }
      return random ? shuffleQuestions(practiceQuestions) : practiceQuestions;
    },
    [includeCompletedRandom, mode, practiceQuestions, random],
  );
  const requestedStartIndex = Math.max(
    orderedQuestions.findIndex((item) => item.id === startQuestionId),
    0,
  );
  const startIndex =
    mode === "sequence"
      ? findNextIncompleteIndex(orderedQuestions, state, requestedStartIndex)
      : requestedStartIndex;
  const [index, setIndex] = useState(startIndex);
  const question = orderedQuestions[index];
  const isSequenceMode = mode === "sequence" && !random;
  const isRandomMode = mode === "random";

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
        <section className="empty-state">
          {isRandomMode && !includeCompletedRandom
            ? "所有题目已完成"
            : isSequenceMode
              ? "已完成全部题目"
              : "暂无题目"}
          {isRandomMode && !includeCompletedRandom ? (
            <button
              className="primary-button"
              onClick={() => {
                setIncludeCompletedRandom(true);
                setIndex(0);
              }}
            >
              重新随机练习全部题目
            </button>
          ) : null}
        </section>
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
      const nextIndex = isSequenceMode
        ? findNextIncompleteIndex(orderedQuestions, nextState, index + 1)
        : index < orderedQuestions.length - 1
          ? index + 1
          : -1;

      if (nextIndex !== -1) {
        setIndex(nextIndex);
        setCompletionMessage("");
        updateSequenceProgress(nextState, nextIndex);
      } else {
        setCompletionMessage(
          isRandomMode ? "所有题目已完成" : "已完成全部题目",
        );
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

  function jumpToQuestion(questionId: number) {
    const nextIndex = practiceQuestions.findIndex((item) => item.id === questionId);
    if (nextIndex === -1) return;
    if (random) {
      setRandom(false);
      setCompletionMessage("");
      setIndex(nextIndex);
      updateSequenceProgress(state, nextIndex);
      setIsQuestionNavOpen(false);
      return;
    }
    moveTo(nextIndex);
    setIsQuestionNavOpen(false);
  }

  return (
    <main className="page practice-page">
      <div className="page-title-row">
        <h1>{title}</h1>
        <div className="practice-tools">
          <button
            className="text-button"
            onClick={() => setIsQuestionNavOpen((value) => !value)}
          >
            题号
          </button>
          <label className="switch">
            <input
              type="checkbox"
              checked={random}
              onChange={(event) => {
                setRandom(event.target.checked);
                setIndex(0);
                setIncludeCompletedRandom(false);
                setIsQuestionNavOpen(false);
              }}
            />
            随机
          </label>
        </div>
      </div>

      {isQuestionNavOpen ? (
        <section className="question-nav-panel">
          <div className="question-nav-head">
            <strong>选择题号</strong>
            <span>
              {index + 1} / {orderedQuestions.length}
            </span>
          </div>
          <div className="question-number-grid">
            {practiceQuestions.map((item) => {
              const record = state.latestByQuestion[item.id];
              const isCurrent = item.id === question.id;
              const isFavorite = state.favorites.includes(item.id);
              const isCompleted = isQuestionCompleted(state, item.id);
              const statusClass = isCompleted
                ? "correct"
                : state.wrongBook.includes(item.id) || record
                  ? "incorrect"
                  : "";

              return (
                <button
                  key={item.id}
                  className={[
                    "question-number",
                    statusClass,
                    isCurrent ? "current" : "",
                  ].join(" ")}
                  onClick={() => jumpToQuestion(item.id)}
                >
                  <span>{item.id}</span>
                  {statusClass ? (
                    <em>{statusClass === "correct" ? "✓" : "×"}</em>
                  ) : null}
                  {isFavorite ? <small>★</small> : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <QuestionCard
        key={question.id}
        question={question}
        index={index}
        total={orderedQuestions.length}
        isFavorite={state.favorites.includes(question.id)}
        latestAnswer={state.latestByQuestion[question.id]?.userAnswer}
        showPreviousAnswer={showPreviousAnswer}
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
