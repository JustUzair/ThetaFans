import React from "react";
import Image from "next/image";
import tfuel from "../../assets/img/tfuel-logo.svg";
import { useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddresses from "../../constants/networkMapping.json";
import abi from "../../constants/UserFactory.json";
import userProfileAbi from "../../constants/UserProfile.json";

import { ethers } from "ethers";
const SubscriptionCard = ({ creator }) => {
  //   console.log(JSON.parse(creator));
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
  async function subscribeUser(creatorAddress) {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: creatorAddress,
          functionName: "userSubscribe",
          msgValue: ethers.utils
            .parseEther(creator.subscriptionAmount.toString())
            .toString(),
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          console.log(data);
        },
      });
    }
  }
  return (
    <>
      {contractAddress ? (
        <div className="subscription-card--container">
          {/* <div className="subscription-card--grid"> */}
          {/* <div className="subscription-card card1">
          <h3>BASIC</h3>
          <h2>Free</h2>
          <h4>
            <Image
              src={tfuel}
              alt="tfuel"
              style={{
                width: "50px !important",
              }}
            />
            <span>Free</span>
          </h4>

          <hr />
          <p>10 templates</p>
          <p>Default presets</p>
          <a href="#">Subscribe </a>
        </div>
        <div className="subscription-card card2">
          <h3>PRO</h3>
          <h2>100</h2>
          <h4>
            <Image
              src={tfuel}
              alt="tfuel"
              style={{
                width: "50px !important",
              }}
            />
            <span>50</span>
          </h4>
          <hr />
          <p>50 templates</p>
          <p>Pro presets</p>
          <a href="#">Subscribe </a>
        </div> */}
          <div className="subscription-card card3">
            <h3>ULTIMATE</h3>
            <h2>{creator.subscriptionAmount}</h2>
            <h4>
              <Image
                src={tfuel}
                alt="tfuel"
                style={{
                  width: "50px !important",
                }}
              />
              <span>{creator.subscriptionAmount} TFuel</span>
            </h4>
            <hr />
            <p>Unlimited Content</p>
            <p>Unlock Premium Content</p>
            <button
              onClick={e => {
                // console.log(
                //   ethers.utils
                //     .parseUnits(
                //       ethers.BigNumber.from(
                //         creator.subscriptionAmountInHex
                //       ).toString(),
                //       "wei"
                //     )
                //     .toString()
                // );
                subscribeUser(creator.address);
              }}
            >
              Subscribe Now
            </button>
          </div>
          {/* </div> */}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "80vw",
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

export default SubscriptionCard;
