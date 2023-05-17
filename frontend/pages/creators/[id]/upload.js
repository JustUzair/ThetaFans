import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Router from "next/router";
import contractAddresses from "../../../constants/networkMapping.json";
import abi from "../../../constants/UserFactory.json";
import userProfileAbi from "../../../constants/UserProfile.json";
import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import tfuel from "../../../assets/img/tfuel-logo.svg";
import Image from "next/image";
import GreenTick from "../../../assets/img/Green-Tick.png";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { HiOutlineUpload } from "react-icons/hi";
import Head from "next/head";
import { motion } from "framer-motion";
import { fadeInUp, routeAnimation, stagger } from "../../../utils/animations";
import { useNotification } from "web3uikit";

import loadingSpinner from "../../../assets/img/loading-spinner.svg";
function ContractsPage() {
  const router = useRouter();

  //INPUT STATES
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTier, setSelectedTier] = useState(1);
  //COLLECTION ADDRESS, VIDEO PROTECTED FOR THIS COLLECTION
  // const [collectionAddress, setCollectionAddress] = useState( ); //SET THIS MAYBE REDUX OR WHATEVER !!!!!!!!! @Uzair
  const { id: _currentCreatorContractAddress } = router.query;
  //VIDEO FILE
  const [selectedFile, setSelectedFile] = useState(null);
  //UPLOAD PROGRESS
  const [uploadProgress, setUploadProgress] = useState(0);
  //UPLOADING VIDEO STATUS
  const [uploading, setUploading] = useState(false);
  //ERRORS WHEN UPLOADING
  const [errorMsg, setErrorMsg] = useState({
    msg: "",
    details: "",
  });
  const dispatch = useNotification();

  //video url = https://player.thetavideoapi.com/video/:videoid example.https://player.thetavideoapi.com/video/video_d5kiagg6ip7u6aup5wkm2g8m79
  const [videourl, setVideourl] = useState("");

  // Check if user is an artist
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [creatorContractAddress, setCreatorContractAddress] = useState(
    "0x0000000000000000000000000000000000000000"
  );
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
      message: `${msg} Successfully! (Reload after the transaction succeeds)`,
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
  async function uploadVideoDataToChain(videoid) {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi: userProfileAbi,
          contractAddress: _currentCreatorContractAddress,
          functionName: "addVideo",
          params: {
            _name: name,
            _videoURL: `https://player.thetavideoapi.com/video/${videoid}`,
            _description: description,
            _tier: selectedTier,
          },
        },

        // ethers.utils.parseEther(subscriptionCost)
        //
        onError: error => {
          failureNotification(error.message);
          console.error("error calling smart contract", error);
        },
        onSuccess: data => {
          console.log("succes", data);
          // Router.push("/creators");
          successNotification(`Video uploaded`);
        },
      });
    }
  }
  function delay(seconds) {
    return new Promise(resolve => {
      setTimeout(resolve, seconds * 1000);
    });
  }

  const onChangeDescription = event => {
    setDescription(event.target.value);
  };

  const onChangeName = event => {
    setName(event.target.value);
  };
  console.log(errorMsg);
  const handleFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };
  const handleUpload = async creatorCollectionAddress => {
    //creatorCollectionAddress = creator profle smart contract
    if (!selectedFile) {
      setErrorMsg({
        msg: "please select a file",
        details: "",
      });
      setUploading(false);
      return;
    }
    if (name.length === 0) {
      setErrorMsg({
        msg: "please add a name",
        details: "",
      });
      setUploading(false);
      return;
    }
    if (description.length === 0) {
      setErrorMsg({
        msg: "please add a description",
        details: "",
      });
      setUploading(false);
      return;
    }

    //uploading state as true
    setUploading(true);

    //get pre signed video url
    const options1 = {
      method: "POST",
      url: "https://api.thetavideoapi.com/upload",
      headers: {
        "x-tva-sa-id": "srvacc_gke43qct7bhg2z7rea4faeprr",
        "x-tva-sa-secret": "1d1djzj4spzw9366dx1ccus84n9usgui",
      },
    };

    let res1;
    try {
      res1 = await axios(options1);
    } catch (err) {
      setErrorMsg({
        msg: "internal server error please try out later",
        details: err,
      });
      setUploading(false);
      return;
    }
    //pre signed video url(update video only), video id(show video and update it) and creation time
    const { id, presigned_url, create_time } = res1.data.body.uploads[0];

    //upload the video

    const options2 = {
      method: "PUT",
      url: presigned_url,
      headers: {
        "Content-Type": "application/octet-stream",
      },
      data: selectedFile,
    };

    let res2;
    try {
      res2 = await axios(options2);
    } catch (err) {
      setErrorMsg({
        msg: "error uploading video",
        details: err,
      });
      setUploading(false);
      return;
    }

    //transcode the video(add video configuration as protection with nft)
    const options3 = {
      method: "POST",
      url: "https://api.thetavideoapi.com/video",

      headers: {
        "x-tva-sa-id": "srvacc_gke43qct7bhg2z7rea4faeprr",
        "x-tva-sa-secret": "1d1djzj4spzw9366dx1ccus84n9usgui",
        "Content-Type": "application/json",
      },
      data: {
        source_upload_id: id, //id received before when creating the presigned url
        playback_policy: "public",
        //   nft_collection: creatorCollectionAddress,
        // drm_rules: [
        //   { nft_collection: creatorCollectionAddress, chain_id: 365 },
        // ], //enable wich nft have acces to it//365 testnet , 361 mainnet
        // use_drm: true, //enables private video
      },
    };
    let res3;
    try {
      res3 = await axios(options3);
    } catch (err) {
      setErrorMsg({
        msg: "error uploading video configuration",
        details: err,
      });
      setUploading(false);
      return;
    }
    const { id: videoid } = res3.data.body.videos[0]; //video id of the video id for acces it
    //track the video progress, when its completly finished push the video to the smart contract
    //this progress variable its for this function only
    let progress = 0;
    const progressOptions = {
      method: "GET",
      url: `https://api.thetavideoapi.com/video/${videoid}`,
      headers: {
        "x-tva-sa-id": "srvacc_gke43qct7bhg2z7rea4faeprr",
        "x-tva-sa-secret": "1d1djzj4spzw9366dx1ccus84n9usgui",
      },
    };
    //track the progress and finish when progress = 100
    while (progress < 100) {
      const resProgress = await axios(progressOptions);
      const { progress: videoProgress } = resProgress.data.body.videos[0];
      console.log(videoProgress);
      setUploadProgress(uploadProgress + videoProgress);
      progress = videoProgress;
    }
    // let obj = {
    //   _name: name,
    //   _description: description,
    //   _videoURL: `https://api.thetavideoapi.com/video/${videoid}`,
    //   _tier: selectedTier,
    // };
    console.log(
      `Name:${name}, Description :${description}, videoURL:${`https://api.thetavideoapi.com/video/${videoid}`}, Tier:${selectedTier} `
    );
    //push the video to the smart contract
    //push id, name, description and creation_date
    await uploadVideoDataToChain(videoid);
    await delay(5);
    //show video in the frontend
    setVideourl(`https://player.thetavideoapi.com/video/${videoid}`);
    setUploading(false);
    Router.push(`/creators/${_currentCreatorContractAddress}`); // redirect to creator page
  };
  //when videourl.length > 0 the video its already uploaded, sho show it
  let video = <></>;
  if (videourl.length > 0 && uploading === false) {
    video = (
      <>
        watching {videourl}
        <iframe src={videourl} width="100%" height="400"></iframe>
      </>
    );
  }
  //dev frontend , change after

  async function getCreatorContractAddress() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "getCreatorContractAddress",
          params: { _creatorAddress: account },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          console.log(data);
          setCreatorContractAddress(data.toString());
        },
      });
    }
  }
  async function checkOwner() {
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "isSignedUp",
          params: { _creatorAddress: account },
        },
        //
        onError: error => {
          console.error(error);
        },
        onSuccess: data => {
          console.log(`data : ${data}`);
          setIsSignedUp(data);
        },
      });
    }
  }
  useEffect(() => {
    checkOwner();
    if (isSignedUp) {
      getCreatorContractAddress();
    }
  }, [account, isSignedUp]);
  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <Head>
        <title>Upload Video</title>
      </Head>
      <div
        style={{
          width: "100px",
          paddingBottom: "16vh",
        }}
      ></div>
      {contractAddress ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="upload-video--container"
        >
          {isSignedUp &&
          creatorContractAddress?.toString().toLowerCase() ==
            _currentCreatorContractAddress?.toString().toLowerCase() ? (
            <div
              style={{
                width: "80%",
                padding: "20px 50px",
              }}
            >
              {/* selected tier: {selectedTier}, click tiers to select */}
              {!uploading && (
                <>
                  <br />
                  <div className="field">
                    <input
                      type="text"
                      name="fullname"
                      id="fullname"
                      placeholder="Full Name"
                      value={name}
                      onChange={onChangeName}
                    />
                    <label htmlFor="fullname">Name</label>
                  </div>
                  <br />
                  <div className="field">
                    <input
                      type="text"
                      name="description"
                      id="description"
                      placeholder="Description"
                      value={description}
                      onChange={onChangeDescription}
                    />
                    <label htmlFor="description">Description</label>
                  </div>
                  <br />
                  <div className="select-tier--container">
                    <span
                      style={{
                        fontSize: "1.7rem",
                      }}
                    >
                      Select Video Tier
                    </span>
                    <div
                      className="coin bronze"
                      onClick={() => {
                        setSelectedTier(1);
                      }}
                    >
                      <p>
                        {selectedTier == 1 && (
                          <Image
                            src={GreenTick}
                            style={{
                              width: "12px !important",
                            }}
                          ></Image>
                        )}
                      </p>
                    </div>
                    <div
                      className="coin silver"
                      onClick={() => {
                        setSelectedTier(2);
                      }}
                    >
                      <p>
                        {selectedTier == 2 && (
                          <Image
                            src={GreenTick}
                            style={{
                              width: "12px !important",
                            }}
                          ></Image>
                        )}
                      </p>
                    </div>
                    <div
                      className="coin gold"
                      onClick={() => {
                        setSelectedTier(3);
                      }}
                    >
                      <p>
                        {selectedTier == 3 && (
                          <Image
                            src={GreenTick}
                            style={{
                              width: "12px !important",
                            }}
                          ></Image>
                        )}
                      </p>
                    </div>
                  </div>
                  <br />
                  <input
                    type="file"
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={handleFileChange}
                    name="file-upload"
                    id="file-upload"
                    className="input-file"
                  />
                  <label htmlFor="file-upload" className="custom-file-upload">
                    <span
                      style={{
                        fontSize: "1.4rem",
                        marginRight: "10px",
                      }}
                    >
                      <HiOutlineUpload />
                    </span>
                    Choose Video
                  </label>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      textDecoration: "underline",
                      color: "#fff",
                      marginLeft: "13px",
                    }}
                  >
                    {selectedFile == null ? "" : selectedFile?.name}
                  </span>
                  <button
                    className="upload-video--btn"
                    onClick={() => {
                      //   handleUpload(collectionAddress);
                      handleUpload(_currentCreatorContractAddress);
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.4rem",
                        marginRight: "10px",
                      }}
                    >
                      <AiOutlineCloudUpload />
                    </span>
                    Upload
                  </button>
                  <br />
                </>
              )}

              {/*show messages errors, add notification for it*/}
              {errorMsg.msg.length > 0 && (
                <>
                  <br />
                  <span
                    style={{
                      background: "#FF494A",
                      padding: "10px 25px",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  >
                    {errorMsg.msg}
                  </span>
                  <br />
                </>
              )}

              {/* {video != <></> && (
                <>
                  <h2>Uploaded video:</h2>
                  video
                </>
              )} */}
              {/* when uploading show the video progress */}
              {uploading ? (
                <>
                  <br />
                  <div
                    style={{
                      width: "90%",
                      margin: "0 auto",
                      color: "#FF494A",
                      fontWeight: "400",
                    }}
                  >
                    This can take a few moments, please don&apos;t leave or
                    refresh this page!
                    <br />
                    <span
                      style={{
                        color: "#FF494A",
                        fontWeight: "400",
                      }}
                    >
                      Video upload in progress!
                    </span>
                    <br />
                    <br />
                    <span
                      className="upload-progress--btn"
                      style={{
                        color: "#fff",
                        width: "10rem",
                        display: "block",
                        margin: "0 auto",
                        textAlign: "center",
                        fontWeight: "700",
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <span>{uploadProgress}%</span>
                      <Image src={loadingSpinner} width={50} height={50} />
                    </span>
                  </div>
                  <br />
                </>
              ) : (
                <></>
              )}
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
                  You are not the owner of this contract
                </span>
              </div>
            </>
          )}
        </motion.div>
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
    </motion.div>
  );
}

export default ContractsPage;
