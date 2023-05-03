import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import SubscriptionCard from "../../components/SubscriptionCard/SubscriptionCard";
import { route } from "next/dist/server/router";
import { useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddresses from "../../constants/networkMapping.json";
import abi from "../../constants/UserFactory.json";
import { ethers } from "ethers";

const Creators = () => {
  const router = useRouter();
  const _creator = router.query.id;
  const [creatorData, setCreatorData] = useState({});
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
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "getCreator",
          params: { _creator },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          successNotification(
            `Data for Creator ${
              _creator?.substr(0, 4) +
              "..." +
              _creator?.substr(_creator?.length - 4)
            } fetched `
          );
          const creator = {};
          creator["name"] = data[0];
          creator["address"] = _creator;
          creator["description"] = data[1];
          creator["subscriptionAmount"] = parseInt(
            ethers.utils
              .formatEther(
                (
                  parseFloat(
                    ethers.BigNumber.from(
                      ethers.utils.parseEther(data[2].toString())
                    ).toString()
                  ) / 1000000
                ).toString()
              )
              .toString()
          );
          creator["subscriptionAmountInHex"] = ethers.utils.parseEther(
            data[2].toString()
          );
          console.log(creator);

          setCreatorData(creator);
        },
      });
    }
  }
  useEffect(() => {
    getCreatorData();
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
          <SubscriptionCard creator={creatorData} />
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
