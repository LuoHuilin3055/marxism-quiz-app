import { Question, QuizState, RouteName } from "../types";
import { getQuestionBrief } from "../utils/questionUtils";

interface HistoryProps {
  questions: Question[];
  state: QuizState;
  openQuestion: (questionId: number) => void;
  go: (route: RouteName) => void;
}

export default function History({
  questions,
  state,
  openQuestion,
  go,
}: HistoryProps) {
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  return (
    <main className="page">
      <div className="page-title-row">
        <h1>历史记录</h1>
        <button className="text-button" onClick={() => go("home")}>
          返回首页
        </button>
      </div>

      <section className="list-panel">
        {state.history.length ? (
          state.history.map((record, index) => {
            const question = questionMap.get(record.questionId);
            if (!question) return null;
            return (
              <button
                className="history-item"
                key={`${record.questionId}-${record.answeredAt}-${index}`}
                onClick={() => openQuestion(record.questionId)}
              >
                <strong>{getQuestionBrief(question)}</strong>
                <span>
                  你的答案：{record.userAnswer.join("、")} / 正确答案：
                  {record.correctAnswer.join("、")}
                </span>
                <span>
                  {record.isCorrect ? "正确" : "错误"} · 第 {record.attemptNumber} 次 ·{" "}
                  {new Date(record.answeredAt).toLocaleString()}
                </span>
              </button>
            );
          })
        ) : (
          <div className="empty-state">还没有刷题记录</div>
        )}
      </section>
    </main>
  );
}
