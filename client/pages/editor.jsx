import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import "react-quill/dist/quill.snow.css";

import { Skeleton } from "@mui/material";

// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";

import io from "socket.io-client";

import Logo from "../components/Logo";
import {
  Modal,
  IconButton,
  Input,
  Select,
  Slider,
  Option,
} from "../components/CoreUI";

import promptList from "../components/_promptList";

const Context = createContext();

const socket = io("wss://api.ttapr.io");

// When next/dynamic wraps a component, it doesn't forward ref to the internal component
const ReactQuill = dynamic(
  async () => {
    const RQ = (await import("react-quill")).default;
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);
const editorModules = {
  toolbar: {
    container: [[{ header: [1, 2, 3, false] }, "bold", "italic", "underline"]],
  },
};

function ActionDropdown({ optionList, handleSelect, ...props }) {
  const options = [];

  for (const option of optionList) {
    options.push(
      <Option
        value={option.value}
        onClick={() => {
          handleSelect(option.value);
        }}
        emphasis={option.emphasis}
      >
        {option.label}
      </Option>
    );
  }

  return <Select {...props}>{options}</Select>;
}

function GradeWidget() {
  const [grade, setGrade] = useState("-");
  const [isOpen, toggleOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { editorRef, selection, router } = useContext(Context);

  useEffect(() => {
    const onEvaluationRes = (res) => {
      setGrade(res.grade);
      setReason(res.reason);
    };

    socket.on("evaluationRes", onEvaluationRes);

    return () => {
      socket.off("evaluationRes", onEvaluationRes);
    };
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      toggleOpen(true);
    }
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const evaluate = () => {
    setGrade("");
    const req = editorRef.current.getEditor().getText();
    socket.emit("evaluationReq", req);
  };

  return (
    <>
      <div className="relative flex justify-center items-center h-full">
        {grade ? (
          <>
            <em className="font-bold not-italic text-5xl color-dark">
              {grade}
            </em>
            <IconButton
              className="w-[84px] absolute right-2 top-2 border-2 border-grey"
              onClick={evaluate}
            >
              {/* <RefreshIcon htmlColor="#9ba4b5" /> */}
              <span className="color-dark font-bold">등급 내기</span>
            </IconButton>
            {/* Only allow the "show reason" button to appear when a reason exists */}
            {reason ? (
              <IconButton
                className="w-[84px] absolute right-2 bottom-2 border-2 border-grey"
                onClick={handleOpen}
              >
                {/* <ChevronRightIcon htmlColor="#9ba4b5" className="text-3xl" /> */}
                <span className="color-dark font-bold">이유 보기</span>
              </IconButton>
            ) : (
              <></>
            )}
            <Modal
              open={isOpen}
              onClose={handleClose}
              children={<p className="color-dark">{reason}</p>}
            />
          </>
        ) : (
          <Skeleton
            sx={{ backgroundColor: "#394867" }}
            variant="rounded"
            width={"100%"}
            height={"100%"}
          />
        )}
      </div>
    </>
  );
}

function ChatBubble(props) {
  return props.isRight ? (
    <div className="self-end max-w-[75%] px-2 py-[2px] bg-dark-blue rounded-xl rounded-br-none break-words whitespace-pre-line">
      <p className="text-m color-cool-white">{props.text}</p>
    </div>
  ) : (
    <div className="self-start max-w-[75%] px-2 py-[2px] bg-grey rounded-xl rounded-bl-none break-words whitespace-pre-line">
      <p className="text-m color-dark">{props.text}</p>
    </div>
  );
}

function Chat() {
  const [chatHistory, setChatHistory] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [isInputDisabled, disableInput] = useState(true);
  const [input, setInput] = useState(null);
  const [isConfigOpen, toggleConfigBox] = useState(false);
  const [temperature, setTemperature] = useState(0.1);
  const [topP, setTopP] = useState(0.7);
  const ref = useRef(null);
  const { editorRef, selection, router } = useContext(Context);

  const onTutorRes = (res) => {
    // The event handler couldn't access the latest state
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory.slice(0, -1),
      <ChatBubble isRight={false} text={res.trim()} />, // There might be unnecessary spaces or empty lines in front.
    ]);
    ref.current?.scrollIntoView({ block: "end" });
  };

  useEffect(() => {
    socket.on("tutorRes", onTutorRes);
    socket.on("gptTutorRes", onTutorRes);

    return () => {
      socket.off("tutorRes", onTutorRes);
      socket.off("gptTutorRes", onTutorRes);
    };
  }, []);

  const updateInputBox = (t) => {
    // There are two textarea elements. The first one displays the value.
    // const inputBox = document.getElementsByTagName("textarea")[0];
    // inputBox.value = t;

    // Adjust height of input box
    // inputBox.removeAttribute("style");
    // inputBox.setAttribute(
    //   "style",
    //   `height: ${inputBox.scrollHeight}px; overflow: hidden;`
    // );

    setInput(t);

    if (t) {
      disableInput(false);
    } else {
      disableInput(true);
    }
  };

  const generatePrompt = (type) => {
    const text = editorRef.current.getEditor().getText();
    if (!text.trim()) {
      return;
    }

    const config = router.query;

    const prompts = {
      idea: `학년: ${config.schoolType} ${config.semester} / 수행평가 제목: ${
        config.title
      }
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 문학 아이디어를 만들어야 해. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 내용을 추론해서 문학 아이디어를 만들면 돼.

할일 : 너는 ${
        config.format
      }의 문학 아이디어를 만들어. 원문내용의 내용을 해치지 않고 작품 설명없이 바로 ${
        config.format
      }를 이어써줘.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,

      complete: `학년: ${config.schoolType} ${
        config.semester
      } / 수행평가 제목: ${config.title}
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 본문 뒤에 내용을 추론해서 이어 작성해야 해. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 본문 뒤에 내용을 추론해서 이어 작성해주면 돼.

할일 : 너는 ${config.format}의 본문 뒤에 내용을 추론해서 이어 작성해줘.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,

      fix: `학년: ${config.schoolType} ${config.semester} / 수행평가 제목: ${
        config.title
      }
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 본문의 내용을 해치지 않는 선에서 어색한 표현을 고쳐야 해. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 본문의 내용을 해치지 않는 선에서 어색한 표현을 고쳐줘.

할일 : 너는 ${
        config.format
      }의 본문의 내용을 해치지 않는 선에서 어색한 표현을 고쳐줘.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,

      completeArg: `학년: ${config.schoolType} ${config.semester} / 수행평가 제목: ${
        config.title
      }
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 주장1문단 근거2문단 결과1문단을 써야 해. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 주제에 대해서 주장1문단 근거2문단 결과1문단으로 글을 써주면 돼.

할일 : 너는 ${
        config.format
      }의 주장1문단 근거2문단 결과1문단을 써야 해.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,

      paraphrase: `학년: ${config.schoolType} ${config.semester} / 수행평가 제목: ${
        config.title
      }
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 단어의 표현을 바꿔서 짜임새 있게 새로 작성해야 해. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 내용에서 단어의 표현을 바꿔서 짜임새 있게 새로 작성해주면 돼.

할일 : 너는 ${
        config.format
      }의 내용에서 단어의 표현을 바꿔서 짜임새 있게 새로 작성해야 해.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,

      summarize: `학년: ${config.schoolType} ${config.semester} / 수행평가 제목: ${
        config.title
      }
너는 현재 ${config.format}를 쓰는 학생이야. 학생의 입장으로 ${
        config.format
      }의 본문을 한줄로 요약해줘. 아래에 너가 할일, 평가를 받는 성취기준, 문장 생성형식, 원문내용을 규정해줄거야. 원문내용의 내용을 그대로 유지하고, 본문을 한줄로 요약해주면 돼.

할일 : 너는 ${
        config.format
      }의 본문을 한줄로 요약해면 돼.
성취기준 : ${config.rubric}
문장생성형식 : ${promptList[config.format]}
원문내용 : ${text}
      
원문내용을 성취기준을 참고하여 문장생성형식에 맞춰서 할일을 수행해줘. 문장생성형식에 ___칸을 채우는 방법으로 진행해줘. 다른 안내 없이 바로 이어 써 주어야해.`,
    };

    updateInputBox(prompts[type]);
  };

  const requestPrompt = () => {
    const prompt = input;

    setChatHistory([
      ...chatHistory,
      <ChatBubble isRight={true} text={prompt} />,
      <Skeleton sx={{ backgroundColor: "#9ba4b5" }}>
        <ChatBubble isRight={false} text={"Response"} />
      </Skeleton>,
    ]); // Set text to Response for the Skeleton's shape
    ref.current?.scrollIntoView({ block: "end" });

    updateInputBox("");
    setDropdownValue(null);

    // 문학 아이디어가 아닐 경우 GPT 사용
    if (dropdownValue === "idea") {
      socket.emit("tutorReq", {
        prompt: prompt,
        temperature: temperature,
        top_p: topP,
      });
    } else {
      socket.emit("gptTutorReq", prompt);
    }
  };

  return (
    <div className="flex flex-col h-full gap-1 p-2">
      <div className="flex-1 flex flex-col gap-2 overflow-y-scroll">
        {chatHistory}
        <div ref={ref}></div>
      </div>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-end">
          <Input
            multiline
            maxRows={5}
            disabled={isInputDisabled}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <IconButton
            onClick={requestPrompt}
            disabled={isInputDisabled ? true : false}
          >
            <SendIcon
              htmlColor={isInputDisabled ? "#9ba4b5" : "#394867"}
              className="text-3xl"
            />
          </IconButton>
        </div>
        <div className="flex items-center w-full">
          <ActionDropdown
            optionList={[
              { label: "문학 아이디어", value: "idea", emphasis: true },
              { label: "이어 작성하기", value: "complete" },
              { label: "문법 교정하기", value: "fix" },
              { label: "논증 완성하기", value: "completeArg" },
              { label: "다시 작성하기", value: "paraphrase" },
              { label: "한 줄 요약하기", value: "summarize" },
            ]}
            handleSelect={generatePrompt}
            onChange={(_, n) => setDropdownValue(n)}
            value={dropdownValue}
            placeholder="AI로..."
          />
          <IconButton onClick={() => toggleConfigBox(true)}>
            <SettingsIcon htmlColor="#394867" className="text-3xl" />
          </IconButton>
        </div>
        <Modal
          open={isConfigOpen}
          onClose={() => toggleConfigBox(false)}
          children={
            <>
              <h1 className="text-2xl color-dark font-bold">
                프롬프트 상세 설정
              </h1>
              <h3 className="color-dark">temperature</h3>
              <div className="px-4 py-3">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={temperature}
                  onChange={(_, value) => setTemperature(value)}
                />
              </div>
              <h3 className="color-dark">top_p</h3>
              <div className="px-4 py-3">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={topP}
                  onChange={(_, value) => setTopP(value)}
                />
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}

function Assistant() {
  return (
    <div className="flex flex-col p-2 gap-2 bg-cool-white h-full rounded-xl">
      <div className="h-1/6 border-dark-blue border-2 rounded-xl">
        <GradeWidget />
      </div>
      <div className="h-5/6 border-dark-blue border-2 rounded-xl">
        <Chat />
      </div>
    </div>
  );
}

function EditorContainer() {
  const editorRef = useRef(null);
  const selection = useRef(null);
  const router = useRouter();
  const config = router.query;

  const handleSelection = (range, source, editor) => {
    // Check whether the user made a selection
    if (source === "user") {
      const text = editor.getText();
      const selectedText = text.slice(range);

      if (selectedText && selectedText.trim()?.length) {
        selection.current = selectedText;
      }
    }
  };

  return (
    <Context.Provider value={{ editorRef, selection, router }}>
      <div className="flex gap-4 p-4 h-[calc(100vh-48px)] bg-dark-blue">
        <div className="w-7/12 rounded-xl">
          <ReactQuill
            modules={editorModules}
            className="ql h-[calc(100%-44px)]"
            onChangeSelection={handleSelection}
            forwardedRef={editorRef}
            defaultValue={promptList[config.format]}
          />
        </div>
        <div className="w-5/12">
          <Assistant />
        </div>
      </div>
    </Context.Provider>
  );
}

export default function Editor() {
  return (
    <>
      <Logo />
      <EditorContainer />
    </>
  );
}
