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
import {Board} from './components/board';

import {HashRouter as Router, Route, withRouter} from 'react-router-dom';

const SingleClient = Client({
	game: MachiKoro,
	board: Board
});

const MultiClient = Client({
	game: MachiKoro,
	board: Board,
	multiplayer: true
});

const Hello = () => <div>
	<h2>Play alone</h2>
	<li><a href="#/game/single">Forever alone</a></li>

	<h2>Play test game</h2>
	<li><a href="#/game/multi/test/0">Play as player 0</a></li>
	<li><a href="#/game/multi/test/1">Play as player 1</a></li>

	<h2>Development area</h2>
	<li><a href="#/dicetest">Dice test</a></li>
</div>;

const RoutedSingleClientApp = withRouter(() => {
	return <SingleClient/>;
});

const RoutedMultiClientApp = withRouter(({match}) => {
	return <MultiClient gameID={match.params.gameID} playerID={match.params.playerID}/>
});

const App = () => (
	<div>
		<Router>
			<div>
				<Route key={'index'}
					   exact
					   path="/"
					   component={Hello}/>
				<Route key={'game-single'}
					   path="/game/single"
					   component={RoutedSingleClientApp}/>
				<Route key={'game-multi'}
					   path="/game/multi/:gameID/:playerID"
					   component={RoutedMultiClientApp}/>
			</div>
		</Router>
	</div>
);

export default App;
