import React, { createContext, useState, useRef, useContext } from "react";
import Link from "next/link";

import Logo from "../components/Logo";
import { Input, Select as Dropdown, Option } from "../components/CoreUI";

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

function Header({ ...props }) {
  return (
    <h1
      {...props}
      className="text-5xl color-cool-white tracking-tight font-bold"
    ></h1>
  );
}

function SubHeader({ ...props }) {
  return (
    <h2
      {...props}
      className="text-2xl color-grey tracking-tight font-semibold"
    ></h2>
  );
}

function ProgressBar({ progress }) {
  // Progress bar components. There are 3 in total
  let bars = [];

  for (let i = 1; i <= 3; i++) {
    if (i === progress) {
      bars.push(<div className="w-36 h-3 mx-4 rounded-xl bg-slate-900"></div>);
    } else {
      bars.push(<div className="w-16 h-3 mx-2 rounded-xl bg-dark"></div>);
    }
  }

  return <div className="flex m-4">{bars}</div>;
}

function Selection({ selectionText, long = false }) {
  const { progress, setProgress, configurations } = useContext(Context);
  let key = "";

  if (progress == 1) {
    key = "subject";
  } else if (progress == 2) {
    key = "format";
  }

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
      <div className="px-6 py-[2px] rounded-xl bg-dark color-cool-white text-2xl font-bold">
        {selectionText}
      </div>
    </button>
  );
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
    <div className="flex flex-wrap gap-x-8 gap-y-6 w-4/5 mt-6 max-w-[600px] justify-center">
      {components}
    </div>
  );
}

function SelectSubject() {
  return (
    <>
      <ProgressBar progress={1} />
      <Header> 수행평가 과목이 무엇입니까?</Header>
      <SubHeader>따플이가 자료를 준비할 수 있게 도와주세요</SubHeader>
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
      <Header>수행평가 형식이 무엇입니까?</Header>
      <SubHeader>따플이가 마음의 준비를 할 수 있게 도와주세요.</SubHeader>
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

  const [title, setTitle] = useState(null);
  const [rubric, setRubric] = useState(null);

  const handleSubmit = () => {
    configurations.current["title"] = title;
    configurations.current["rubric"] = rubric;

    fetch("http://api.ttapr.io/api/config-test", {
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
      <Header>추가적인 정보를 입력해주세요</Header>
      <SubHeader>따플이가 정확히 대비할 수 있게 도와주세요</SubHeader>
      <div className="flex gap-4 mt-6 mb-4">
        <div className="flex flex-col justify-center p-2 gap-6 rounded-xl bg-grey">
          <Dropdown
            placeholder={"학교급 선택"}
            onChange={(_, n) => (configurations.current["schooltype"] = n)}
          >
            <Option value={"중학교"}>"중학교"</Option>
            <Option value={"고등학교"}>"고등학교"</Option>
          </Dropdown>
          <Dropdown
            placeholder={"학년/학기 선택"}
            onChange={(_, n) => (configurations.current["semester"] = n)}
          >
            <Option value={"1학년 1학기"}>"1학년 1학기"</Option>
            <Option value={"1학년 1학기"}>"1학년 2학기"</Option>
            <Option value={"2학년 1학기"}>"2학년 1학기"</Option>
            <Option value={"2학년 2학기"}>"2학년 2학기"</Option>
            <Option value={"3학년 1학기"}>"3학년 1학기"</Option>
            <Option value={"3학년 2학기"}>"3학년 2학기"</Option>
          </Dropdown>
        </div>

        <div className="flex flex-col gap-5 w-4/5 max-w-[200px] p-2 rounded-xl bg-grey">
          <Input
            placeholder="수행평가 제목"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <Input
            placeholder="성취 기준"
            onChange={(e) => setRubric(e.target.value)}
            value={rubric}
          />
        </div>
      </div>
      <Link
        href="/editor"
        className="p-2 w-1/6 rounded-xl text-lg color-cool-white text-center bg-dark hover:bg-slate-900 hover:duration-100"
        onClick={handleSubmit}
      >
        완료
      </Link>
    </>
  );
}

function Configure() {
  const [progress, setProgress] = useState(1);
  const screens = [<SelectSubject />, <SelectType />, <AdditionalInfo />];
  const configurations = useRef({
    subject: "",
    format: "",
    schooltype: "",
    semester: "",
    title: "",
    rubric: "",
  });

  return (
    <div className="flex flex-col px-16 gap-2 items-center justify-center h-[calc(100vh-44px)] bg-dark-blue">
      <Context.Provider value={{ progress, setProgress, configurations }}>
        {screens[progress - 1]}
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
