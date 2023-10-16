import React, { createContext, useState, useRef, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import Select from "react-select";

const Context = createContext();

function updateConfigProgress(
  configurations,
  key,
  value,
  progress,
  setProgress
) {
  configurations.current[key] = value;
  setProgress(progress + 1);
}

function Logo() {
  return (
    <div className="absolute w-screen h-[64px] bg-[#0f1c41]">
      <div className="ml-4 w-[216px] flex justify-center">
        <div className="absolute top-[16px] text-3xl text-white font-bold">
          <h1>&lt;ttapr.io&gt;</h1>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ progress }) {
  let bars = [];

  for (let i = 1; i <= 3; i++) {
    if (i === progress) {
      bars.push(
        <div className="mx-4">
          <Image src="/images/BlueProgressbar.svg" width={148} height={148} />
        </div>
      );
    } else {
      bars.push(
        <div className="-mx-6">
          <Image src="/images/PurpleProgressbar.svg" width={148} height={148} />
        </div>
      );
    }
  }

  return <div className="flex">{bars}</div>;
}

function Selection({ selectionText, long = false }) {
  const { progress, setProgress, configurations } = useContext(Context);
  let key = "";

  if (progress == 1) {
    key = "subject";
  } else if (progress == 2) {
    key = "format";
  }

  if (long) {
    return (
      <button
        onClick={() =>
          updateConfigProgress(
            configurations,
            key,
            selectionText,
            progress,
            setProgress
          )
        }
      >
        <div className="relative flex max-w-fit justify-center items-center">
          <Image src="/images/SubjectSelectBox.svg" height={124} width={124} />
          <p className="absolute top-[12px] text-white text-xl font-mono font-bold">
            {selectionText}
          </p>
        </div>
      </button>
    );
  } else {
    return (
      <button
        onClick={() =>
          updateConfigProgress(
            configurations,
            key,
            selectionText,
            progress,
            setProgress
          )
        }
      >
        <div className="relative flex max-w-fit justify-center items-center">
          <Image src="/images/SubjectSelectBox.svg" height={124} width={124} />
          <p className="absolute top-[8px] text-white text-2xl font-mono font-bold">
            {selectionText}
          </p>
        </div>
      </button>
    );
  }
}

function SelectionList({ selections }) {
  let components = [];

  selections.forEach((selectionText) => {
    if (selectionText.length >= 4) {
      components.push(<Selection selectionText={selectionText} long={true} />);
    } else {
      components.push(<Selection selectionText={selectionText} />);
    }
  });

  return (
    <div className="flex flex-wrap gap-4 w-4/5 max-w-[600px] justify-center">
      {components}
    </div>
  );
}

function Dropdowns({ options, placeholders }) {
  let components = [];
  const { progress, setProgress, configurations } = useContext(Context);

  for (let i = 0; i < options.length; i++) {
    const placeholder = placeholders[i];

    const handleSelect = (e) => {
      if (placeholder == "학교급 선택") {
        configurations.current["schooltype"] = e.label;
      } else if (placeholder == "학년/학기 선택") {
        configurations.current["semester"] = e.label;
      } else if (placeholder == "교과서 출판사") {
        configurations.current["publisher"] = e.label;
      }
    };

    components.push(
      <Select
        options={options[i]}
        placeholder={placeholder}
        onChange={handleSelect}
      />
    );
  }

  return (
    <div className="flex flex-col mb-4 gap-4 w-4/5 max-w-[200px] p-4 rounded-xl bg-[#0f1c41]">
      {components}
    </div>
  );
}

function SelectSubject() {
  return (
    <>
      <ProgressBar progress={1} />
      <h1 className="mb-2 text-5xl text-blue-600 tracking-tight font-bold font-mono">
        수행평가 과목이 무엇입니까?
      </h1>
      <p className="mb-4 text-2xl text-indigo-400 tracking-tight font-semibold font-mono">
        따플이가 자료를 준비할 수 있게 도와주세요
      </p>
      <SelectionList
        selections={[
          "국어",
          "영어",
          "사회",
          "제2외국어",
          "수학",
          "과학",
          "역사",
          "도덕",
        ]}
      />
    </>
  );
}

function SelectType() {
  return (
    <>
      <ProgressBar progress={2} />
      <h1 className="mb-2 text-5xl text-blue-600 tracking-tight font-bold font-mono">
        수행평가 형식이 무엇입니까?
      </h1>
      <p className="mb-4 text-2xl text-indigo-400 tracking-tight font-semibold font-mono">
        따플이가 마음의 준비를 할 수 있게 도와주세요.
      </p>
      <SelectionList
        selections={[
          "보고서",
          "발표",
          "일기",
          "암기형",
          "설명문",
          "수필",
          "논설문",
        ]}
      />
    </>
  );
}

function AdditionalInfo() {
  const { progress, setProgress, configurations } = useContext(Context);

  const schoolType = [
    { value: "middle", label: "중학교" },
    { value: "high", label: "고등학교" },
  ];
  const semesters = [
    { value: 11, label: "1학년 1학기" },
    { value: 12, label: "1학년 2학기" },
    { value: 21, label: "2학년 1학기" },
    { value: 22, label: "2학년 2학기" },
    { value: 31, label: "3학년 1학기" },
    { value: 32, label: "3학년 2학기" },
  ];
  const publisher = [{ value: "shinsago", label: "신사고" }];
  const placeholders = ["학교급 선택", "학년/학기 선택", "교과서 출판사"];

  const title = useRef(null);
  const rubric = useRef(null);

  const handleSubmit = () => {
    configurations.current["title"] = title.current.value;
    configurations.current["rubric"] = rubric.current.value;

    fetch("http://localhost:8080/api/config-test", {
      method: "POST",
      body: JSON.stringify(configurations.current),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  };

  return (
    <>
      <ProgressBar progress={3} />
      <h1 className="mb-2 text-5xl text-blue-600 tracking-tight font-bold font-mono">
        추가적인 정보를 입력해주세요
      </h1>
      <p className="mb-4 text-2xl text-indigo-400 tracking-tight font-semibold font-mono">
        따플이가 정확히 대비할 수 있게 도와주세요
      </p>
      <div className="flex gap-4">
        <Dropdowns
          options={[schoolType, semesters, publisher]}
          placeholders={placeholders}
        />
        <div className="flex flex-col mb-4 gap-4 w-4/5 max-w-[200px] p-4 rounded-xl bg-[#0f1c41]">
          <input
            name="title"
            className="px-2 h-[39px] text-base rounded-xl font-mono"
            placeholder="수행평가 제목"
            ref={title}
          />
          <input
            name="rubric"
            className="px-2 h-[39px] text-base rounded-xl font-mono"
            placeholder="성취 기준"
            ref={rubric}
          />
        </div>
      </div>
      <Link
        href="/editor"
        className="p-2 w-[100px] rounded-xl bg-[#0f1c41] text-lg text-white text-center"
        onClick={handleSubmit}
      >
        완료
      </Link>
    </>
  );
}

function Configure() {
  const [progress, setProgress] = useState(1);
  const configScreens = [<SelectSubject />, <SelectType />, <AdditionalInfo />];
  const configurations = useRef({
    subject: "",
    format: "",
    schooltype: "",
    semester: "",
    publisher: "",
    title: "",
    rubric: "",
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen pt-[72px] bg-cyan-200 z-0">
      <Context.Provider value={{ progress, setProgress, configurations }}>
        {configScreens[progress - 1]}
      </Context.Provider>
    </div>
  );
}

export default function ConfigTest() {
  return (
    <>
      <Logo />
      <Configure />
    </>
  );
}
