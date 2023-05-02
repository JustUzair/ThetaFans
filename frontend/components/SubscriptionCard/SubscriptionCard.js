import React from "react";
import Image from "next/image";
import tfuel from "../../assets/img/tfuel-logo.svg";
const SubscriptionCard = () => {
  return (
    <div className="subscription-card--container">
      <div className="subscription-card--grid">
        <div className="subscription-card card1">
          <h3>BASIC</h3>
          <h2>Free</h2>
          <h4>
            <Image
              src={tfuel}
              alt="tfuel"
              style={{
                width: "50px !important",
              }}
            />
            <span>Free</span>
          </h4>

          <hr />
          <p>10 templates</p>
          <p>Default presets</p>
          <a href="#">Subscribe </a>
        </div>
        <div className="subscription-card card2">
          <h3>PRO</h3>
          <h2>100</h2>
          <h4>
            <Image
              src={tfuel}
              alt="tfuel"
              style={{
                width: "50px !important",
              }}
            />
            <span>50</span>
          </h4>
          <hr />
          <p>50 templates</p>
          <p>Pro presets</p>
          <a href="#">Subscribe </a>
        </div>
        <div className="subscription-card card3">
          <h3>ULTIMATE</h3>
          <h2>250</h2>
          <h4>
            <Image
              src={tfuel}
              alt="tfuel"
              style={{
                width: "50px !important",
              }}
            />
            <span>250</span>
          </h4>
          <hr />
          <p>Unlimited templates</p>
          <p>Ultimate presets</p>
          <a href="#">Subscribe </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
