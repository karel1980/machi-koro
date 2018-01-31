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
import update from 'immutability-helper';

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

export const INITIAL_DECK = {
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
};

const newTurn = () => ({
	numRolls: 0,
	lastRoll: undefined
});

const MachiKoro = Game({
	name: 'Machi Koro',

	setup: () => ({
		deck: INITIAL_DECK,
		players: [
			initialPlayer(),
			initialPlayer()
		],
		currentTurn: newTurn()
	}),

	moves: {
		roll: playRollMove,
		playRedCards: playRedCardsMove,
		playBlueCards: playBlueCardsMove,
		playGreenCards: playGreenCardsMove,
		buyCard: buyCardMove
	},

	flow: {
		onTurnEnd: (G, ctx) => {
			return ({...G, currentTurn: newTurn()})
		},

		endGameIf: (G, ctx) => {
			//if (a player has all orange class cards) return that player;
		},
	},
});

const doRoll = () => Math.floor(Math.random() * 6 + 1);

// move implementations exported for testing
export function playRollMove(G, ctx, numDice) {
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

	return {...G, currentTurn: {...G.currentTurn, numRolls: G.currentTurn.numRolls + 1, lastRoll: roll}};
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
	for (let i = 0; i < G.players.length - 1; i++) {
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

	let players = G.players.map((player, idx) => ({...player, coins: coins[idx]}));
	return {...G, currentTurn: {...G.currentTurn, hasPlayedRedCards: true}, players};
}

export function playBlueCardsMove(G, ctx) {
	if (!G.currentTurn.hasPlayedRedCards) {
		return G; // must play red cards first
	}

	if (G.currentTurn.hasPlayedBlueCards) {
		return G; // can be played only once
	}

	let players = G.players.map(p => ({
		...p,
		coins: p.coins + p.deck.filter(matchingCategoryAndRoll('blue', G.currentTurn.lastRoll))
			.map(playerCard => Cards[playerCard.card].payout)
			.reduce(sumReducer, 0)
	}));

	return {...G, currentTurn: {...G.currentTurn, hasPlayedBlueCards: true}, players};
}

const sumReducer = (acc, current) => acc + current;

export function playGreenCardsMove(G, ctx) {
	if (!G.currentTurn.hasPlayedRedCards) {
		return G; // must play red cards first
	}

	if (G.currentTurn.hasPlayedGreenCards) {
		return G; // can be played only once
	}

	let current = {...G.players[ctx.currentPlayer]};
	let players = [...G.players];
	players[ctx.currentPlayer] = current;

	let activeGreenCards = current.deck.filter(matchingCategoryAndRoll('green', G.currentTurn.lastRoll))
		.map(playerCard => Cards[playerCard.card]);

	let simpleGreenCards = activeGreenCards.filter((card) => _.isNil(card.payoutFor));
	current.coins += simpleGreenCards.map(card => card.payout).reduce(sumReducer, 0);

	let modifierCards = activeGreenCards.filter((card) => !_.isNil(card.payoutFor));
	modifierCards.forEach((modifier) => {
		current.coins += modifier.payout * current.deck.filter((card) => Cards[card.card].symbol === modifier.payoutFor).length;
	});

	return {...G, currentTurn: {...G.currentTurn, hasPlayedGreenCards: true}, players};
}

export function buyCardMove(G, ctx, cardType) {
	if (_.isNil(Cards[cardType])) {
		return G;
	}

	if (!G.currentTurn.hasPlayedBlueCards || !G.currentTurn.hasPlayedGreenCards) {
		return G;
	}

	if (G.currentTurn.hasBoughtCard) {
		return G;
	}

	if (Cards[cardType].cost > G.players[ctx.currentPlayer].coins) {
		return G;
	}

	if (Cards[cardType].category === 'yellow') {
		return buyYellowCardMove(G, ctx, cardType);
	}

	return buyDeckCardMove(G, ctx, cardType);
}

function buyDeckCardMove(G, ctx, cardType) {
	const deck = {...G.deck};
	const players = [...G.players];
	const current = {...G.players[ctx.currentPlayer]};
	players[ctx.currentPlayer] = current;

	if (_.isNil(G.deck[cardType]) || G.deck[cardType] <= 0) {
		return G;
	}

	const card = Cards[cardType];
	if (card.cost > current.coins) {
		return G;
	}

	if (!_.isNil(card.maxOwnCount) && current.deck.filter((cas) => cas.card === cardType).length >= card.maxOwnCount) {
		return G;
	}

	current.coins -= card.cost;
	deck[cardType] -= 1;

	current.deck.push({card: cardType});

	return {...G, currentTurn: {...G.currentTurn, hasBoughtCard: true}, deck, players};
}

function buyYellowCardMove(G, ctx, cardType) {
	let player = G.players[ctx.currentPlayer];
	let deck = player.deck;
	let cardIdx = deck.findIndex(playerCardWithType(cardType));
	let playerCard = deck[cardIdx];

	if (playerCard.enabled) {
		return G;
	}

	return {
		...G,
		players: update(G.players, {
			$splice: [[ctx.currentPlayer, 1, {
				...player,
				deck: update(player.deck, {
					$splice: [[cardIdx, 1, {
						...playerCard, enabled: true
					}]]
				}),
				coins: player.coins - Cards[cardType].cost
			}]]
		}),
		currentTurn: {...G.currentTurn, hasBoughtCard: true}
	};
}

function playerCardWithType(cardType) {
	return (playerCard => playerCard.card === cardType);
}

const matchingCategoryAndRoll = (category, roll) =>
	({card}) => Cards[card].category === category && matchesCardRoll(Cards[card], roll);

const matchesCardRoll = (card, roll) => {
	let rolled = roll.reduce(sumReducer, 0);

	let range = cardRange(card);

	return rolled >= range.min && rolled <= range.max;
};

const cardRange = (card) => {
	let rollSpec = card.roll;

	if (_.isNaN(Number(rollSpec))) {
		let match = rollSpec.match(/(\d+) *- *(\d+)/);

		return {min: Number(match[1]), max: Number(match[2])};
	}

	return {min: Number(rollSpec), max: Number(rollSpec)};
};

export default MachiKoro;
