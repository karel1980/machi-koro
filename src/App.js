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

		<Deck deck={props.G.deck}/>
		<Player name="0" player={props.G.players[0]}/>
		<Player name="1" player={props.G.players[1]}/>

	</div>
)

const Deck = (props) => (
	<div>
		<h2>Deck</h2>
		<div className="deck">{renderDeck(props.deck)}</div>
	</div>
);

const Player = (props) => (
		<div>
			<h2>Player {props.name} (Coins: {props.player.coins})</h2>
			<div>{renderPlayerDeck(1, props.player.deck)}</div>
		</div>
);

const renderDeck = (deck) => (
	Object.keys(deck).filter((key) => deck[key] > 0)
		.map(key => (<Card key={key} type={key} onClick={() => onClickDeckCard(key)}/>)));

const renderPlayerDeck = (playerId, playerDeck) => (
	playerDeck.map((cas) => {
		let key = playerCardKey(playerId, cas.card);
		return <Card key={key} type={cas.card}
			  free={cas.free} enabled={cas.enabled} onClick={() => onClickPlayerCard(key, playerId)}/>
	}));

const playerCardKey = (playerId, card) => "player-" + playerId + "-" + card;

const onClickDeckCard = (key) => {
	window.alert('clicked on deck card ' + key);
};

const onClickPlayerCard = (key, playerId) => {
	window.alert('clicked on player card ' + key + ' of player ' + playerId);
};

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
