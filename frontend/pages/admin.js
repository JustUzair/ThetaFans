import React, { useState } from "react";
import abi from "../constants/UserFactory.json";

import contractAddresses from "../constants/networkMapping.json";
import { useMoralis, useWeb3Contract, useMoralisWeb3Api } from "react-moralis";
import { useNotification } from "web3uikit";
import { useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { fadeInUp, routeAnimation, stagger } from "../utils/animations";
import userProfileAbi from "../constants/UserProfile.json";
const Admin = () => {
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();
  const { enableWeb3, authenticate, account, isWeb3Enabled, Moralis } =
    useMoralis();
  const { web3 } = useMoralisWeb3Api();
  const { chainId: chainIdHex } = useMoralis();
  const [adminAddress, setAdminAddress] = useState(
    "0x0000000000000000000000000000000000000000"
  );
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

  const getAdminStateFromChain = async () => {
    // Import the smart contract ABI
    if (!isWeb3Enabled) await enableWeb3();
    if (account) {
      //Read State variable from chain
      const options = {
        contractAddress,
        functionName: "admin",
        abi,
      };
      const transaction = await Moralis.executeFunction(options);
      setAdminAddress(transaction.toLowerCase().toString());
      //   console.log(`data : ${transaction.toLowerCase().toString()}`);
      //   console.log(`account : ${account.toLowerCase().toString()}`);
    }
  };
  const withdrawSubscriptionFee = async () => {
    if (!isWeb3Enabled) await enableWeb3();
    if (account != null && account.toLowerCase().toString() == adminAddress) {
      runContractFunction({
        params: {
          abi,
          contractAddress,
          functionName: "withdrawFees",
          params: { _to: account },
        },
        //
        onError: error => {
          failureNotification(error.message);
          console.error(error);
        },
        onSuccess: data => {
          //   console.log(`Account : ${account}`);
          console.log(`data : ${data}`);
          successNotification("Subscription Fees Withdrew");
        },
      });
    }
  };
  useEffect(() => {
    getAdminStateFromChain();
  }, [account]);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      {account != null && account.toLowerCase().toString() == adminAddress ? (
        <div className="admin-card">
          <div className="admin-card--image">
            <img
              src="https://i.seadn.io/gae/jzpknD5e9NF8Bv1Xy3dwWeorx1Ny8fYT_o6ozWhuKlhcisnQn95GycWXjeRbKclgwEF4R9IaHKRCRYEX96B8rB38XWKuSuLzQiI_ZQ?auto=format&w=1000"
              alt="admin pfp"
            />
          </div>

          <div className="content">
            <p className="admin-address">
              @
              {adminAddress.substr(0, 4) +
                "..." +
                adminAddress.substr(adminAddress.length - 4)}
            </p>

            <button
              className="effect effect-4"
              onClick={withdrawSubscriptionFee}
            >
              Withdraw Fee
            </button>
          </div>
        </div>
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
              Only admins are authorized to access this route!
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
