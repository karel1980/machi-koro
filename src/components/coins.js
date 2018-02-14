import React from 'react';
import './coins.css';

export const SingleCoin = ({value}) => (
<div className="coin-outer">
	<div className="coin-inner">
		{value}
	</div>
</div>);

export const Coins = ({amount}) => {
	let coins = [];
	while (amount > 10) {
		coins.push(<SingleCoin value={10}/>);
		amount -= 10;
	}

	if (amount >= 5) {
		coins.push(<SingleCoin value={5}/>);
		amount -= 5;
	}

	while (amount > 0) {
		coins.push(<SingleCoin value={1}/>);
		amount -= 1;
	}
	return <div>{coins}</div>
};