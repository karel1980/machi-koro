import React from 'react';
import './card.css';
import {DropdownMenu} from 'react-dd-menu';
import {Cards} from '../game/cards';
import * as _ from 'lodash';
import {SingleCoin} from "./coins";

export class Card extends React.Component {

	render() {
		let {type, free, enabled, menuItems, count} = this.props;
		let card = Cards[type];

		let menu = <span>&nbsp;</span>;

		let hasMenu = !_.isNil(this.props.menuItems);
		if (hasMenu) {
			let menuOptions = {
				isOpen: true,
				toggle: '',
				close: () => {
				},
				align: 'center'
			};

			menu = (<DropdownMenu {...menuOptions}>
				{menuItems}
			</DropdownMenu>);
		}

		return (
			<div className={cardClassNames(card, enabled, hasMenu, count)}>
				<div className="roll">{rollDisplayString(card.roll)}</div>
				{count !== undefined && count > 1 && <div className="count">x {count}</div>}
				<div className="label">
					<CardSymbol symbol={card.symbol}/>
					{card.name}
				</div>
				<div className="menu">
					{menu}
				</div>
				<div className="description"><CardDescription description={card.description}/></div>
				<div className="cost"><SingleCoin value={costDisplayString(card.cost, free)}/></div>
			</div>
		);
	}
}

const CardSymbol = (props) => (<img className="card-symbol" alt={props.symbol} src={`/assets/${props.symbol}.svg`}/>);

const rollDisplayString = value => value === undefined ? (<span>&nbsp;</span>) : value;

const costDisplayString = (value, free) => free ? (<span>&nbsp;</span>) : value;

const cardClassNames = (card, enabled, highlight, count) => {
	let suffix = enabled === false ? 'disabled' : card.category;
	let highlightClass = highlight ? 'highlight' : '';
	let multiple = count > 1 ? 'multiple' : '';
	return `card card-${suffix} ${highlightClass} ${multiple}`;
};

const CardDescription = (props) => {
	let parts = props.description.split(/(\[[^\]]*\])/);

	return parts.map(part => {
		let match = part.match(/\[(.*)\]/);
		return match ? <CardSymbol symbol={match[1]}/> : part;
	});
};