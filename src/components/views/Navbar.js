import React from "react";
import "../../styles/navbar.css";

function Navbar(props) {
    return (
        <div className="navbar">
            <div className="navbar-left">Settlers of Marina</div>
            <div className="navbar-right">Help</div>
            <div style={{clear: "both"}}></div>
        </div>
        );
}

export default Navbar;