import ProgressBar from "../components/ProgressBar";
import StatsCard from "../components/StatsCard";
import { Question, QuizState, RouteName } from "../types";
import { calculateOverview } from "../utils/questionUtils";
import { clearAllRecords, clearWrongBook, resetProgress } from "../utils/storage";

interface HomeProps {
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
  go: (route: RouteName) => void;
  startSequence: () => void;
  startRandom: () => void;
}

export default function Home({
  questions,
  state,
  setState,
  go,
  startSequence,
  startRandom,
}: HomeProps) {
  const overview = calculateOverview(
    questions,
    state.latestByQuestion,
    state.favorites,
    state.wrongBook,
  );

  return (
    <main className="page">
      <section className="home-hero">
        <p>马克思主义基本原理</p>
        <h1>期末刷题</h1>
      </section>

      <section className="stats-grid">
        <StatsCard label="总题数" value={overview.total} />
        <StatsCard label="已完成" value={overview.completed} />
        <StatsCard label="未完成" value={overview.remaining} />
        <StatsCard label="正确率" value={`${overview.accuracy}%`} />
        <StatsCard label="错题数" value={overview.wrong} />
        <StatsCard label="收藏题" value={overview.favorites} />
      </section>

      <section className="panel">
        <ProgressBar
          label={`已完成 ${overview.completed} / ${overview.total}`}
          value={overview.completed}
          max={overview.total}
        />
        <ProgressBar label={`正确率 ${overview.accuracy}%`} value={overview.accuracy} />
      </section>

      {state.sequenceProgress ? (
        <section className="panel resume-panel">
          <strong>
            {state.sequenceProgress.isCompleted
              ? "顺序刷题已完成"
              : `上次做到第 ${state.sequenceProgress.currentIndex + 1} / ${
                  questions.length
                } 题`}
          </strong>
          <span>
            已完成 {state.sequenceProgress.completedCount} 题 · 最后刷题{" "}
            {new Date(state.sequenceProgress.lastPracticedAt).toLocaleString()}
          </span>
          <button className="primary-button" onClick={startSequence}>
            {state.sequenceProgress.isCompleted ? "查看统计" : "继续顺序刷题"}
          </button>
        </section>
      ) : null}

      <section className="action-grid">
        <button className="primary-button" onClick={startSequence}>
          顺序刷题
        </button>
        <button className="secondary-button" onClick={startRandom}>
          随机刷题
        </button>
        <button className="secondary-button" onClick={() => go("wrong")}>
          错题本
        </button>
        <button className="secondary-button" onClick={() => go("favorites")}>
          收藏题
        </button>
        <button className="secondary-button" onClick={() => go("history")}>
          历史记录
        </button>
        <button className="secondary-button" onClick={() => go("statistics")}>
          统计分析
        </button>
      </section>

      <section className="panel danger-zone">
        <button onClick={() => setState(resetProgress(state))}>重置刷题进度</button>
        <button onClick={() => setState(clearWrongBook(state))}>清空错题本</button>
        <button onClick={() => setState(clearAllRecords())}>清空全部记录</button>
      </section>
    </main>
  );
}
