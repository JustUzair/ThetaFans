import React, { Component, useState, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaCommentDots } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import PatreonRae from "../../assets/img/issa-rae.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Image from "next/image";
import Logo from "../../assets/img/temp-logo.png";
import styled from "styled-components";
import contractAddresses from "../../constants/networkMapping.json";

import abi from "../../constants/UserFactory.json";

const Navbar = () => {
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
  const getStyle = {
    navbar: {
      position: "fixed",
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
      boxShadow: "0px 0px 2px grey",
      zIndex: 100,
      backgroundColor: "white",
      height: "85px !important",
    },
    navbarBrand: {
      paddingLeft: "15px",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    navbarMenu: {
      display: "flex",
      margin: "0",
      padding: "0",
      listStyle: "none",
      width: "50% !important",
      alignItems: "center",
      justifyContent: "space-evenly",
      // backgroundColor: 'yellow'
    },
    navbarItem: {
      textDecoration: "none",
      display: "inline-block",
      padding: "20px",
      color: "black",
      // backgroundColor: 'teal'
    },
  };

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
          //   console.log(`data : ${data}`);
          setIsSignedUp(data);
        },
      });
    }
  }

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
          console.error(error);
        },
        onSuccess: data => {
          //   console.log(data);
          setCreatorContractAddress(data.toString());
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
    <nav style={getStyle.navbar}>
      <Link href="/" className="nav__link">
        <div style={getStyle.navbarBrand}>
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="60"
            viewBox="0 0 292 104"
          >
            <g>
              <path
                fillRule="evenodd"
                d="M284.367244,104 L284.367244,1.42108547e-14 L291.998128,1.42108547e-14 L291.998128,104 L284.367244,104 Z M241.879569,34.6685484 L249.462761,34.6685484 L249.462761,67.6406851 L241.502892,67.6406851 L229.631221,46.443665 L229.631221,67.6406851 L222.000337,67.6406851 L222.000337,34.6685484 L229.960206,34.6685484 L241.879569,56.1472494 L241.879569,34.6685484 Z M191.902143,33.8203912 C202.828713,33.8203912 209.329565,42.1108994 209.329565,51.1546654 C209.329565,60.1983341 202.828713,68.4889396 191.902143,68.4889396 C180.925934,68.4889396 174.425082,60.1983341 174.425082,51.1546654 C174.425082,42.1108994 180.925934,33.8203912 191.902143,33.8203912 Z M201.558521,51.1546654 C201.558521,45.7379055 197.883238,40.6977258 191.902143,40.6977258 C185.872382,40.6977258 182.245765,45.7379055 182.245765,51.1546654 C182.245765,56.5714254 185.872382,61.6115077 191.902143,61.6115077 C197.883238,61.6115077 201.558521,56.5714254 201.558521,51.1546654 Z M68.6789331,41.2626448 L68.6789331,34.6685484 L91.2399738,34.6685484 L91.2399738,41.2626448 L83.7501245,41.2626448 L83.7501245,67.6406851 L76.1195321,67.6406851 L76.1195321,41.2626448 L68.6789331,41.2626448 Z M149.555601,48.2809172 L162.037548,48.2809172 L162.037548,54.2642508 L149.555601,54.2642508 L149.555601,61.516511 L162.037548,61.516511 L162.037548,67.6406851 L141.924717,67.6406851 L141.924717,34.6685484 L162.037548,34.6685484 L162.037548,40.7927225 L149.555601,40.7927225 L149.555601,48.2809172 Z M116.95985,34.6685484 C124.259803,34.6685484 128.970707,40.1803051 128.970707,46.5860627 C128.970707,51.2021638 126.520842,55.2990922 122.422162,57.2313411 L129.0184,67.6406851 L120.16307,67.6406851 L114.320187,58.5019223 L110.74029,58.5019223 L110.74029,67.6406851 L103.110379,67.6406851 L103.110379,34.6685484 L116.95985,34.6685484 Z M121.245409,46.5860627 C121.245409,43.5239757 119.172223,40.8860646 115.969003,40.8860646 L110.74029,40.8860646 L110.74029,52.2845035 L115.969003,52.2845035 C119.172223,52.2845035 121.245409,49.6481497 121.245409,46.5860627 Z M53.7468301,63.6370987 L42.0175573,63.6370987 L40.7452241,67.6406851 L32.5954591,67.6406851 L44.3722302,34.6685484 L51.3904052,34.6685484 L63.3079195,67.6406851 L55.0174113,67.6406851 L53.7468301,63.6370987 Z M47.9042396,44.088992 L43.8531549,57.6554197 L51.8603276,57.6554197 L47.9042396,44.088992 Z M13.8006102,34.6685484 C21.1021207,34.6685484 25.8131212,40.1803051 25.8131212,46.5860627 C25.8131212,52.9918203 21.1021207,58.5019223 13.8006102,58.5019223 L7.63059242,58.5019223 L7.63059242,67.6406851 L0,67.6406851 L0,34.6685484 L13.8006102,34.6685484 Z M18.1350304,46.5860627 C18.1350304,43.5239757 16.061941,40.8860646 12.8590136,40.8860646 L7.63059242,40.8860646 L7.63059242,52.2845035 L12.8590136,52.2845035 C16.061941,52.2845035 18.1350304,49.6481497 18.1350304,46.5860627 Z"
              ></path>
            </g>
          </svg> */}
          <Image src={Logo} alt={"logo"} width={75} height={75}></Image>
        </div>
      </Link>
      <ul style={getStyle.navbarMenu}>
        <li>
          <Link href="/creators" className="nav__link">
            Explore
          </Link>
        </li>
        <li>
          {!isSignedUp ? (
            <Link href="/creators/signup" className="nav__link">
              Become a Creator
            </Link>
          ) : (
            <Link href={`/creators/${creatorContractAddress}/upload`}>
              Upload
            </Link>
          )}
        </li>
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          showBalance={{
            smallScreen: false,
            largeScreen: true,
          }}
        />
      </ul>
    </nav>
  );
};

export default Navbar;
