// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserFactory.sol";

contract UserProfile is ERC721, Ownable {

    struct VideoData {
        string name;
        string videoURL;
        string description;
        bool hidden;
        uint tier;
        // string previewVideoImage; //??maybe
    }

    struct Tier{
        string name;
        uint price;//required $ have to pay for subscribe, in drop(wei of tfuel)
        uint suscriptionsAmount;
    }

    //FACTORY CONTRACT
    address factoryContractAddr;

    //USER PROFILE LOGIC
    string public profileName;
    string public profileDescription;


    //BUISNESS LOGIC
    uint public tokenIdNumber;//amount tokens released
    uint public amountPublishedVideos;
    VideoData[] public publishedVideos;
    mapping(string=>uint) public videosIndex;
    uint public amountCreator; //amount creator have to withdraw
    uint public totalDonated; //total amount donated, analytics, this variable have not use yet
    uint public suscriptionFee; //20% of 100

    //TIERS LOGIC
    mapping(address=>uint) public userTier; //tier of each user 1-bronze 2-silver 3-gold
    mapping(uint=>Tier) public tierData;

    //SUBSCRIPTION LOGIC
    uint public subscriptionDuration = 30 days; //30 days
    //mapping subscriber to due date
    mapping(address=>uint) public subscriberDueDate;
    //mapping subscriber to last paid
    mapping(address=>uint) public subscriberLastPaid;

    mapping(address=>bool) userSubscribed;  //PREVENT MULTIPLE SUBSCRIPTIONS FROM SAME USER


    constructor(string memory _tokenName,string memory _tokenSymbol,address _sender,string memory _name,
    string memory _description,uint _bronzePrice,uint _silverPrice,uint _goldPrice,uint _suscriptionFee) ERC721(_tokenName,_tokenSymbol) 
    {
        factoryContractAddr = msg.sender;
        _transferOwnership(_sender);
        profileName = _name;
        profileDescription = _description;
        suscriptionFee = _suscriptionFee;
        //* 1000000; //convert tfuel to drop
        //create tiers
        tierData[1] = Tier("bronze",_bronzePrice * 1000000,0);
        tierData[2] = Tier("silver",_silverPrice * 1000000,0);
        tierData[3] = Tier("gold",_goldPrice * 1000000,0);

    }


    function userSubscribe(uint _tier) public payable {
        //existing tier
        require(_tier>=1,"invalid tier");
        require(_tier<=3,"invalid tier");            
        require(msg.value > tierData[_tier].price);
            
        //fees logic
        UserFactory factoryContract = UserFactory(factoryContractAddr);
        uint organizationFees = suscriptionFee * msg.value/100;            

        //if user does not own NFT
        if(balanceOf(msg.sender) == 0) {
            //mint nft
            tokenIdNumber = tokenIdNumber + 1;
            _safeMint(msg.sender, tokenIdNumber);  
           
           //recaude fees
            factoryContract.recaudeFees{value:organizationFees}();
            amountCreator += msg.value - organizationFees;

            userSubscribed[msg.sender] = true;

            subscriberDueDate[msg.sender] = block.timestamp + subscriptionDuration;
            subscriberLastPaid[msg.sender] = block.timestamp;
            userTier[msg.sender] = _tier;
            tierData[_tier].suscriptionsAmount += 1;

        }
        //if user owns NFT, check if they have paid their subscription, if not pay and update due date and subscription status
        else {
            require(userSubscribed[msg.sender] == false,"user already subscribed");
            //recaude fees
            factoryContract.recaudeFees{value:organizationFees}();
            amountCreator += msg.value - organizationFees;
            //renew suscription
            userSubscribed[msg.sender] = true;
            subscriberDueDate[msg.sender] = block.timestamp + subscriptionDuration;
            subscriberLastPaid[msg.sender] = block.timestamp;
            userTier[msg.sender] = _tier;
            tierData[_tier].suscriptionsAmount += 1;



        }
    }

    //check if all users have paid their monthly subscription, if not, remove their subscription if they have not paid
    function checkSubscribers() public {
        uint _tokenIdNumber = tokenIdNumber;
        for(uint i = 0; i <_tokenIdNumber; i++){
            address _owner = ownerOf(i);
            if(subscriberDueDate[_owner] < block.timestamp){
                userSubscribed[_owner] = false;
            }
        }
    }


    function donate()public payable{

        //fees logic
        UserFactory factoryContract = UserFactory(factoryContractAddr);
        uint organizationFees = suscriptionFee * msg.value/100; 
        //distribute fees
        factoryContract.recaudeFees{value:organizationFees}();
        amountCreator += msg.value - organizationFees;
        totalDonated += msg.value;

    }

    // restricted to owner
    function addVideo(string memory _name, string memory _videoURL, string memory _description,uint _tier) public onlyOwner{
        //prevent user reupload videos
        require(videosIndex[_videoURL] == 0);
        //index the video
        amountPublishedVideos += 1;
        videosIndex[_videoURL] = amountPublishedVideos;
        //add video data
        publishedVideos.push(VideoData(_name,_videoURL,_description,false,_tier));
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

    function getProfileData() external view returns(string memory,string memory,uint,uint,uint,Tier memory,Tier memory,Tier memory){
        return (profileName,profileDescription,tokenIdNumber,amountPublishedVideos,amountCreator,tierData[1],tierData[2],tierData[3]);
    }


    function isSubscribed(address _sender) external view returns(bool,uint){
        return (userSubscribed[_sender],userTier[_sender]);
    }


   /**
     * 
     * @notice remove approve and transfer functions for prevent users transfer tokens.
     * 
    */

    //override approve function for prevent approve
    function approve(address to, uint256 tokenId) public override{
        require(false);
    }
    //override setApprovalForAll function for prevent approve
    function setApprovalForAll(address operator, bool approved) public override{
        require(false);
    }

    //override transferFrom function for prevent transfer
    function transferFrom(address from, address to, uint256 tokenId) public override{
        require(false);
    }

    //override safeTransferFrom function for prevent transfer
    function safeTransferFrom(address from, address to, uint256 tokenId) public override{
        require(false);
    }

    //override safeTransferFrom function for prevent transfer
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override{
        require(false);
    }
}
