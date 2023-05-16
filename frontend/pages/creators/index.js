import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import abi from "../../constants/UserFactory.json";
import contractAddresses from "../../constants/networkMapping.json";
import Image from "next/image";
import tfuel from "../../assets/img/tfuel-logo.svg";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";
import { useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { fadeInUp, routeAnimation, stagger } from "../../utils/animations";
import userProfileAbi from "../../constants/UserProfile.json";

const Creators = () => {
  const [contentCreators, setContentCreators] = useState([]);
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
  const getContentCreators = async function () {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "getAllCreators",
          params: {},
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          successNotification(`Creators Fetched`);
          data.map(_creator => {
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
                console.log("called user profile");
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
                const arr1 = [creator];
                console.log(arr1);
                setContentCreators(prevState => [...prevState, ...arr1]);
              },
            });
          });
        },
      });
    }
  };

  useEffect(() => {
    getContentCreators();
  }, [account]);
  return (
    <>
      <Head>
        <title>Creators</title>
      </Head>
      {contractAddress != null ? (
        <div className="shell">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="card-container"
          >
            {contentCreators.length > 0 ? (
              contentCreators.map((_creator, index) => {
                // Formatting the amount to ether
                // console.log(
                //   ethers.utils
                //     .formatEther(
                //       (
                //         parseFloat(
                //           ethers.BigNumber.from(
                //             _creator.subscriptionAmount
                //           ).toString()
                //         ) / 1000000
                //       ).toString()
                //     )
                //     .toString()
                // );

                return (
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="creator-card"
                    key={index}
                  >
                    <div className="wsk-cp-img">
                      <img
                        src={
                          (index % 3 == 0 &&
                            "https://s.yimg.com/uu/api/res/1.2/T0JXIlePkQy.jLDbMfMr5w--~B/Zmk9ZmlsbDtoPTU1NDt3PTg3NTthcHBpZD15dGFjaHlvbg--/https://media-mbst-pub-ue1.s3.amazonaws.com/creatr-uploaded-images/2021-12/9908fc00-5398-11ec-b7bf-8dded52a981b.cf.webp") ||
                          (index % 3 == 2 &&
                            "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/b0e4f2123542479.60f0519010164.jpg") ||
                          (index % 3 == 1 &&
                            "https://i.seadn.io/gae/jzpknD5e9NF8Bv1Xy3dwWeorx1Ny8fYT_o6ozWhuKlhcisnQn95GycWXjeRbKclgwEF4R9IaHKRCRYEX96B8rB38XWKuSuLzQiI_ZQ?auto=format&w=1000")
                        }
                        alt="Creator"
                        className="img-responsive"
                      />
                    </div>
                    <div className="wsk-cp-text">
                      <div className="category">
                        <span>{`${
                          _creator.name.split(" ")[0] || _creator.name
                        } `}</span>
                      </div>
                      <div className="title-product">
                        <h3>
                          {_creator.address?.substr(0, 4) +
                            "..." +
                            _creator.address?.substr(
                              _creator.address?.length - 4
                            )}
                        </h3>
                      </div>
                      <div className="description-prod">
                        <p>{_creator.description}</p>
                      </div>
                      <div className="card-footer">
                        <Link
                          href={{
                            pathname: `/creators/${_creator.address}`,
                          }}
                        >
                          <button className="subscribe-btn .cta-01">
                            <span>
                              Sub starts{" "}
                              <span className="tfuel-image--container">
                                <Image src={tfuel}></Image>
                              </span>
                              {_creator.bronze.bronzeSubscriptionAmount}
                            </span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "50%",
                    height: "100vh",
                    zIndex: "99",
                    color: "white",
                    fontSize: "2rem",
                    wordWrap: "break-word",
                    margin: "0 auto",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                  }}
                >
                  <span
                    style={{
                      background: "#FF494A",
                      padding: "10px 25px",
                      borderRadius: "20px",
                    }}
                  >
                    No creators associated with this contract were found!!!
                  </span>
                </div>
              </>
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

export default Creators;
