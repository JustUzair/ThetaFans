// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is ERC721, Ownable {

    struct VideoData {
        string name;
        string videoURL;
        string description;
        bool hidden;
        // string previewVideoImage; //??maybe
    }

    //USER PROFILE LOGIC
    string public profileName;
    string public profileDescription;


    //BUISNESS LOGIC
    uint public tokenIdNumber;//amount tokens released
    uint public amountPublishedVideos;
    uint public subscribeAmount; //required $ have to pay for suscribe, in drop(wei of tfuel)
    VideoData[] public publishedVideos;
    mapping(string=>uint) public videosIndex;
    uint public amountCreator; //amount creator have to withdraw
    uint public totalDonated; //total amount donated, analytics, this variable have not use yet

    constructor(string memory _tokenName,string memory _tokenSymbol,address _sender,string memory _name,string memory _description,uint _subscribeAmount) ERC721(_tokenName,_tokenSymbol) 
    {
        _transferOwnership(_sender);
        profileName = _name;
        profileDescription = _description;
        subscribeAmount = _subscribeAmount * 1000000;//convert tfuel to drop
    }


    function userSuscribe() public payable {
        require(msg.value > subscribeAmount);
        tokenIdNumber = tokenIdNumber + 1;
        _safeMint(msg.sender, tokenIdNumber);  
        amountCreator += msg.value;
    }

    function donate()public payable{

        amountCreator += msg.value;
        totalDonated += msg.value;

    }

    // restricted to owner
    function addVideo(string memory _name, string memory _videoURL, string memory _description) public onlyOwner{
        //prevent user reupload videos
        require(videosIndex[_videoURL] == 0);
        //index the video
        amountPublishedVideos += 1;
        videosIndex[_videoURL] = amountPublishedVideos;
        //add video data
        publishedVideos.push(VideoData(_name,_videoURL,_description,false));
        
    }

    // restricted to owner //withdraws suscriptions and donations amount
    function withdrawAmount() public onlyOwner{
        address owner = owner();

        payable(owner).transfer(amountCreator);
        amountCreator = 0;
        
    }

    function getVideosData() public view returns( VideoData[] memory){
        //IMPLEMENT QUERY BY INDEX

        return publishedVideos;
    }

    function hideVideo(string memory _videoUrl) public onlyOwner{
        //get video index
        uint _videoIndex = videosIndex[_videoUrl];
        //require video exists
        require(_videoIndex > 0);
        //mark video as hide
        publishedVideos[_videoIndex - 1].hidden = true; //[_videoIndex - 1] because index count start at 1 for prevent bugs
        
    }

    function showVideo(string memory _videoUrl) public onlyOwner{
        //get video index
        uint _videoIndex = videosIndex[_videoUrl];
        //require video exists
        require(_videoIndex > 0);
        //mark video as hide
        publishedVideos[_videoIndex - 1].hidden = false; //[_videoIndex - 1] because index count start at 1 for prevent bugs
    }

    function getProfileData() external view returns(string memory,string memory,uint,uint,uint,uint){
        return (profileName,profileDescription,tokenIdNumber,amountPublishedVideos,subscribeAmount,amountCreator);
    }

    function getCreatorInfo() external view returns(string memory,string memory,uint){
        return (profileName,profileDescription,subscribeAmount);
    }
}
