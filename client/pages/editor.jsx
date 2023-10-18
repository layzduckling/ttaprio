import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const editorModules = {
  toolbar: {
    container: [["bold", "italic", "underline"]],
  },
};

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

function EditorContainer() {
  const [selected, setSelected] = useState(""); // the text selected
  const [response, setResponse] = useState(""); // the response from the AI

  const handleSelection = (range, source, editor) => {
    // Check whether the user made a selection
    if (source === "user") {
      const text = editor.getText();
      const selectRange = editor.getSelection();
      const selectedText = text.slice(
        selectRange.index,
        selectRange.index + selectRange.length
      );

      setSelected(selectedText);
    }
  };

  const improveSelected = async () => {
    // Check whether selected is empty or not
    if (selected) {
      await fetch("http://localhost:8080/api/improve", {
        method: "POST",
        body: JSON.stringify({ text: selected }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      setResponse("따플이가 생각중이에요...");

      const res = await fetch("http://localhost:8080/api/improve");
      setResponse(await res.text());
    }
  };

  return (
    <>
      <div className="flex gap-4 pt-[72px] p-2 h-screen bg-cyan-200">
        <div className="w-2/3 p-4 rounded-xl bg-[#0f1c41]">
          <ReactQuill
            modules={editorModules}
            className="ql h-[calc(100%-44px)]"
            onChangeSelection={handleSelection}
          />
        </div>
        <div className="w-1/3 p-4 rounded-xl bg-[#0f1c41]">
          <div className="flex flex-col gap-2 p-4 h-full rounded-xl bg-orange-50">
            <div className="flex h-1/6 gap-2 text-xl text-center text-white ">
              <div className="flex justify-center items-center w-2/3 p-2 text-center bg-[#0f1c41] rounded-xl">
                <h2>{selected}</h2>
              </div>
              <button
                className="w-1/3 p-1 whitespace-pre bg-[#0f1c41] rounded-xl"
                onClick={improveSelected}
              >
                AI로
                <br />
                고치기
              </button>
            </div>
            <div className="p-4 h-5/6 rounded-xl text-xl text-white bg-[#0f1c41] overflow-scroll">
              <p className="whitespace-pre-line">{response}</p>
            </div>
          </div>
        </div>
      </div>
    </>
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
