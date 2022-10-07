import "../styles/globals.css";

import { Connect } from "@stacks/connect-react";
import { Buffer } from "@stacks/common";

import { userSession } from "../components/ConnectWallet";

global.Buffer = Buffer;

function MyApp({ Component, pageProps }) {
  let icon;
  if (typeof window !== "undefined") {
    icon = window.location.origin + "/nft-logo.png";
  }

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Stacks Next.js Template",
          icon,
        },
        redirectTo: "/",
        onFinish: () => {
          window.location.reload();
        },
        userSession,
      }}
    >
      <Component {...pageProps} />
    </Connect>
  );
}

export default MyApp;
