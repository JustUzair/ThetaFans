// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserProfile.sol";

contract UserFactory {

    address[] public createdProfiles;
    //string name to address mapping
    mapping(string=>address) public userProfile;
    //creator address to ERC721 contract address mapping
    mapping(address=>address) public creatorContract;
    address public admin;

    constructor(){
        admin = msg.sender;
    }

    function createProfile(string memory _name,string memory _description,uint _subscriptionAmount) public
    {
        //check username is not taken
        address profileAddress = userProfile[_name];
        require(profileAddress == address(0),"Username already taken");
        //check if the creator already has an ERC721
        require(creatorContract[msg.sender] == address(0),"address already has an account");

        UserProfile newUser = new UserProfile(_name,"PATREON",msg.sender,_name,_description,_subscriptionAmount);
        address addr = address(newUser);
        //add the created profile to store data variables
        createdProfiles.push(addr);
        userProfile[_name] = addr;
        creatorContract[msg.sender] = addr;
    }

    function working() public pure returns(string memory){
        return "yes smart contract deployed";
    }
    function getAllCreators() public view returns(address[] memory){
        return createdProfiles;
    }

    function getCreator(address _creator) public view returns(string memory,string memory,uint){
        return UserProfile(_creator).getCreatorInfo();
    }
}