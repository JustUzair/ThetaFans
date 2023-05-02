import React, { useEffect, useState } from "react";
import Head from "next/head";
import tfuel from "../../assets/img/tfuel-logo.svg";
import Image from "next/image";
import { MdOutlineEuroSymbol } from "react-icons/md";
import { BiRename } from "react-icons/bi";
import { GiToken } from "react-icons/gi";
import { TbFileDescription } from "react-icons/tb";
import Router from "next/router";
import abi from "../../constants/UserFactory.json";
import contractAddresses from "../../constants/networkMapping.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";

const Creators = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [description, setDescription] = useState("");
  const [subscriptionCost, setSubscriptionCost] = useState(0);

  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();
  const { enableWeb3, authenticate, account, isWeb3Enabled } = useMoralis();
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const contractAddress =
    chainId in contractAddresses
      ? contractAddresses[chainId]["UserFactory"][
          contractAddresses[chainId]["UserFactory"].length - 1
        ]
      : null;
  const successNotification = msg => {
    dispatch({
      type: "success",
      message: `${msg} Successfully`,
      title: `${msg}`,
      position: "bottomR",
    });
  };

  const failureNotification = msg => {
    dispatch({
      type: "error",
      message: `${msg} ( View console for more info )`,
      title: `${msg}`,
      position: "bottomR",
    });
  };

  async function createContentCreatorAccount() {
    if (!isWeb3Enabled) await enableWeb3();
    // console.log(
    //   tokenName,
    //   tokenSymbol,
    //   creatorName,
    //   description,
    //   subscriptionCost
    // );
    if (account) {
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "createProfile",
          params: {
            _tokenName: tokenName,
            _tokenSymbol: tokenSymbol,
            _name: creatorName,
            _description: description,
            _subscriptionAmount: subscriptionCost,
          },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          successNotification(`Signed Up Successfully!`);
          Router.push("/creators");
        },
      });
    }
  }
  useEffect(() => {
    enableWeb3();
    authenticate();
  }, []);
  return (
    <>
      <Head>
        <title>Become a Creator</title>
      </Head>
      {contractAddress != null ? (
        <div className="signup-form--container">
          <div className="signup-form">
            <div className="container">
              <div className="header">
                <h1>Create an Account</h1>
                <p>Get started for free!</p>
              </div>

              <div className="input">
                <i className="fa-solid fa-user">
                  <GiToken />
                </i>
                <input
                  type="text"
                  placeholder="Token Name"
                  onChange={e => {
                    const value = e.target.value;
                    setTokenName(value);
                  }}
                />
              </div>
              <div className="input">
                <i className="fa-solid fa-user">
                  <MdOutlineEuroSymbol />
                </i>
                <input
                  type="text"
                  placeholder="Token Symbol"
                  onChange={e => {
                    const value = e.target.value;
                    setTokenSymbol(value);
                  }}
                />
              </div>
              <div className="input">
                <i className="fa-solid fa-user">
                  <BiRename />
                </i>
                <input
                  type="email"
                  placeholder="Creator Name"
                  onChange={e => {
                    const value = e.target.value;
                    setCreatorName(value);
                  }}
                />
              </div>
              <div className="input">
                <i className="fa-solid fa-lock">
                  <TbFileDescription />
                </i>
                <textarea
                  placeholder="Description"
                  onChange={e => {
                    const value = e.target.value;
                    setDescription(value);
                  }}
                ></textarea>
              </div>
              <div className="input">
                <i className="fa-solid fa-lock">
                  <Image
                    src={tfuel}
                    style={{
                      width: "12px !important",
                    }}
                  ></Image>
                </i>
                <input
                  type="number"
                  placeholder="Sub Cost"
                  min="0"
                  onChange={e => {
                    const value = e.target.value;
                    setSubscriptionCost(value);
                  }}
                />
                <span
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  TFuel
                </span>
              </div>

              <button
                className="signup-btn"
                onClick={createContentCreatorAccount}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "80%",
              height: "100vh",
              zIndex: "99",
              color: "white",
              fontSize: "2rem",
              wordWrap: "break-word",
              margin: "0 auto",
            }}
          >
            <span
              style={{
                background: "#FF494A",
                padding: "10px 25px",
                borderRadius: "20px",
              }}
            >
              No contract found on this network!!!
            </span>
          </div>
        </>
      )}
    </>
  );
};

export default Creators;
