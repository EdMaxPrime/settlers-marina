import React, {Component, Fragment} from "react";

import "../../styles/collapsible.css";
import expand from "../../images/expand.png";
import minimize from "../../images/minimize.png";

/*
Props:
@title {string}  big title, always visible
@subtitle {string} smaller subtitle, always visible
Children:
Conditionally rendered. Clicking on the title bar of this component toggles
their visibility.
*/
class Collapsible extends Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: true
		};
		this.onClick = this.onClick.bind(this);
	}
	onClick(event) {
		this.setState({visible: !(this.state.visible)});
	}
	render() {
		return (
			<Fragment>
			<div className="collapsible" onClick={this.onClick}>
				<img src={this.state.visible? expand : minimize} className="collapsible-icon" />
				<h2>{this.props.title}</h2>
				<h4>{this.props.subtitle}</h4>
			</div>
			<div style={{display: (this.state.visible? "block" : "none")}}>
				{this.props.children}
			</div>
			</Fragment>);
	}
}

export default Collapsible;