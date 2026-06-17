import { useEffect, useState } from "react";
import questionsData from "./data/questions.json";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Statistics from "./pages/Statistics";
import WrongBook from "./pages/WrongBook";
import { Question, QuizState, RouteName } from "./types";
import { loadQuizState } from "./utils/storage";

const questions = questionsData as Question[];

export default function App() {
  const [route, setRoute] = useState<RouteName>("home");
  const [state, setState] = useState<QuizState>(() => loadQuizState());
  const [targetQuestionId, setTargetQuestionId] = useState<number | undefined>();
  const [randomDefault, setRandomDefault] = useState(false);

  useEffect(() => {
    document.title = "马克思主义刷题";
  }, []);

  function go(nextRoute: RouteName) {
    setTargetQuestionId(undefined);
    setRandomDefault(false);
    setRoute(nextRoute);
  }

  function openQuestion(questionId: number) {
    setTargetQuestionId(questionId);
    setRandomDefault(false);
    setRoute("practice");
  }

  function startRandom() {
    setTargetQuestionId(undefined);
    setRandomDefault(true);
    setRoute("practice");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button onClick={() => go("home")}>首页</button>
        <button onClick={() => go("practice")}>刷题</button>
        <button onClick={() => go("statistics")}>统计</button>
      </header>

      {route === "home" ? (
        <Home
          questions={questions}
          state={state}
          setState={setState}
          go={go}
          startRandom={startRandom}
        />
      ) : null}
      {route === "practice" ? (
        <Practice
          questions={questions}
          state={state}
          setState={setState}
          startQuestionId={targetQuestionId}
          randomDefault={randomDefault}
        />
      ) : null}
      {route === "wrong" ? (
        <WrongBook questions={questions} state={state} setState={setState} />
      ) : null}
      {route === "favorites" ? (
        <Favorites questions={questions} state={state} setState={setState} />
      ) : null}
      {route === "history" ? (
        <History
          questions={questions}
          state={state}
          openQuestion={openQuestion}
          go={go}
        />
      ) : null}
      {route === "statistics" ? (
        <Statistics questions={questions} state={state} go={go} />
      ) : null}
    </div>
  );
}
