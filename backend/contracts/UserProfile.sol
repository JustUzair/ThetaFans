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
    uint public subscribeAmount; //required $ have to pay for subscribe, in drop(wei of tfuel)
    VideoData[] public publishedVideos;
    mapping(string=>uint) public videosIndex;
    uint public amountCreator; //amount creator have to withdraw
    uint public totalDonated; //total amount donated, analytics, this variable have not use yet


    uint public subscriptionDuration = 30 days; //30 days
    //mapping subscriber to due date
    mapping(address=>uint) public subscriberDueDate;
    //mapping subscriber to last paid
    mapping(address=>uint) public subscriberLastPaid;

    mapping(address=>bool) userSubscribed;  //PREVENT MULTIPLE SUBSCRIPTIONS FROM SAME USER


    constructor(string memory _tokenName,string memory _tokenSymbol,address _sender,string memory _name,string memory _description,uint _subscribeAmount) ERC721(_tokenName,_tokenSymbol) 
    {
        _transferOwnership(_sender);
        profileName = _name;
        profileDescription = _description;
        subscribeAmount = _subscribeAmount * 1000000;//convert tfuel to drop
    }


    function userSubscribe() public payable {
        require(_balances[msg.sender] == 0,"user already subscribed");
        require(msg.value > subscribeAmount);
        tokenIdNumber = tokenIdNumber + 1;
        _safeMint(msg.sender, tokenIdNumber);  
        amountCreator += msg.value;
        userSubscribed[msg.sender] = true;

        subscriberDueDate[msg.sender] = block.timestamp + subscriptionDuration;
        subscriberLastPaid[msg.sender] = block.timestamp;
    }

    //resubscribe if userSubscribed is false, collect monthly payment and then set userSubscribed to true
    function userResubscribe() public payable {
        require(userSubscribed[msg.sender] == false,"user already subscribed");
        require(msg.value > subscribeAmount);
        amountCreator += msg.value;
        userSubscribed[msg.sender] = true;

        subscriberDueDate[msg.sender] = block.timestamp + subscriptionDuration;
        subscriberLastPaid[msg.sender] = block.timestamp;
    }

    //check if all users have paid their monthly subscription, if not, remove their subscription if they have not paid
    function checkSubscribers() public {
        for(uint i = 0; i < _owners.length; i++){
            if(subscriberDueDate[_owners[i]] < block.timestamp){
                userSubscribed[_owners[i]] = false;
            }
        }
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
        //check subscribers
        checkSubscribers();
        
    }

    // restricted to owner //withdraws subscriptions and donations amount
    function withdrawAmount() public onlyOwner{
        address owner = owner();

        payable(owner).transfer(amountCreator);
        amountCreator = 0;
        //check subscribers
        checkSubscribers();
        
    }

    function getOwner()external view returns(address){
        address owner = owner();
        return owner;
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
        //check subscribers
        checkSubscribers();
        
    }

    function showVideo(string memory _videoUrl) public onlyOwner{
        //get video index
        uint _videoIndex = videosIndex[_videoUrl];
        //require video exists
        require(_videoIndex > 0);
        //mark video as hide
        publishedVideos[_videoIndex - 1].hidden = false; //[_videoIndex - 1] because index count start at 1 for prevent bugs
        //check subscribers
        checkSubscribers();
    }

    function getProfileData() external view returns(string memory,string memory,uint,uint,uint,uint){
        return (profileName,profileDescription,tokenIdNumber,amountPublishedVideos,subscribeAmount,amountCreator);
    }

    function getCreatorInfo() external view returns(string memory,string memory,uint){
        return (profileName,profileDescription,subscribeAmount);
    }

    function isSubscribed(address _sender) external view returns(bool){
        return userSubscribed[_sender];
    }




   /**
     * 
     * @notice remove approve and transfer functions for prevent users transfer tokens.
     * 
    */

    //override approve function for prevent approve
    function approve(address to, uint256 tokenId) public override{
        require(false, "approvals disabled.");
    }
    //override setApprovalForAll function for prevent approve
    function setApprovalForAll(address operator, bool approved) public override{
        require(false, "approvals disabled.");
    }

    //override transferFrom function for prevent transfer
    function transferFrom(address from, address to, uint256 tokenId) public override{
        require(false, "transfers disabled.");
    }

    //override safeTransferFrom function for prevent transfer
    function safeTransferFrom(address from, address to, uint256 tokenId) public override{
        require(false, "transfers disabled.");
    }

    //override safeTransferFrom function for prevent transfer
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override{
        require(false, "transfers disabled.");
    }
}
