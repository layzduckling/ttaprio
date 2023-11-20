import Link from "next/link";
import Image from "next/image";

import EastIcon from "@mui/icons-material/East";

import Logo from "../components/Logo";

function SelectionTry() {
  return (
    <div className="flex flex-col gap-6 ml-16 justify-center h-full color-cool-white">
      <h2 className="text-7xl font-extrabold whitespace-nowrap leading-snug">
        무.작.정. <br />
        따라해보기
      </h2>
      <p className="text-2xl font-base tracking-tight">
        30초 안에 수행평가 유형 클릭하고 과제물 제작
      </p>
      <Link href="config-test">
        <div className="flex justify-center items-center gap-4 w-2/3 p-4 rounded-2xl text-3xl text-center font-semibold bg-dark hover:bg-slate-900 hover:duration-100">
          <EastIcon fontSize="large" />
          바로가기
        </div>
      </Link>
    </div>
  );
}

function SelectionContainer() {
  return (
    <div className="flex h-[calc(100vh-48px)] bg-dark-blue items-center justify-between overflow-hidden">
      <SelectionTry />
      <Image src="/images/bird.png" width={600} height={600} className="ml-12" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Logo />
      <SelectionContainer />
    </>
  );
}
