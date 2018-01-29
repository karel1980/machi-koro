import React from 'react';
import './card.css';
import {DropdownMenu} from 'react-dd-menu';
import {Cards} from '../game/cards';

export class Card extends React.Component {

	state = {isMenuOpen: false};

	toggle = () => {
		this.setState({isMenuOpen: !this.state.isMenuOpen});
	}

	close = () => {
		this.setState({isMenuOpen: false});
	};

	render() {
		let {type, free, enabled, menuItems} = this.props;
		let card = Cards[type];

		let menuOptions = {
			isOpen: this.state.isMenuOpen,
			toggle: '',
			close: this.close,
			align: 'center'
		};

		return (
			<div className={cardClassNames(card, enabled)} onClick={() => this.toggle()}>
				<div className="card-top">
					<div className="roll">{rollDisplayString(card.roll)}</div>
					<div className="label">
						<CardSymbol symbol={card.symbol}/>
						{card.name}
					</div>
					<div style={{margin: 'auto', textAlign: 'center'}}>
						<DropdownMenu {...menuOptions}>
							{menuItems}
						</DropdownMenu>
					</div>
					<div className="description">{card.description}</div>
				</div>
				<div className="card-bottom">
					<div className="cost">{costDisplayString(card.cost, free)}</div>
				</div>
			</div>
		);
	}
}

const CardSymbol = (props) => (<img alt={props.symbol} src={`/assets/${props.symbol}.png`}/>);

const rollDisplayString = value => value === undefined ? (<span>&nbsp;</span>) : value;

const costDisplayString = (value, free) => free ? (<span>&nbsp;</span>) : value;

const cardClassNames = (card, enabled) => {
	if (enabled === false) {
		return "card card-disabled";
	}

	return "card card-" + card.category;
};