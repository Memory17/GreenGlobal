import React from "react";
import { Carousel } from "antd";
import Banner1 from "../assets/images/banner-4.jpeg";
import Banner2 from "../assets/images/banner-5.jpg";
import "../style/Banner.css"; // Import CSS

const Banner = () => {
  return (
    <Carousel autoplay className="banner-carousel">
      <div>
        <img
          src={Banner1}
          alt="Banner 1"
          className="banner-image"
        />
      </div>
      <div>
        <img
          src={Banner2}
          alt="Banner 2"
          className="banner-image"
        />
      </div>
      {/* <div>
        <img
          src={Banner3}
          alt="Banner 3"
          style={{ width: "100%", height: "400px", objectFit: "cover" }}
        />
      </div> */}
    </Carousel>
  );
};
export default Banner;