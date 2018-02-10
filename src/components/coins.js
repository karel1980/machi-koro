import React from 'react';
import './coins.css';

export const SingleCoin = (props) => (
<div className="coin-outer">
	<div className="coin-inner">
		{props.value}
	</div>
</div>);