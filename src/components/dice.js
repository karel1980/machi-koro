import React from 'react';
import './dice.css';

export class BaseDice extends React.Component {

	state = {active: false, values: []};

	render() {
		return <div>
			<div className="dice">
				{this.state.values.map((value, idx) =>
					<Die key={`die-${idx}`} value={value} active={this.state.active}/>
				)}
			</div>
		</div>
	}

	componentWillMount() {
		this.copyPropsToState(this.props);
	}

	componentWillReceiveProps(props) {
		if (this.state.values !== props.values) {
			this.copyPropsToState(props);
		}
	}

	copyPropsToState(props) {
		this.setState({active: true, values: props.values});
		setTimeout(() => this.setState({...this.state, active: false}), 1000);
	}
}

export const Dice = BaseDice;

export const Die = (props) => (
	<div className={`die ${props.active ? 'die-active' : ''}`}>
		<div className={`die-sides die-value-${props.value}`}>
			<div className="side side-one">
				<div className="dot center"/>
			</div>
			<div className="side side-two">
				<div className="dot topleft"/>
				<div className="dot bottomright"/>
			</div>
			<div className="side side-three">
				<div className="dot topleft"/>
				<div className="dot center"/>
				<div className="dot bottomright"/>
			</div>
			<div className="side side-four">
				<div className="dot topleft"/>
				<div className="dot bottomleft"/>
				<div className="dot topright"/>
				<div className="dot bottomright"/>
			</div>
			<div className="side side-five">
				<div className="dot topleft"/>
				<div className="dot bottomleft"/>
				<div className="dot center"/>
				<div className="dot topright"/>
				<div className="dot bottomright"/>
			</div>
			<div className="side side-six">
				<div className="dot topleft"/>
				<div className="dot left"/>
				<div className="dot bottomleft"/>
				<div className="dot topright"/>
				<div className="dot right"/>
				<div className="dot bottomright"/>
			</div>
		</div>
	</div>
);
