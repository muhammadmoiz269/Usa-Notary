import React from "react";
import notaryLogo from "../../Assets/images/notary_logo.png";

const Header = () => {
  return (
    <div style={{ width: "200px", padding: "20px" }}>
      <img src={notaryLogo} alt="notaryLogo" width={"100%"} />
    </div>
  );
};

export default Header;
