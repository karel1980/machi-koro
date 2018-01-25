/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import './app.css';

import {Client} from 'boardgame.io/client';
import MachiKoro from '../machi-koro';
import {Card} from './components/card';

const Board = (props) => (
	<div>
		<h2>Deck</h2>
		<div className="deck">{renderDeck(props.G.deck)}</div>

		<h1>Last roll</h1>
		<div>{props.G.currentTurn.lastRoll}</div>

		<h2>Player 1</h2>
		<div>{renderPlayerDeck(0, props.G.playerDecks[0])}</div>

		<h2>Player 1</h2>
		<div>{renderPlayerDeck(1, props.G.playerDecks[1])}</div>
	</div>
);

const renderDeck = (deck) => (
	Object.keys(deck).filter((key) => deck[key] > 0)
		.map(key => (<Card key={key} type={key}></Card>))
);

const renderPlayerDeck = (playerId, playerDeck) => (
	playerDeck.map((cas) => (<Card key={playerCardKey(playerId, cas.card)} type={cas.card} free={cas.free} enabled={cas.enabled}/>))
);

const playerCardKey = (playerId, card) => "player-" + playerId + "-" + card;

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
