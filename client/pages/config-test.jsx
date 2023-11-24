import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Popper, useAutocomplete, MenuItem } from "@mui/base";

import Logo from "../components/Logo";
import { Menu, Input, Select as Dropdown, Option } from "../components/CoreUI";

import rubricList from "./_rubricList";

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

function Selection({
  selectionText,
  additionalSelect = false,
  additionalOptions = [],
}) {
  const { progress, setProgress, configurations } = useContext(Context);
  let key = "";

  if (progress == 1) {
    key = "subject";
  } else if (progress == 2) {
    key = "format";
  }

  const buttonStyle =
    "px-6 py-[2px] rounded-xl bg-dark color-cool-white text-2xl font-bold";

  return additionalSelect ? (
    <Menu title={selectionText} baseStyle={buttonStyle}>
      {additionalOptions.map((option) => (
        <MenuItem
          className="px-2 py-1 rounded-lg hover:bg-[#91c8E4] hover:duration-100"
          onClick={() =>
            updateConfigProgress(
              configurations,
              key,
              `${selectionText}(${option})`,
              progress,
              setProgress
            )
          }
        >
          {option}
        </MenuItem>
      ))}
    </Menu>
  ) : (
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
      <div className={buttonStyle}>{selectionText}</div>
    </button>
  );
}

function SelectionList({ selections }) {
  let components = [];

  selections.forEach((selectionText) => {
    if (typeof selectionText == "object") {
      const type = Object.keys(selectionText)[0];
      components.push(
        <Selection
          selectionText={type}
          additionalSelect
          additionalOptions={selectionText[type]}
        />
      );
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
      <SubHeader>따플이가 자료를 준비할 수 있게 도와주세요.</SubHeader>
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
          {
            설명문: [
              "철학",
              "거시경제",
              "미시경제",
              "IT",
              "과학사",
              "미술사",
              "사회이론",
              "생물",
              "물리",
              "역사",
              "민법",
              "행정법",
            ],
          },
          "수필",
          "논설문",
          { 편지: ["안부", "사과", "축하", "감사", "위문"] }
        ]}
      />
    </>
  );
}

function AdditionalInfo() {
  const { progress, setProgress, configurations } = useContext(Context);

  const [title, setTitle] = useState(null);
  const [rubric, setRubric] = useState(null);

  const {
    getInputProps,
    getListboxProps,
    getOptionProps,
    getRootProps,
    anchorEl,
    setAnchorEl,
    popupOpen,
    groupedOptions,
  } = useAutocomplete({
    options: rubricList,
  });

  useEffect(() => {
    configurations.current["title"] = title;
    configurations.current["rubric"] = rubric;
  });

  return (
    <>
      <ProgressBar progress={3} />
      <Header>추가적인 정보를 입력해주세요</Header>
      <SubHeader>따플이가 정확히 대비할 수 있게 도와주세요.</SubHeader>
      <div className="flex gap-4 mt-6 mb-4">
        <div className="flex flex-col justify-center h-fit p-2 gap-6 rounded-xl bg-grey">
          <Dropdown
            placeholder={"학교급 선택"}
            onChange={(_, n) => (configurations.current["schooltype"] = n)}
          >
            <Option value={"중학교"}>중학교</Option>
            <Option value={"고등학교"}>고등학교</Option>
          </Dropdown>
          <Dropdown
            placeholder={"학년/학기 선택"}
            onChange={(_, n) => (configurations.current["semester"] = n)}
          >
            <Option value={"1학년 1학기"}>1학년 1학기</Option>
            <Option value={"1학년 1학기"}>1학년 2학기</Option>
            <Option value={"2학년 1학기"}>2학년 1학기</Option>
            <Option value={"2학년 2학기"}>2학년 2학기</Option>
            <Option value={"3학년 1학기"}>3학년 1학기</Option>
            <Option value={"3학년 2학기"}>3학년 2학기</Option>
          </Dropdown>
        </div>

        <div className="flex flex-col gap-5 w-4/5 max-w-[200px] p-2 rounded-xl bg-grey">
          <Input
            placeholder="수행평가 제목"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <div {...getRootProps()} className="flex gap-5" ref={setAnchorEl}>
            <Input
              placeholder="성취 기준"
              onChange={(e) => setRubric(e.target.value)}
              value={rubric}
              {...getInputProps()}
            />
            <Popper
              open={popupOpen}
              anchorEl={anchorEl}
              slotProps={{
                root: {
                  className:
                    "absolute w-1/4 h-1/6 overflow-y-scroll px-1 py-[2px] z-[1001] bg-slate-200 rounded-lg",
                },
              }}
              modifiers={[{ name: "flip", enabled: false }]}
            >
              <ul {...getListboxProps()}>
                {groupedOptions.map((option, index) => {
                  const optionProps = getOptionProps({ option, index });

                  return (
                    <li
                      {...optionProps}
                      className="rounded-md hover:bg-slate-300 hover:duration-100"
                    >
                      {option}
                    </li>
                  );
                })}

                {groupedOptions.length === 0 && (
                  <li className="list-none cursor-default">검색 결과 없음</li>
                )}
              </ul>
            </Popper>
          </div>
        </div>
      </div>
      <Link
        href={{
          pathname: "/editor",
          query: configurations.current,
        }}
        className="p-2 w-1/6 rounded-xl text-lg color-cool-white text-center bg-dark hover:bg-slate-900 hover:duration-100"
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
    <div className="flex flex-col px-16 gap-2 items-center justify-center h-[calc(100vh-48px)] bg-dark-blue">
      <Image
        src="/images/bird.png"
        width={160}
        height={160}
        className="-m-8 bg-transparent"
      />
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
