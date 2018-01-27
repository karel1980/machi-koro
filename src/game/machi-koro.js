/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {Game} from 'boardgame.io/core';
import {Cards} from './cards.js';
import _ from 'lodash';

export const initialPlayer = () => ({
	coins: 3,
	deck: initialPlayerDeck()
});

const initialPlayerDeck = () => [
	{card: 'graanveld', free: true},
	{card: 'bakkerij', free: true},
	{card: 'treinstation', enabled: false},
	{card: 'pretpark', enabled: false},
	{card: 'winkelcentrum', enabled: false},
	{card: 'radiostation', enabled: false},
];

const newTurn = () => ({
	numRolls: 0,
	lastRoll: undefined
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
		players: [
			initialPlayer(),
			initialPlayer()
		],
	  	currentTurn: newTurn()
	}),

	moves: {
		roll: rollMove,

		playRedCards: playRedCardsMove

	},

	onTurnEnd: (G, ctx) => ({ ...G, currentTurn: newTurn()}),

	flow: {
		endGameIf: (G, ctx) => {
			//if (a player has all orange class cards) return that player;
		},
	},
});

const doRoll = () => Math.floor(Math.random() * 6 + 1);

// move implementations exported for testing
export function rollMove(G, ctx, numDice) {
	if (G.currentTurn.numRolls > 0) {
		return G; //rolled already
	}

	if (numDice < 1 || numDice > 2) {
		return G; //incorrect number of dice
	}

	var roll = [doRoll()];
	if (numDice === 2) {
		roll.push(doRoll());
	}

	return { ...G, currentTurn: { ...G.currentTurn, numRolls: G.currentTurn.numRolls + 1, lastRoll: roll }};
};

export function playRedCardsMove(G, ctx) {
	if (G.currentTurn.numRolls === 0) {
		return G; //must roll first
	}

	if (G.currentTurn.hasPlayedRedCards) {
		return G;
	}

	// start at currentPlayer - 1, go down and stop before currentPlayer
	let coins = G.players.map(p => p.coins);
	for (let i = 0; i < G.players.length - 1; i++ ) {
		if (coins[ctx.currentPlayer] <= 0) {
			break;
		}

		let playerIdx = (2 * G.players.length + ctx.currentPlayer - i - 1) % G.players.length;
		let player = G.players[playerIdx];
		for (let playerCard of player.deck.filter(matchingCategoryAndRoll('red', G.currentTurn.lastRoll))) {
			if (coins[ctx.currentPlayer] <= 0) {
				break;
			}

			let payout = Math.min(coins[ctx.currentPlayer], Cards[playerCard.card].payout);

			coins[ctx.currentPlayer] -= payout;
			coins[playerIdx] += payout;
		}
	}

	let players = G.players.map((player, idx) => ({ ...player, coins: coins[idx] }));
	return { ...G, players };
}

const matchingCategoryAndRoll = (category, roll) => {
	return ({card}) => Cards[card].category === category && matchesCardRoll(Cards[card], roll)
}

const matchesCardRoll = (card, roll) => {
	let rolled = roll.reduce((acc, current) => acc + current);

	let range = cardRange(card);

	return rolled >= range.min && rolled <= range.max;
}

const cardRange = (card) => {
	let rollSpec = card.roll;

	if (_.isNaN(Number(rollSpec))) {
		let match = rollSpec.match(/(\d+) *- *(\d+)/);

		return { min: Number(match[1]), max: Number(match[2]) };
	}

	return { min: Number(rollSpec), max: Number(rollSpec) };
}

export default MachiKoro;
