import "../styles/global.css";
import "./ql.css";

import Head from "next/head";

export default function App({ Component, pageProps }) {
  return <>
  <Head>
    <title>ttaprio</title>
    <link rel="icon" href="/images/bird_icon.png" />
  </Head>
  <Component {...pageProps} />
  </>;
}
