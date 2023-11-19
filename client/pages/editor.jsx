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

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";

import io from "socket.io-client";

import Logo from "../components/Logo";
import { Modal, IconButton, Input, Select, Option } from "../components/CoreUI";

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
    container: [["bold", "italic", "underline"]],
  },
};

function ReasonModal({ reason, ...props }) {
  const Backdrop = () => {
    return (
      <div
        className="fixed inset-0 w-screen h-screen bg-black/25"
        onClick={props.onClose} // Temp-fix: modal not closing on backdrop click TODO
      ></div>
    );
  };

  return (
    <Modal {...props} slots={{ backdrop: Backdrop }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 p-2 rounded-xl bg-cool-white">
        <p className="color-dark">{reason}</p>
      </div>
    </Modal>
  );
}

function ActionDropdown({ optionList, handleSelect, ...props }) {
  const options = [];

  for (const option of optionList) {
    options.push(
      <Option
        value={option.value}
        onClick={() => {
          handleSelect(option.value);
        }}
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
  const { editorRef, selection } = useContext(Context);

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
            <IconButton className="absolute right-2 top-2" onClick={evaluate}>
              <RefreshIcon htmlColor="#9ba4b5" />
            </IconButton>
            <IconButton
              className="absolute right-2 bottom-2"
              onClick={handleOpen}
            >
              <ChevronRightIcon htmlColor="#9ba4b5" />
            </IconButton>
            <ReasonModal
              open={isOpen}
              onClose={handleClose}
              modalText={reason}
            />
          </>
        ) : (
          <Skeleton
            className="bg-dark-blue"
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
  const ref = useRef(null);
  const { editorRef, selection } = useContext(Context);
  const router = useRouter();

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

    return () => {
      socket.off("tutorRes", onTutorRes);
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
      complete: `${text}\n본문 뒤에 내용을 추론해서 이어 작성해줘.`,
      fix: `${text}\n본문의 내용을 해치지 않는 선에게 어색한 표현을 고쳐줘.`,
      idea: `${text}\n본문을 개선해줘.`,
      completeArg: `${text}\n이 주제에 대해서 주장1문단 근거2문단 결과1문단으로 글을 써줘.`,
      paraphrase: `${text}\n위에 내용을 단어의 표현을 바꿔서 짜임새 있게 새로 짜줘.`,
      summarize: `${text}\n위에 있는 본문을 한줄로 요약해줘.`,
    };

    updateInputBox(prompts[type]);
  };

  const requestPrompt = () => {
    const prompt = input;

    setChatHistory([
      ...chatHistory,
      <ChatBubble isRight={true} text={prompt} />,
      <Skeleton className="bg-grey">
        <ChatBubble isRight={false} text={"Response"} />
      </Skeleton>,
    ]); // Set text to Response for the Skeleton's shape
    ref.current?.scrollIntoView({ block: "end" });

    updateInputBox("");
    setDropdownValue(null);

    socket.emit("tutorReq", prompt);
  };

  return (
    <div className="flex flex-col h-full gap-1 p-2">
      <div className="flex-1 flex flex-col gap-2 overflow-scroll">
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
            <SendIcon htmlColor={isInputDisabled ? "#9ba4b5" : "#394867"} />
          </IconButton>
        </div>
        <ActionDropdown
          optionList={[
            { label: "이어 작성하기", value: "complete" },
            { label: "문법 교정하기", value: "fix" },
            { label: "문학 아이디어", value: "idea" },
            { label: "논증 완성하기", value: "completeArg" },
            { label: "재진술하기", value: "paraphrase" },
            { label: "한 줄 요약하기", value: "summarize" },
          ]}
          handleSelect={generatePrompt}
          onChange={(_, n) => setDropdownValue(n)}
          value={dropdownValue}
          placeholder="AI로..."
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
    <Context.Provider value={{ editorRef, selection }}>
      <div className="flex gap-4 p-4 h-[calc(100vh-48px)] bg-dark-blue">
        <div className="w-7/12 rounded-xl">
          <ReactQuill
            modules={editorModules}
            className="ql h-[calc(100%-44px)]"
            onChangeSelection={handleSelection}
            forwardedRef={editorRef}
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
