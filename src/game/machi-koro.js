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
	lastRoll: undefined,
	questions: []
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
		buyCard: buyCardMove,
		swapCards: playSwapCardsMove,
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
	if (G.currentTurn.numRolls >= allowedNumberOfRolls(G.players[ctx.currentPlayer])) {
		return G; //rolled already
	}

	if (numDice < 1 || numDice > 2) {
		return G; //incorrect number of dice
	}

	if (numDice === 2 && !playerCanRollWith2Dice(G.players[ctx.currentPlayer])) {
		return G;
	}

	let roll = [];
	if (!_.isUndefined(G.forceRoll)) { // for testing
		roll = G.forceRoll;
	} else {
		roll.push(doRoll())
		if (numDice === 2) {
			roll.push(doRoll());
		}
	}

	return {...G, currentTurn: {...G.currentTurn, numRolls: G.currentTurn.numRolls + 1, lastRoll: roll, questions: []}};
}

// exported for testing
export function playSwapCardsMove(G, ctx, victim, cardToGive, cardToTake) {
	if (G.currentTurn.hasSwappedCards) {
		// Only one swap allowed
		return G;
	}

	if (!G.currentTurn.hasPlayedBlueCards && !G.currentTurn.hasPlayedGreenCards) {
		// other cards must be played first
		return G;
	}

	let cardAllowingSwapping = _.find(G.players[ctx.currentPlayer].deck.filter(playerCardRollMatcher(G.currentTurn.lastRoll)), playerCard => Cards[playerCard.card].allowSwapping);
	if (_.isNil(cardAllowingSwapping)) {
		// player does not have card allowing to swap
		return G;
	}

	if (!(victim in G.players)) {
		// victim must exist
		return G;
	}

	if (_.some(cardAllowingSwapping.excludedSymbols, (symbol) => Cards[cardToGive] === symbol)) {
		// cards must be allowed for swapping
		return G;
	}

	if (_.some(cardAllowingSwapping.excludedSymbols, (symbol) => Cards[cardToTake] === symbol)) {
		// cards must be allowed for swapping
		return G;
	}

	if (cardToGive === cardToTake) {
		// pointless move
		return G;
	}

	let playerIdx = Number(ctx.currentPlayer);
	let victimIdx = Number(victim);

	if (!playerDeckContainsCardType(G.players[victimIdx].deck, cardToTake)) {
		// cannot take what victim does not have
		return G;
	}

	if (!playerDeckContainsCardType(G.players[playerIdx].deck, cardToGive)) {
		// cannot give what you do not have
		return G;
	}

	//TODO: Optional improvement: check if victim === current player?

	let players = [...G.players];

	players[playerIdx] = {
		...players[playerIdx],
		deck: removePlayerCard(addPlayerCard(players[playerIdx].deck, cardToTake), cardToGive)
	};
	players[victimIdx] = {
		...players[victimIdx],
		deck: removePlayerCard(addPlayerCard(players[victimIdx].deck, cardToGive), cardToTake)
	};

	return {...G, players, currentTurn: {...G.currentTurn, hasSwappedCards: true}};
}

const playerDeckContainsCardType = (playerDeck, cardType) => {
	return _.some(playerDeck, ({card}) => cardType === card);
};

const removePlayerCard = (playerDeck, cardType) => {
	const playerCardIdx = playerDeck.findIndex(playerCard => playerCard.card === cardType);
	if (playerCardIdx >= 0) {
		return playerDeck.filter((value, idx) => idx !== playerCardIdx);
	}

	return playerDeck;
};

const addPlayerCard = (playerDeck, cardType) => {
	return playerDeck.concat([{card: cardType}]);
};

export const allowedNumberOfRolls = (player) => {
	return player.deck.filter((cas) => (cas.enabled && Cards[cas.card].reRoll))
		.length > 0 ? 2 : 1;
};

export const playerCanRollWith2Dice = (player) => {
	return player.deck.filter((cas) => cas.enabled && Cards[cas.card].canRollWith2Dice).length > 0;
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
		for (let playerCard of player.deck.filter(playerCardCategoryAndRollMatcher('red', G.currentTurn.lastRoll))) {
			let opponentCard = Cards[playerCard.card];
			if (coins[ctx.currentPlayer] <= 0) {
				break;
			}

			let payout = Math.min(coins[ctx.currentPlayer], opponentCard.payout + getPaymentIncrementsForCard(player.deck, opponentCard));

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
		coins: p.coins + p.deck.filter(playerCardCategoryAndRollMatcher('blue', G.currentTurn.lastRoll))
			.map(playerCard => Cards[playerCard.card].payout)
			.reduce(sumReducer, 0)
	}));

	return {...G, currentTurn: {...G.currentTurn, hasPlayedBlueCards: true}, players};
}

const sumReducer = (acc, current) => acc + current;

const getPaymentIncrementsForCard = (playerDeck, card) => {
	return playerDeck.filter((cas) => cas.enabled)
		.map(cas => Cards[cas.card])
		.filter(playerCard => !_.isNil(playerCard.paymentIncreaseBy))
		.filter(incrementingCard => _.some(incrementingCard.paymentIncreaseForSymbols, (symbol) => card.symbol === symbol))
		.map(incrementingCard => incrementingCard.paymentIncreaseBy)
		.reduce(sumReducer, 0);
};

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

	let activeGreenCards = current.deck.filter(playerCardCategoryAndRollMatcher('green', G.currentTurn.lastRoll))
		.map(playerCard => Cards[playerCard.card]);

	let simpleGreenCards = activeGreenCards.filter((card) => _.isNil(card.payoutFor));
	current.coins += simpleGreenCards.map(card => {
		return card.payout + getPaymentIncrementsForCard(current.deck, card)
	}).reduce(sumReducer, 0);

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

const playerCardCategoryAndRollMatcher = (category, roll) => playerCard => Cards[playerCard.card].category === category && playerCardRollMatcher(roll)(playerCard);

export function collectCoinsFromOpponentMove(G, ctx, opponentId) {
	if (G.currentTurn.hasCollectedFromOpponent) {
		// can collect only once
		return G;
	}

	if (!G.currentTurn.hasPlayedBlueCards || !G.currentTurn.hasPlayedGreenCards) {
		// play green and blue first
		return G;
	}

	let cardAllowingCollecting = _.find(G.players[ctx.currentPlayer].deck.filter(playerCardRollMatcher(G.currentTurn.lastRoll)), playerCard => Cards[playerCard.card].collectFromSelectedPlayer)

	if (_.isNil(cardAllowingCollecting)) {
		// player is not allowed to collect
		return G;
	}

	if (ctx.currentPlayer === Number(opponentId)) {
		// pointless move
		return G;
	}

	let players = [...G.players];
	let player = {...players[ctx.currentPlayer]};
	let opponent = {...players[Number(opponentId)]};
	let amount = Math.min(opponent.coins, Cards[cardAllowingCollecting.card].payout);

	player.coins += amount;
	opponent.coins -= amount;

	players[ctx.currentPlayer] = player;
	players[Number(opponentId)] = opponent;

	return {...G, players, currentTurn: {...G.currentTurn, hasCollectedFromOpponent: true}}
}

const playerCardRollMatcher = (roll) => {
	return ({card}) => {
		let rolled = roll.reduce(sumReducer, 0);

		let range = cardRange(Cards[card]);

		return rolled >= range.min && rolled <= range.max;
	}
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
