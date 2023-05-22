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
import { MdVideoLibrary } from "react-icons/md";
import { motion } from "framer-motion";
import { fadeInUp, routeAnimation, stagger } from "../../../utils/animations";
import Image from "next/dist/client/image";
import tfuel from "../../../assets/img/tfuel-logo.svg";
const Creators = () => {
  const router = useRouter();
  const _creator = router.query.id;
  const [creatorData, setCreatorData] = useState({
    amountPublishedVideos: { _hex: 0 },
    tokenIdNumber: { _hex: 0 },
    bronze: { bronzeSubscriptionCount: 0, bronzeSubscriptionAmount: 0 },
    silver: { silverSubscriptionCount: 0, silverSubscriptionAmount: 0 },
    gold: { SubscriptionCount: 0, goldSubscriptionAmount: 0 },
  });
  const [videos, setVideos] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [subscriptionRenewed, setSubscriptionRenewed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(1);
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();
  const { enableWeb3, authenticate, account, isWeb3Enabled, Moralis } =
    useMoralis();
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
      message: `${msg} Successfully (Reload page after tx confirmation or wait for tx to complete)`,
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

  async function upgradeTier(_tierToSuscribe, _suscriptionAmount) {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      console.log(
        "-------------------",
        _tierToSuscribe,
        "---------",
        _suscriptionAmount,
        "------",
        _creator,
        _suscriptionAmount.toString()
      );
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "userSubscribe",
          msgValue: ethers.utils
            .parseEther(_suscriptionAmount.toString())
            .toString(),
          params: { _tier: _tierToSuscribe },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error("error", error);
        },
        onSuccess: async data => {
          successNotification(`TX : ${data.hash} submitted`);
          setSubscriptionTier(_tierToSuscribe);
          await data.wait(1);
          successNotification("Subscribed to Creator");
          router.reload();
        },
      });
    }
  }

  async function getCreatorData() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "getProfileData",
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          //   console.log("calling user contract instance");
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
          setSubscriptionRenewed(data[0]);
          setSubscriptionTier(parseInt(data[1].toString()));
        },
      });
    }
  }
  console.log("setSubscriptionRenewed", subscriptionRenewed);
  async function userSubscribedNftverification() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "balanceOf",
          params: { owner: account },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          if (parseInt(data._hex) > 0) {
            setIsUserSubscribed(true);
          } else {
            setIsUserSubscribed(false);
          }
        },
      });
    }
  }
  console.log("cratordata", creatorData);
  async function getVideos() {
    if (!isWeb3Enabled) await enableWeb3();
    console.log(subscriptionTier, isUserSubscribed, isOwner);
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "getVideosData",
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          const videoArr = [];
          data.map((item, index) => {
            // console.log(`Item : ${item[index]}`);
            const video = {};
            video["name"] = item[0];
            video["videoURL"] = item[1];
            video["description"] = item[2];
            video["hidden"] = item[3];
            video["tier"] = parseInt(item[4]?.toString());
            console.log(videoArr);
            if (isOwner || subscriptionTier == 3) {
              console.log("goldTier or owner");
              videoArr.push(video);
            } else if (isUserSubscribed && subscriptionTier == 1) {
              console.log("bronzeTier");
              if (video.tier == 1) {
                videoArr.push(video);
              }
            } else if (isUserSubscribed && subscriptionTier == 2) {
              console.log("silverTier");
              if (video.tier <= 2 && video.tier >= 1) {
                // const silverArr = [video];
                // setVideos(prevState => [...prevState, ...silverArr]);
                videoArr.push(video);
              }
            }
          });
          setVideos(videoArr);
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
          //   console.log(`Account : ${account}`);
          console.log(`Owner : ${data}`);

          if (account.toLowerCase() == data.toLowerCase()) {
            setIsOwner(true);
            setIsUserSubscribed(true);
            setSubscriptionTier(3);
          }
        },
      });
    }
  }
  const withdrawSubscriptionAmount = async () => {
    console.log(`Creator contract : ${_creator}`);
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      const options = {
        contractAddress: _creator,
        functionName: "amountCreator",
        abi: userProfileAbi,
      };
      const transaction = await Moralis.executeFunction(options);
      console.log(
        ethers.utils.formatEther(ethers.BigNumber.from(transaction).toString())
      );
      const value = ethers.utils.formatEther(
        ethers.BigNumber.from(transaction).toString()
      );
      //   setAccumulatedSubscriptionFee(
      //     parseFloat(
      //       ethers.utils.formatEther(BigNumber.from(transaction).toString())
      //     )
      //   );

      await runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _creator,
          functionName: "withdrawAmount",
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: async data => {
          console.log(data);
          //   successNotification("Withdrawal request submitted");
          //   await data.wait(1);
          //   successNotification("Amount Withdrawn successfully!");
        },
      });
    }
  };
  //   useEffect(() => {
  //     setIsOwner(false);
  //     setIsUserSubscribed(false);
  //   }, [account]);
  useEffect(() => {
    userSubscribedNftverification();
    getCreatorData();
    getUserSignupData();
    checkOwner();
    // getVideos();
  }, [account]);

  useEffect(() => {
    getVideos();
  }, [subscriptionTier, isUserSubscribed, isOwner, subscriptionTier]);

  const tfuelImage = (
    <span className="image-smaller">
      <span className="tfuel-image--container ">
        <Image style={{ width: "24px" }} src={tfuel}></Image>
      </span>
    </span>
  );
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
      <div className="bg-color-profileuser">
        <motion.div
          style={{ paddingTop: "6rem" }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="user-profile-card"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="user-profile-card-header">
              <div>
                <img
                  className="user-profile-card-image"
                  src={
                    "https://s.yimg.com/uu/api/res/1.2/T0JXIlePkQy.jLDbMfMr5w--~B/Zmk9ZmlsbDtoPTU1NDt3PTg3NTthcHBpZD15dGFjaHlvbg--/https://media-mbst-pub-ue1.s3.amazonaws.com/creatr-uploaded-images/2021-12/9908fc00-5398-11ec-b7bf-8dded52a981b.cf.webp"
                  }
                ></img>
              </div>
              <div>@{creatorData.name}</div>
              {isOwner && (
                <div
                  className="withdraw-fee--container"
                  style={{
                    width: "13rem",
                  }}
                >
                  <button
                    className="effect effect-4"
                    onClick={withdrawSubscriptionAmount}
                    style={{
                      fontSize: "1.2rem",
                      border: "1px solid #01eacf",
                    }}
                  >
                    Withdraw
                  </button>
                </div>
              )}
              <div className="user-profile-data-container">
                <div className="user-profile-data-con">
                  <div className="user-profile-title">Subscribers</div>
                  <div className="user-profile-data">
                    {parseInt(creatorData.tokenIdNumber._hex)}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="user-svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="user-profile-data-con">
                  <div className="user-profile-title">Videos</div>
                  <div className="user-profile-data">
                    {parseInt(creatorData.amountPublishedVideos._hex)}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="user-profile-data-con">
                <div className="user-profile-title">Tier Subscribers</div>
                <div className="user-profile-card-tiers">
                  <div className="data-coin">
                    <div className="coin bronze"></div>
                    <div className="center-data-coin">
                      {creatorData.bronze.bronzeSubscriptionCount}
                    </div>
                  </div>
                  <div className="data-coin">
                    <div className="coin silver"></div>
                    <div className="center-data-coin">
                      {creatorData.silver.silverSubscriptionCount}
                    </div>
                  </div>
                  <div className="data-coin">
                    <div className="coin gold"></div>
                    <div className="center-data-coin">
                      {creatorData.gold.goldSubscriptionCount}
                    </div>
                  </div>
                </div>
              </div>
              {isUserSubscribed ? (
                <div className="user-profile-data-con add-gap">
                  <div className="user-profile-title">Upgrade tier?</div>
                  <div className="container-buy-tiers">
                    <div className="container-renew-tier renew-bronze">
                      <div className="container-renew-data">
                        <div>Purchased</div>
                      </div>
                    </div>
                    {subscriptionTier < 2 && !isOwner ? (
                      <div
                        className="container-renew-tier renew-silver"
                        onClick={() => {
                          upgradeTier(
                            2,
                            creatorData.silver.silverSubscriptionAmount
                          );
                        }}
                      >
                        <div className="container-renew-data">
                          <div>Subscribe</div>
                          <div>
                            {creatorData.silver.silverSubscriptionAmount}
                          </div>
                        </div>
                        <div className="container-renew-image">
                          {tfuelImage}
                        </div>
                      </div>
                    ) : (
                      <div className="container-renew-tier bought-silver">
                        <div className="container-renew-data">
                          <div>Purchased</div>
                        </div>
                      </div>
                    )}
                    {subscriptionTier < 3 && !isOwner ? (
                      <div
                        className="container-renew-tier renew-gold"
                        onClick={() => {
                          upgradeTier(
                            3,
                            creatorData.gold.goldSubscriptionAmount
                          );
                        }}
                      >
                        <div className="container-renew-data">
                          <div>Subscribe</div>
                          <div>{creatorData.gold.goldSubscriptionAmount}</div>
                        </div>
                        <div className="container-renew-image">
                          {tfuelImage}
                        </div>
                      </div>
                    ) : (
                      <div className="container-renew-tier bought-gold">
                        <div className="container-renew-data">
                          <div>Purchased</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </motion.div>
        </motion.div>
        {contractAddress ? (
          !isUserSubscribed && !subscriptionRenewed && !isOwner ? (
            <SubscriptionCard creator={creatorData} />
          ) : (
            <>
              <div
                style={{
                  paddingTop: "1rem",
                  paddingBottom: "10rem",
                }}
              >
                <section className="aks-container">
                  <motion.div
                    className="iframe-video--grid"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                  >
                    {videos.length > 0 &&
                      videos.map((data, index) => (
                        <motion.div
                          variants={fadeInUp}
                          initial="initial"
                          animate="animate"
                          className="iframe-video--card"
                          key={data.videoURL}
                        >
                          <h3 className="iframe-card--heading">
                            <span>
                              {" "}
                              <span
                                style={{
                                  //   color: "rgba(220, 53, 69, 0.8)",
                                  color: "#18c99d",
                                }}
                              >
                                <MdVideoLibrary />
                              </span>
                              {data.name}
                            </span>
                          </h3>
                          <hr />
                          <div className="iframe--container">
                            <iframe
                              src={data.videoURL}
                              title={data.name}
                              frameBorder="0"
                              allow="accelerometer; autoplay; encrypted-media;"
                              loading="lazy"
                              allowFullScreen
                            ></iframe>
                          </div>
                          <p className="iframe-card--description">
                            {data?.description?.length <= 200
                              ? data?.description
                              : data.description.substring(0, 200) + "..."}
                          </p>
                        </motion.div>
                      ))}
                  </motion.div>
                </section>
              </div>
            </>
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
      </div>
    </>
  );
};

export default Creators;
