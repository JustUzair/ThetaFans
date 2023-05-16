import React from "react";
import Image from "next/image";
import tfuel from "../../assets/img/tfuel-logo.svg";
import { useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddresses from "../../constants/networkMapping.json";
import abi from "../../constants/UserFactory.json";
import userProfileAbi from "../../constants/UserProfile.json";
import { motion } from "framer-motion";
import { fadeInUp, routeAnimation, stagger } from "../../utils/animations";
import { ethers } from "ethers";
const SubscriptionCard = ({ creator }) => {
  console.log(creator);
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
  async function subscribeUser(creatorAddress, tier, subscriptionAmount) {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: creatorAddress,
          functionName: "userSubscribe",
          msgValue: ethers.utils
            .parseEther(subscriptionAmount.toString())
            .toString(),
          params: { _tier: tier },
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
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="subscription-card--grid"
            style={
              creator?.silver?.silverSubscriptionAmount > 0
                ? creator?.silver?.silverSubscriptionAmount != 0 &&
                  creator?.gold?.goldSubscriptionAmount == 0
                  ? {
                      display: "grid !important",
                      gridTemplateColumns: "repeat(2,1fr)",
                      margin: "0 auto !important",
                    }
                  : {}
                : {
                    display: "grid !important",
                    gridTemplateColumns: "repeat(1,1fr)",
                    margin: "0 auto !important",
                  }
            }
          >
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="subscription-card card1"
            >
              <h3>Bronze</h3>
              <h2>{creator?.bronze?.bronzeSubscriptionAmount}</h2>
              <h4>
                <Image
                  src={tfuel}
                  alt="tfuel"
                  style={{
                    width: "50px !important",
                  }}
                />
                <span>{creator?.bronze?.bronzeSubscriptionAmount} TFuel</span>
              </h4>

              <hr />
              <p>Premium Content</p>
              <p>
                Unlock{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: "600",
                  }}
                >
                  Bronze{" "}
                </span>{" "}
                Pack
              </p>
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
                  subscribeUser(
                    creator.address,
                    1,
                    creator?.bronze?.bronzeSubscriptionAmount
                  );
                }}
              >
                Subscribe Now
              </button>
            </motion.div>

            {creator?.silver?.silverSubscriptionAmount > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="subscription-card card2"
              >
                <h3>SILVER</h3>
                <h2>{creator?.silver?.silverSubscriptionAmount}</h2>
                <h4>
                  <Image
                    src={tfuel}
                    alt="tfuel"
                    style={{
                      width: "50px !important",
                    }}
                  />
                  <span>{creator?.silver?.silverSubscriptionAmount} TFuel</span>
                </h4>
                <hr />
                <p>Premium Plus Content</p>
                <p>
                  Unlock{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontWeight: "600",
                    }}
                  >
                    Silver + Bronze{" "}
                  </span>{" "}
                  Pack
                </p>
                <button
                  onClick={e => {
                    subscribeUser(
                      creator.address,
                      2,
                      creator?.silver?.silverSubscriptionAmount
                    );
                  }}
                >
                  Subscribe Now
                </button>
              </motion.div>
            )}
            {creator?.gold?.goldSubscriptionAmount > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="subscription-card card3"
              >
                <h3>GOLD</h3>
                <h2>{creator?.gold?.goldSubscriptionAmount}</h2>
                <h4>
                  <Image
                    src={tfuel}
                    alt="tfuel"
                    style={{
                      width: "50px !important",
                    }}
                  />
                  <span>{creator?.gold?.goldSubscriptionAmount} TFuel</span>
                </h4>
                <hr />
                <p>Unlimited Content</p>
                <p>
                  Unlock{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontWeight: "600",
                    }}
                  >
                    Gold + Silver + Bronze
                  </span>{" "}
                  Pack
                </p>
                <button
                  onClick={e => {
                    subscribeUser(
                      creator.address,
                      3,
                      creator?.gold?.goldSubscriptionAmount
                    );
                  }}
                >
                  Subscribe Now
                </button>
              </motion.div>
            )}
          </motion.div>
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
