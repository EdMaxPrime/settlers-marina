import React, {Component} from "react";
import {connect} from "react-redux";

import CardList from "../views/CardList";
import Card from "../views/Card";
import Collapsible from "./Collapsible";
import settlement from "../../images/settlement.png";

import {amIPlaying, filterMyPlayer} from "../../selectors";
import {setAction} from "../../actions";

class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let a = this.props.action === null;
    var {wood, clay, iron, harvest, gold} = this.props.res || {wood:0,clay:0,iron:0,harvest:0,gold:0};
    return <Collapsible title="Shop" subtitle={`${wood} wood, ${clay} clay, ${iron} iron, ${harvest} harvests, ${gold} gold`}>
      <CardList>
        <Card title="Settlement"
              image={settlement}
              body="Cost: 3 wood, 2 clay, 4 harvests"
              action={a? "Build" : "Cancel"}
              disabled={this.props.notMyTurn}
              onAction={a? this.props.settlement : this.props.reset} />
        <Card title="City"
              image={settlement}
              body="Cost: 3 wood, 2 clay, 4 harvests"
              action="Build"
              onAction={this.props.settlement} />
        <Card title="Road"
              image={settlement}
              body="Cost: 3 wood, 2 clay, 4 harvests"
              action="Build"
              onAction={this.props.settlement} />
        <Card title="Shipping Lane"
              image={settlement}
              body="Cost: 3 wood, 2 clay, 4 harvests"
              action="Build"
              onAction={this.props.settlement} />
      </CardList>
    </Collapsible>
  }
}

const mapStateToProps = state => {
  return {
    action: state.action,
    notMyTurn: !amIPlaying(state),
    res: filterMyPlayer(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reset: () => dispatch(setAction(null)),
    settlement: () => dispatch(setAction("settlement"))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Shop);