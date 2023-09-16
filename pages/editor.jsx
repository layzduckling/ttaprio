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
  return (
    <>
      <div className="flex gap-4 pt-[72px] p-2 h-screen bg-cyan-200">
        <div className="w-2/3 p-4 rounded-xl bg-[#0f1c41]">
          <ReactQuill
            modules={editorModules}
            className="h-[calc(100%-44px)] rounded-xl bg-orange-50"
          />
        </div>
        <div className="w-1/3 p-4 rounded-xl bg-[#0f1c41]">
          <div className="h-full rounded-xl bg-orange-50"></div>
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
