import { useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar/Navbar";
import dynamic from "next/dynamic";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { NotificationProvider } from "web3uikit";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { fantom, fantomTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MoralisProvider } from "react-moralis";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import "../styles/globals.css";
import Script from "next/script";
const thetaTestnetChain = {
  id: 365,
  name: "Theta Testnet",
  network: "Theta Testnet",

  rpcUrls: {
    default: {
      http: [" https://eth-rpc-api-testnet.thetatoken.org/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "theta-testnet",
      url: "https://testnet-explorer.thetatoken.org",
    },
  },

  testnet: true,
};
const thetaChain = {
  id: 361,
  name: "Theta",
  network: "Theta",

  rpcUrls: {
    default: {
      http: [" https://eth-rpc-api.thetatoken.org/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "theta-testnet",
      url: "https://explorer.thetatoken.org",
    },
  },

  testnet: false,
};

const { chains, provider } = configureChains(
  [thetaTestnetChain, thetaChain],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "ThetaFans",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {}, []);
  const router = useRouter();
  return (
    <>
      <Script
        src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossOrigin="anonymous"
      ></Script>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
        integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
        crossOrigin="anonymous"
        defer
      ></Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/js/bootstrap.min.js"
        integrity="sha512-1/RvZTcCDEUjY/CypiMz+iqqtaoQfAITmNSJY17Myp4Ms5mdxPS5UV7iOfdZoxcGhzFbOm6sntTKJppjvuhg4g=="
        crossOrigin="anonymous"
      ></Script>

      <Head>
        <title>Home</title>
        <meta property="og:title" content="Home" key="title" />
        <link
          rel="stylesheet"
          href="https://assets.codepen.io/7773162/swiper-bundle.min.css"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://use.typekit.net/hmg7hbs.css"
          type="text/css"
        />
        <link
          href="https://c5.patreon.com/external/fonts/gt-walsheim.css"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <div className="cursor"></div>

      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <MoralisProvider initializeOnMount={false}>
            <Navbar></Navbar>
            <NotificationProvider>
              <AnimatePresence mode="wait" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.25,
                    duration: 0.5,
                  },
                }}
                exit={{
                  opacity: 0,
                  backgroundColor: "transparent",

                  transition: {
                    delay: 0.25,
                    ease: "easeInOut",
                  },
                }}
                key={router.route}
                className="content"
              >
                <div className="wrapper">
                  <Component {...pageProps} />
                </div>
              </motion.div>
            </NotificationProvider>
          </MoralisProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
