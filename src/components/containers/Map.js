import React, {Component} from "react";
import {connect} from "react-redux";

import {subscribeToMap, unsubscribeFromMap, buildSettlement} from "../../actions";
import {filterPossibilities} from "../../selectors";

import Canvas from "../views/Canvas";
import Hexagon from "../views/Hexagon";
import Clickable from "../views/Clickable";
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
    this.doAction = this.doAction.bind(this);
  }
  componentDidUpdate(prevProps) {
    if(prevProps.w != this.props.w || prevProps.h != this.props.h) {
      this.setState({
        radius: Math.min(600 / (2 * this.props.w + 1), 400 / ((this.props.h + 1) * 1.5))
      });
    }
  }
  doAction(loc) {
    if(this.props.action === "settlement") {
      this.props.buildSettlement(this.props.possible[loc]);
    }
  }
  hexCoords(h) {
    let row = parseInt(h / this.props.w);
    let col = (row & 1) + 2 * (h % this.props.w);
    return {
      x: (col+2) * this.state.radius * COS_30,
      y: (row+1) * this.state.radius * 1.5
    };
  }
  intersectionCoords(i) {
    let h = this.hexCoords(parseInt(i / 2));
    if((i & 1) == 0)
      h.y -= this.state.radius;
    else
      h.y += this.state.radius;
    return h;
  }
  render() {
    if(this.props.status != "CONNECTED") {
      return <Status type={this.props.status} text={this.props.message} />
    }
    const tiles = this.props.tiles.map((tile, index) => {
      let coords = this.hexCoords(index);
      return <Hexagon key={index} 
                      x={coords.x}
                      y={coords.y}
                      radius={this.state.radius} 
                      tileType={tile} 
              />;
    });
    const clickables = this.props.possible.map((loc, index) => {
      let coords = this.intersectionCoords(loc);
      return <Clickable key={index} 
                        x={coords.x} 
                        y={coords.y} 
                        info={index}
                        onClick={this.doAction}
             />
    });
    return (
      <Canvas width={this.state.width} height={this.state.height} bg={"#334499"}>
        {tiles}
        {clickables}
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
    h: state.map.height,
    action: state.action,
    possible: filterPossibilities(state),
    buildings: state.map.buildings,
    roads: state.map.roads
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    buildSettlement: (intersection) => dispatch(buildSettlement(intersection))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TileMap);