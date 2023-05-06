// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserProfile.sol";

contract UserFactory {

    address[] public createdProfiles;
    mapping(string=>address) public userProfile;
    address public admin;

    constructor(){
        admin = msg.sender;
    }

    function createProfile(string memory _tokenName,string memory _tokenSymbol,
    string memory _name,string memory _description,uint _subscriptionAmount) public
    {
        address profileAddress = userProfile[_name];
        require(profileAddress == address(0));
        UserProfile newUser = new UserProfile(_tokenName,_tokenSymbol,msg.sender,_name,_description,_subscriptionAmount);
        address addr = address(newUser);
        //add the created profile to store data variables
        createdProfiles.push(addr);
        userProfile[_name] = addr;
    }
    function isSignedUp(address _creatorAddress,string memory _name) external view returns(bool){
        address profileAddress = userProfile[_name];
        if(profileAddress == _creatorAddress) return true;
        return false;
    }
    function working() public pure returns(string memory){
        return "yes smartcontract deployed";
    }
    function getAllCreators() public view returns(address[] memory){
        return createdProfiles;
    }

    function getCreator(address _creator) public view returns(string memory,string memory,uint){
        return UserProfile(_creator).getCreatorInfo();
    }
    function getCreatorOld(address _creator) public view returns(string memory,string memory,uint,uint,uint,uint){
        return UserProfile(_creator).getProfileData();
    }
}