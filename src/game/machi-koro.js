/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {Game} from 'boardgame.io/core';

const initialPlayerDeck = () => [
	{card: 'graanveld', free: true},
	{card: 'bakkerij', free: true},
	{card: 'treinstation', enabled: false},
	{card: 'pretpark', enabled: false},
	{card: 'winkelcentrum', enabled: false},
	{card: 'radiostation', enabled: false},
];

const newTurn = () => ({
	numRolls: 0
});

const MachiKoro = Game({
	name: 'Machi Koro',

	setup: () => ({
		deck: {
			graanveld: 6,
			veehouderij: 6,
			bakkerij: 6,
			supermarkt: 6,
			groenteenfruitmarkt: 6,
			cafe: 6,
			bos: 6,
			meubelfabriek: 6,
			restaurant: 6,
			appelboomgaard: 6,
			kaasfabriek: 6,
			stadion: 4,
			mijn: 6,
			tvstation: 4,
			bedrijvencomplex: 4
		},
		playerDecks: [
			initialPlayerDeck(),
			initialPlayerDeck()
		],
	  	currentTurn: newTurn()
	}),

	moves: {
		roll(G, ctx, numDice) {
			if (G.currentTurn.numRolls > 0) {
				return; //rolled already
			}

			if (numDice < 0 || numDice > 2) {
				return; //incorrect number of dice
			}

			var roll = [doRoll()];
			if (numDice === 2) {
				roll.push(doRoll());
			}

			return { ...G, currentTurn: { ...G.currentTurn, numRolls: G.currentTurn.numRolls + 1, lastRoll: roll }};
		}
	},

	onTurnEnd: (G, ctx) => ({ ...G, currentTurn: newTurn()}),

	flow: {
		endGameIf: (G, ctx) => {
			//if (a player has all orange class cards) return ctx.currentPlayer;
		},
	},
});

const doRoll = () => Math.floor(Math.random() * 6 + 1);

export default MachiKoro;
