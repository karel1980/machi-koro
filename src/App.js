/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import './App.css';

import {Client} from 'boardgame.io/client';
import MachiKoro from './game/machi-koro';
import {Card} from './components/card';

const Board = (props) => (
	<div>
		<button onClick={() => props.makeMove('roll', 1)}>Roll with 1 die</button>
		<button onClick={() => props.makeMove('roll', 2)}>Roll with 2 dice</button>
		<button onClick={() => props.makeMove('playRedCards')}>Play red cards</button>
		<button onClick={() => props.makeMove('playBlueCards')}>Play blue cards</button>
		<button onClick={() => props.makeMove('playGreenCards')}>Play green cards</button>

		<h1>Dice</h1>
		<div>{props.G.currentTurn.lastRoll}</div>

		<Deck deck={props.G.deck} onBuy={(cardType) => props.moves.buyDeckCard(cardType)}/>
		<Player name="0" player={props.G.players[0]} onBuy={(cardType) => props.moves.buyYellowCard(cardType)}/>
		<Player name="1" player={props.G.players[1]} onBuy={(cardType) => props.moves.buyYellowCard(cardType)}/>

	</div>
)

const Deck = (props) => (
	<div>
		<h2>Deck</h2>
		<div className="deck">{renderDeck(props.deck, props.onBuy)}</div>
	</div>
);

const Player = (props) => (
	<div>
		<h2>Player {props.name} (Coins: {props.player.coins})</h2>
		<div>{renderPlayerDeck(1, props.player.deck, props.onBuy)}</div>
	</div>
);

const renderDeck = (deck, onBuy) => {
	return Object.keys(deck).filter((key) => deck[key] > 0)
		.map(key => {
			let menuItems = [
				<li key="buy" onClick={() => onBuy(key)}>Buy this card</li>,
				<li key="nothing">Do nothing</li>
			];

			return (<Card key={key} type={key} menuItems={menuItems}/>)
		});
}

const renderPlayerDeck = (playerId, playerDeck, onBuy) => (
	playerDeck.map((cas, idx) => {
		let key = playerCardKey(playerId, cas.card, idx);
		let menuItems = [
			<li key="buy" onClick={() => onBuy(cas.card)}>Buy this card</li>,
			<li key="nothing">Do nothing</li>
		];
		return <Card key={key} type={cas.card}
					 free={cas.free} enabled={cas.enabled} menuItems={menuItems}/>
	}));

const playerCardKey = (playerId, card, cardIdx) => "player-" + playerId + "-" + card + "-" + cardIdx;

const ClientApp = Client({
	game: MachiKoro,
	board: Board
});

const App = () => (
	<div>
		<h1>Welcome to Machi Koro</h1>
		<ClientApp gameID="singleplayer"/>
	</div>
);

export default App;
