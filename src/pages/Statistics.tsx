import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Question, QuizState, RouteName } from "../types";
import { getQuestionBrief, getQuestionGroups } from "../utils/questionUtils";

interface StatisticsProps {
  questions: Question[];
  state: QuizState;
  go: (route: RouteName) => void;
}

const COLORS = ["#2563eb", "#ef4444", "#10b981", "#f59e0b"];

export default function Statistics({ questions, state, go }: StatisticsProps) {
  const dailyMap = new Map<string, number>();
  state.history.forEach((record) => {
    const day = record.answeredAt.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  });
  const dailyData = Array.from(dailyMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const latest = Object.values(state.latestByQuestion);
  const correct = latest.filter((record) => record.isCorrect).length;
  const wrong = latest.length - correct;
  const pieData = [
    { name: "正确", value: correct },
    { name: "错误", value: wrong },
  ].filter((item) => item.value > 0);

  const groupData = getQuestionGroups(questions).map((group) => {
    const answered = group.questions
      .map((question) => state.latestByQuestion[question.id])
      .filter(Boolean);
    const groupCorrect = answered.filter((record) => record.isCorrect).length;
    return {
      name: group.name,
      accuracy: answered.length
        ? Math.round((groupCorrect / answered.length) * 100)
        : 0,
    };
  });

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const wrongRank = Array.from(
    state.history
      .filter((record) => !record.isCorrect)
      .reduce((map, record) => {
        map.set(record.questionId, (map.get(record.questionId) ?? 0) + 1);
        return map;
      }, new Map<number, number>())
      .entries(),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  return (
    <main className="page">
      <div className="page-title-row">
        <h1>统计分析</h1>
        <button className="text-button" onClick={() => go("home")}>
          返回首页
        </button>
      </div>

      <section className="chart-panel">
        <h2>每日刷题数量</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-panel">
        <h2>正确 / 错误占比</h2>
        {pieData.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={78} label>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">答题后生成占比图</div>
        )}
      </section>

      <section className="chart-panel">
        <h2>题号区间正确率</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={groupData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={2} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="accuracy" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-panel">
        <h2>错题最多排行</h2>
        {wrongRank.length ? (
          <div className="rank-list">
            {wrongRank.map(([questionId, count], index) => {
              const question = questionMap.get(questionId);
              return (
                <div className="rank-item" key={questionId}>
                  <strong>{index + 1}</strong>
                  <span>{question ? getQuestionBrief(question, 36) : questionId}</span>
                  <em>{count} 次</em>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">暂无错题</div>
        )}
      </section>
    </main>
  );
}
