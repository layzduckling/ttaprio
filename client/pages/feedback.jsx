import { useState } from "react";
import Logo from "../components/Logo";

function EvaluationSummary() {
  const [grade, setGrade] = useState("A");
  const [rubric, setRubric] = useState("평가 기준");

  return (
    <>
      <div className="flex justify-center items-center w-5/6 h-full p-4 rounded-xl bg-orange-50">
        <p>{rubric}</p>
      </div>
      <div className="flex justify-center items-center w-1/6 h-full rounded-xl bg-orange-50">
        <h2 className="text-4xl font-extrabold">{grade}</h2>
      </div>
    </>
  );
}

function WordCount() {
  return (
    <div className="h-1/5 p-4 rounded-xl bg-orange-50">
      <p>글자 수 __ 자, 줄 수 __ 줄, 평균 문장 길이 __ 자</p>
    </div>
  );
}

function GrammarCheck() {
  return (
    <div className="h-4/5 p-4 rounded-xl bg-orange-50">
      <p>원본 글 디스플레이</p>
    </div>
  );
}

function DetailedEvaluation() {
  return (
    <>
      <div className="h-1/5 p-4 mb-4 rounded-xl bg-orange-50">
        <p>전체적으로 평가기준표에 부합하는 글입니다.</p>
      </div>
      <div className="h-4/5 p-4 rounded-xl bg-orange-50">
        <p>2u</p>
      </div>
    </>
  );
}

function FeedbackContainer() {
  return (
    <div className="flex justify-evenly gap-4 items-center m-2 p-4 h-1/6 rounded-xl bg-[#0f1c41]">
      <EvaluationSummary className="flex-1" />
    </div>
  );
}

function LargeFeedbackContainer() {
  return (
    <div className="flex justify-evenly gap-4 m-2 p-4 h-5/6 rounded-xl bg-[#0f1c41]">
      <div className="flex flex-col gap-4 w-1/3 h-full">
        <WordCount />
        <GrammarCheck />
      </div>
      <div className="flex flex-col w-1/3 h-full">
        <DetailedEvaluation />
      </div>
      <div className="flex flex-col w-1/3 h-full"></div>
    </div>
  );
}

export default function Feedback() {
  return (
    <>
      <Logo />
      <div className="flex flex-col pt-[72px] p-2 h-screen bg-cyan-200">
        <FeedbackContainer />
        <LargeFeedbackContainer />
      </div>
    </>
  );
}
