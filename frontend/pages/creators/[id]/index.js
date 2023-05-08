import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import SubscriptionCard from "../../../components/SubscriptionCard/SubscriptionCard";
import { route } from "next/dist/server/router";
import { fontSize, useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddresses from "../../../constants/networkMapping.json";
import abi from "../../../constants/UserFactory.json";
import userProfileAbi from "../../../constants/UserProfile.json";
import { ethers } from "ethers";

const Creators = () => {
  const router = useRouter();
  const _creator = router.query.id;
  const [creatorData, setCreatorData] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
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

  async function getCreatorData() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      //   runContractFunction({
      //     params: {
      //       abi,
      //       contractAddress,
      //       functionName: "getCreator",
      //       params: { _creator },
      //     },
      //     //
      //     onError: error => {
      //       failureNotification(error.message);
      //       console.error(error);
      //     },
      //     onSuccess: data => {
      //       successNotification(
      //         `Data for Creator ${
      //           _creator?.substr(0, 4) +
      //           "..." +
      //           _creator?.substr(_creator?.length - 4)
      //         } fetched `
      //       );
      //       const creator = {};
      //       creator["name"] = data[0];
      //       creator["address"] = _creator;
      //       creator["description"] = data[1];
      //       creator["subscriptionAmount"] = parseInt(
      //         ethers.utils
      //           .formatEther(
      //             (
      //               parseFloat(
      //                 ethers.BigNumber.from(
      //                   ethers.utils.parseEther(data[2].toString())
      //                 ).toString()
      //               ) / 1000000
      //             ).toString()
      //           )
      //           .toString()
      //       );
      //       creator["subscriptionAmountInHex"] = ethers.utils.parseEther(
      //         data[2].toString()
      //       );
      //       console.log(creator);

      //       setCreatorData(creator);
      //     },
      //   });

      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "getCreatorDataExtended",
          params: { _creator },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          console.log(data);
          const creator = {};
          creator["name"] = data[0];
          creator["address"] = _creator;
          creator["description"] = data[1];
          creator["tokenIdNumber"] = data[2];
          creator["amountPublishedVideos"] = data[3];
          creator["amountCreator"] = data[4];

          //bronze
          creator["bronze"] = {
            bronzeSubscriptionAmount: parseInt(
              ethers.utils
                .formatEther(
                  (
                    parseInt(
                      ethers.BigNumber.from(
                        ethers.utils.parseEther(data[5][1].toString())
                      ).toString()
                    ) / 1000000
                  ).toString()
                )
                .toString()
            ),
            bronzeSubscriptionAmountInHex: ethers.utils.parseEther(
              data[5][1].toString()
            ),
            bronzeSubscriptionCount: parseInt(data[5][2].toString()),
          };

          //silver

          creator["silver"] = {
            silverSubscriptionAmount: parseInt(
              ethers.utils
                .formatEther(
                  (
                    parseInt(
                      ethers.BigNumber.from(
                        ethers.utils.parseEther(data[6][1].toString())
                      ).toString()
                    ) / 1000000
                  ).toString()
                )
                .toString()
            ),
            silverSubscriptionAmountInHex: ethers.utils.parseEther(
              data[6][1].toString()
            ),
            silverSubscriptionCount: parseInt(data[6][2].toString()),
          };

          //gold
          creator["gold"] = {
            goldSubscriptionAmount: parseInt(
              ethers.utils
                .formatEther(
                  (
                    parseInt(
                      ethers.BigNumber.from(
                        ethers.utils.parseEther(data[7][1].toString())
                      ).toString()
                    ) / 1000000
                  ).toString()
                )
                .toString()
            ),
            goldSubscriptionAmountInHex: ethers.utils.parseEther(
              data[7][1].toString()
            ),
            goldSubscriptionCount: parseInt(data[7][2].toString()),
          };

          setCreatorData(creator);
        },
      });
    }
  }
  async function getUserSignupData() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "isSubscribed",
          params: { _sender: account },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          console.log(data);
          setIsUserSubscribed(data);
        },
      });
    }
  }
  async function checkOwner() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "getOwner",
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          console.log(`Account : ${account}`);
          console.log(`data : ${data}`);

          if (account.toLowerCase() == data.toLowerCase()) {
            setIsOwner(true);
            setIsUserSubscribed(true);
          }
        },
      });
    }
  }
  useEffect(() => {
    getCreatorData();
    getUserSignupData();
    checkOwner();
  }, [account]);
  return (
    <>
      <Head>
        <title>
          Creators |{" "}
          {creatorData.address?.substr(0, 4) +
            "..." +
            creatorData.address?.substr(creatorData.address?.length - 4)}
        </title>
      </Head>
      <>
        {contractAddress ? (
          !isUserSubscribed && !isOwner ? (
            <SubscriptionCard creator={creatorData} />
          ) : (
            <h1
              style={{
                width: "100vw",
                fontSize: "12rem",
              }}
            >
              User Subscribed
            </h1>
          )
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
    </>
  );
};

export default Creators;
