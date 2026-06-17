import Practice from "./Practice";
import { Question, QuizState } from "../types";

interface FavoritesProps {
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
}

export default function Favorites({ questions, state, setState }: FavoritesProps) {
  const favoriteQuestions = questions.filter((question) =>
    state.favorites.includes(question.id),
  );

  return (
    <Practice
      title="收藏题"
      questions={favoriteQuestions}
      state={state}
      setState={setState}
    />
  );
}
