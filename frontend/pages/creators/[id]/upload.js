import { useState } from "react";
import axios from "axios";

function ContractsPage() {
  //INPUT STATES
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  //COLLECTION ADDRESS, VIDEO PROTECTED FOR THIS COLLECTION
  const [collectionAddress, setCollectionAddress] = useState(
    "0x248D4f9d8a36572ccC00528746013563E37D3853"
  ); //SET THIS MAYBE REDUX OR WHATEVER !!!!!!!!! @Uzair
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
  //video url = https://player.thetavideoapi.com/video/:videoid example.https://player.thetavideoapi.com/video/video_d5kiagg6ip7u6aup5wkm2g8m79
  const [videourl, setVideourl] = useState("");

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

    console.log("id", id);
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
        use_drm: true, //enables private video
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
      setUploadProgress(videoProgress);
      progress = videoProgress;
    }
    //push the video to the smart contract
    //push videoid, name, description and creation_date

    //show video in the frontend
    setVideourl(`https://player.thetavideoapi.com/video/${videoid}`);
    setUploading(false);
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
  return (
    <div className="upload-video--container">
      <div>
        Name
        <input value={name} type="text" onChange={onChangeName} />
        Description
        <input value={description} type="text" onChange={onChangeDescription} />
        <input
          type="file"
          accept="video/mp4,video/x-m4v,video/*"
          onChange={handleFileChange}
        />
        <button
          onClick={() => {
            //   handleUpload(collectionAddress);
            handleUpload("0x248D4f9d8a36572ccC00528746013563E37D3853");
          }}
        >
          Upload
        </button>
        <h2>created video:</h2>
        {video}
        {/*show messages errors, add notification for it*/}
        {errorMsg.msg}
        {/* when uploading show the video progress */}
        {uploading ? (
          <div>
            this can take few moments please dont leavt his page, video
            progress: {uploadProgress}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default ContractsPage;
