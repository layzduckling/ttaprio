import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <div className="absolute -top-4 ml-4 flex max-w-fit justify-center z-10">
      <Image src="/images/HeaderChatbox.svg" height={216} width={216} />
      <div className="absolute top-[32px] text-3xl text-white font-bold">
        <h1>&lt;ttapr.io&gt;</h1>
      </div>
    </div>
  );
}

function SelectionTry() {
  return (
    <div
      className="flex flex-col p-12 pr-[40%] justify-center h-full text-blue-600 bg-cyan-200"
      style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)" }}
    >
      <h2 className="p-2 pt-8 my-8 text-7xl font-extrabold whitespace-nowrap leading-snug font-mono">
        무.작.정. <br />
        따라해보기
      </h2>
      <p className="text-2xl p-2 font-semibold tracking-tight font-mono">
        30초 안에 수행평가 유형 클릭하고 과제물 제작
      </p>
      <Link href="config-test" className="p-2 -mt-4">
        <Image src="/images/BlueSelectbox.svg" height={256} width={256} />
      </Link>
    </div>
  );
}

function SelectionStart() {
  return (
    <div
      className="flex flex-col p-12 pl-[40%] text-right justify-center h-full text-cyan-200 bg-blue-600"
      style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <Link href="config-test " className="p-2 -mb-4 self-end">
        <Image src="/images/LightBlueSelectbox.svg" height={256} width={256} />
      </Link>
      <p className="text-2xl p-2 font-semibold tracking-tight font-mono">
        AI 활용부터 심화까지, 오직 중고생 과제에 특화된 요점정리
      </p>
      <h2 className="p-2 my-8 text-7xl font-extrabold whitespace-nowrap leading-snug font-mono">
        처음부터
        <br />
        시작해보기
      </h2>
    </div>
  );
}

function SelectionContainer() {
  return (
    <div className="flex h-screen">
      <div className="w-[62.5%] h-full absolute">
        <SelectionTry />
      </div>
      <div className="w-[62.5%] h-full absolute left-[37.5%]">
        <SelectionStart />
      </div>
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
