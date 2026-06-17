import Practice from "./Practice";
import { Question, QuizState } from "../types";

interface WrongBookProps {
  questions: Question[];
  state: QuizState;
  setState: (state: QuizState) => void;
}

export default function WrongBook({ questions, state, setState }: WrongBookProps) {
  const wrongQuestions = questions.filter((question) =>
    state.wrongBook.includes(question.id),
  );

  return (
    <Practice
      title="错题本"
      questions={wrongQuestions}
      state={state}
      setState={setState}
    />
  );
}
