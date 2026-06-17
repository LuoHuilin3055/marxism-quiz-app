import { useMemo, useState } from "react";
import { Question } from "../types";
import { isSameAnswer, normalizeAnswer } from "../utils/questionUtils";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  isFavorite: boolean;
  latestAnswer?: string[];
  onAnswer: (answer: string[], isCorrect: boolean) => void;
  onToggleFavorite: () => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  isFavorite,
  latestAnswer,
  onAnswer,
  onToggleFavorite,
}: QuestionCardProps) {
  const correctAnswer = useMemo(() => normalizeAnswer(question.answer), [question]);
  const [selected, setSelected] = useState<string[]>(latestAnswer ?? []);
  const [submitted, setSubmitted] = useState(Boolean(latestAnswer?.length));
  const isCorrect = submitted && isSameAnswer(selected, correctAnswer);

  function choose(letter: string) {
    if (isCorrect) return;
    const next =
      question.type === "multiple"
        ? selected.includes(letter)
          ? selected.filter((item) => item !== letter)
          : [...selected, letter]
        : [letter];
    setSelected(next);
    setSubmitted(false);
    if (question.type === "single") {
      setSubmitted(true);
      onAnswer(next, isSameAnswer(next, correctAnswer));
    }
  }

  function submitMultiple() {
    if (!selected.length || isCorrect) return;
    setSubmitted(true);
    onAnswer(selected, isSameAnswer(selected, correctAnswer));
  }

  return (
    <section className="question-card">
      <div className="question-meta">
        <span>
          {index + 1} / {total}
        </span>
        <span>{question.type === "multiple" ? "多选题" : "单选题"}</span>
        <button className="text-button" onClick={onToggleFavorite}>
          {isFavorite ? "已收藏" : "收藏"}
        </button>
      </div>

      <h2>{question.question}</h2>

      <div className="option-list">
        {question.options.map((option) => {
          const letter = option.slice(0, 1);
          const active = selected.includes(letter);
          const shouldMarkRight = submitted && correctAnswer.includes(letter);
          const shouldMarkWrong =
            submitted && active && !correctAnswer.includes(letter);
          return (
            <button
              key={option}
              className={[
                "option-button",
                active ? "selected" : "",
                shouldMarkRight ? "right" : "",
                shouldMarkWrong ? "wrong" : "",
              ].join(" ")}
              onClick={() => choose(letter)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {question.type === "multiple" && !isCorrect ? (
        <button className="primary-button" onClick={submitMultiple}>
          {submitted ? "重新提交" : "提交答案"}
        </button>
      ) : null}

      {submitted ? (
        <div className={isCorrect ? "result-panel right-panel" : "result-panel wrong-panel"}>
          <strong>{isCorrect ? "回答正确" : "回答错误"}</strong>
          <p>正确答案：{correctAnswer.join("、")}</p>
          <p>你的答案：{selected.length ? selected.join("、") : "未选择"}</p>
          {question.analysis ? <p>解析：{question.analysis}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
