import React from 'react';
import './card.css';
import {DropdownMenu} from 'react-dd-menu';
import {Cards} from '../game/cards';
import * as _ from 'lodash';
import {SingleCoin} from "./coins";

export class Card extends React.Component {

	render() {
		let {type, free, enabled, menuItems} = this.props;
		let card = Cards[type];

		let menu = <span>&nbsp;</span>;

		let hasMenu = !_.isNil(this.props.menuItems);
		if (hasMenu) {
			let menuOptions = {
				isOpen: true,
				toggle: '',
				close: () => {},
				align: 'center'
			};

			menu = (<DropdownMenu {...menuOptions}>
				{menuItems}
			</DropdownMenu>);
		}

		return (
			<div className={cardClassNames(card, enabled, hasMenu)}>
				<div className="card-top">
					<div className="roll">{rollDisplayString(card.roll)}</div>
					<div className="label">
						<CardSymbol symbol={card.symbol}/>
						{card.name}
					</div>
					<div style={{margin: 'auto', textAlign: 'center'}}>
						{menu}
					</div>
					<div className="description">{card.description}</div>
				</div>
				<div className="card-bottom">
					<div className="cost"><SingleCoin value={costDisplayString(card.cost, free)}/></div>
				</div>
			</div>
		);
	}
}

const CardSymbol = (props) => (<img className="card-symbol" alt={props.symbol} src={`/assets/${props.symbol}.png`}/>);

const rollDisplayString = value => value === undefined ? (<span>&nbsp;</span>) : value;

const costDisplayString = (value, free) => free ? (<span>&nbsp;</span>) : value;

const cardClassNames = (card, enabled, highlight) => {
	let suffix = enabled === false ? 'disabled' : card.category;
	let highlightClass = highlight ? 'highlight' : '';

	return `card card-${suffix} ${highlightClass}`;
};