import React, {Component} from "react";
import {connect} from "react-redux";

import Canvas from "../views/Canvas";
import Hexagon from "../views/Hexagon";
import Status from "../views/Status";

//cosine of 30 degrees
const COS_30 = Math.cos(Math.PI/6);

/**
 * Props:
 * @w  from redux, half the number of columns in the grid
 * @h  from redux, the number of rows in the grid
 * @tiles  from redux, array of strings representing tile type
 */
class TileMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radius: Math.min(600 / (2 * props.w + 1), 400 / ((props.h + 1) * 1.5)),
      width: 600,
      height: 400
    };
  }
  componentDidUpdate(prevProps) {
    if(prevProps.w != this.props.w || prevProps.h != this.props.h) {
      this.setState({
        radius: Math.min(600 / (2 * this.props.w + 1), 400 / ((this.props.h + 1) * 1.5))
      });
    }
  }
  render() {
    if(this.props.status != "CONNECTED") {
      return <Status type={this.props.status} text={this.props.message} />
    }
    const tiles = this.props.tiles.map((tile, index) => {
      let row = parseInt(index / this.props.w);
      let col = (row & 1) + 2 * (index % this.props.w);
      return <Hexagon key={index} 
                      x={(col+2) * this.state.radius * COS_30} 
                      y={(row+1) * this.state.radius * 1.5} 
                      radius={this.state.radius} 
                      tileType={tile} 
              />;
    });
    return (
      <Canvas width={this.state.width} height={this.state.height} bg={"#334499"}>
        {tiles}
      </Canvas>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.map.connection.status,
    message: state.map.connection.message,
    tiles: state.map.tiles,
    w: state.map.width,
    h: state.map.height
  };
};

export default connect(mapStateToProps)(TileMap);