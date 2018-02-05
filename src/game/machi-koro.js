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
	coins: 300,
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
	changeLog: []
});

const MachiKoro = Game({
	name: 'Machi Koro',

	setup: () => ({
		deck: INITIAL_DECK,
		players: [
			initialPlayer(),
			initialPlayer()
		],
		currentTurn: newTurn(),
		forceRoll: [6]
	}),

	moves: {
		roll: playRollMove,
		distributeCoins: distributeCoinsMove,
		buyCard: buyCardMove,
		swapCards: playSwapCardsMove,
		restartTurn: restartTurnMove,
		takeCoinsFromPlayer: takeCoinsFromPlayerMove
	},

	flow: {
		onTurnEnd: (G, ctx) => {
			return ({...G, currentTurn: newTurn()})
		},

		endGameIf: (G, ctx) => {
			//if (a player has all orange class cards) return that player;
		},

		//TODO: REVIEW RULES: is buying a card always the last actions -> automatically end turn? => implement via endTurnIf?
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
		roll.push(doRoll());
		if (numDice === 2) {
			roll.push(doRoll());
		}
	}

	let player = G.players[ctx.currentPlayer];

	let activeCards = getActiveCards(player.deck, roll);

	let canRestart = !_.isNil(activeCards.find(cardType => Cards[cardType].allowAnotherTurnOnDoubleThrow))
		&& roll.length === 2 && roll[0] === roll[1];

	let currentTurn = {
		...G.currentTurn,
		activeCards,
		canRestart,
		numRolls: G.currentTurn.numRolls + 1,
		lastRoll: roll
	};

	return {
		...G,
		currentTurn: currentTurn
	};
}

export function getActiveCards(playerDeck, roll) {
	return playerDeck.filter(playerCard => playerCard.enabled !== false)
		.map(playerCard => playerCard.card)
		.filter(cardType => _.isNil(Cards[cardType].roll) || cardTypeRollMatcher(roll)(cardType));
}

// exported for testing
export function playSwapCardsMove(G, ctx, victim, cardToGive, cardToTake) {
	if (G.currentTurn.hasSwappedCards) {
		// Only one swap allowed
		return G;
	}

	if (!G.currentTurn.hasDistributedCoins) {
		// other cards must be played first
		return G;
	}

	let cardAllowingSwapping = G.currentTurn.activeCards.find(cardType => Cards[cardType].allowSwapping);
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

export function distributeCoinsMove(G, ctx) {
	if (G.currentTurn.numRolls === 0) {
		return G; // must roll first
	}

	if (G.currentTurn.hasDistributedCoins) {
		return G; // coins can be distributed only once per turn
	}

	G = distributeCoinsForRedCards(G, ctx);
	G = distributeCoinsForBlueCards(G);
	G = distributeCoinsForGreenCards(G, ctx);

	return {...G, currentTurn: {...G.currentTurn, hasDistributedCoins: true}};
}

export function distributeCoinsForRedCards(G, ctx) {
	// start at currentPlayer - 1, go down and stop before currentPlayer
	let coins = G.players.map(p => p.coins);

	let changeLog = [];
	for (let i = 0; i < G.players.length - 1; i++) {
		if (coins[ctx.currentPlayer] <= 0) {
			break;
		}

		let playerIdx = (2 * G.players.length + ctx.currentPlayer - i - 1) % G.players.length;
		let player = G.players[playerIdx];
		for (let cardType of getActiveCards(player.deck, G.currentTurn.lastRoll).filter(cardType => Cards[cardType].category === 'red')) {
			if (coins[ctx.currentPlayer] <= 0) {
				changeLog.push(coinTransferStopped(ctx.currentPlayer, playerIdx, cardType));
				break;
			}
			let opponentCard = Cards[cardType];
			let opponentCardAugmenters = getAugmentingCards(player.deck, G.currentTurn.lastRoll, cardType);
			let payout = Math.min(coins[ctx.currentPlayer], opponentCard.payout + opponentCardAugmenters.map(cardType => Cards[cardType].paymentIncreaseBy).reduce(sumReducer, 0));
			changeLog.push(coinsTransferred(ctx.currentPlayer, playerIdx, cardType, payout, opponentCardAugmenters));

			coins[ctx.currentPlayer] -= payout;
			coins[playerIdx] += payout;
		}
	}

	let players = G.players.map((player, idx) => ({...player, coins: coins[idx]}));
	return {...G, currentTurn: appendChangeLog(G.currentTurn, changeLog), players};
}

const coinTransferStopped = (from, to, cardType) => ({type: 'coinTransferStopped', from, to, cardType});
const coinsTransferred = (from, to, cardType, amount, augmentingCards) => ({
	type: 'coinsTransferred',
	from,
	to,
	cardType,
	amount,
	augmentingCards
});
const appendChangeLog = (turn, entries) => ({
	...turn,
	changeLog: _.isNil(turn.changeLog) ? entries : turn.changeLog.concat(entries)
});

export function distributeCoinsForBlueCards(G) {
	let transfersPerPlayer = G.players.map((player, playerIdx) => {
		return getActiveCards(player.deck, G.currentTurn.lastRoll).filter(cardType => Cards[cardType].category === 'blue')
			.map(cardType => coinsTransferred(null, playerIdx, cardType, Cards[cardType].payout))});
	let currentTurn = appendChangeLog(G.currentTurn, _.flatten(transfersPerPlayer));
	let players = _.zipWith(G.players, transfersPerPlayer, (player, transfers) => ({
		...player,
		coins: player.coins + transfers
			.map(transfer => transfer.amount)
			.reduce(sumReducer, 0)
	}));
	return {...G, currentTurn, players};
}

const sumReducer = (acc, current) => acc + current;

const getAugmentingCards = (playerDeck, roll, cardType) => {
	return getActiveCards(playerDeck, roll)
		.filter(playerCardType => !_.isNil(Cards[playerCardType].paymentIncreaseBy))
		.filter(playerCardType => _.some(Cards[playerCardType].paymentIncreaseForSymbols, (symbol) => Cards[cardType].symbol === symbol))
};

export function distributeCoinsForGreenCards(G, ctx) {
	let currentPlayer = {...G.players[ctx.currentPlayer]};
	let players = [...G.players];
	players[ctx.currentPlayer] = currentPlayer;

	let activeGreenCards = getActiveCards(currentPlayer.deck, G.currentTurn.lastRoll)
		.filter(cardType => Cards[cardType].category === 'green');

	let simpleGreenCards = activeGreenCards.filter((cardType) => _.isNil(Cards[cardType].payoutFor));

	let transfers = simpleGreenCards.map(cardType => {
		let augmentingCards = getAugmentingCards(currentPlayer.deck, G.currentTurn.lastRoll, cardType);
		let extraIncome = augmentingCards.map(cardType => Cards[cardType].paymentIncreaseBy)
			.reduce(sumReducer, 0);

		return coinsTransferred(null, ctx.currentPlayer, cardType, Cards[cardType].payout + extraIncome, augmentingCards)
	});
	currentPlayer.coins += transfers.map(transfer => transfer.amount).reduce(sumReducer, 0);

	let modifierCards = activeGreenCards.filter((cardType) => !_.isNil(Cards[cardType].payoutFor));
	modifierCards.forEach((cardType) => {
		let amount = Cards[cardType].payout * currentPlayer.deck.filter((card) => Cards[card.card].symbol === Cards[cardType].payoutFor).length;
		currentPlayer.coins += amount;
		transfers = transfers.concat(coinsTransferred(null, ctx.currentPlayer, cardType, amount));
	});

	return {...G, currentTurn: appendChangeLog(G.currentTurn, transfers), players};
}

export function buyCardMove(G, ctx, cardType) {
	if (_.isNil(Cards[cardType])) {
		return G;
	}

	if (!G.currentTurn.hasDistributedCoins) {
		return G;
	}

	if (G.currentTurn.hasBoughtCard) {
		return G;
	}

	let player = G.players[ctx.currentPlayer];
	if (Cards[cardType].cost > player.coins) {
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

export function takeCoinsFromPlayerMove(G, ctx, opponentId) {
	if (G.currentTurn.hasTakenFromPlayer) {
		// can take only once
		return G;
	}

	if (!G.currentTurn.hasDistributedCoins) {
		// play red,blue,green cards first
		return G;
	}

	const takingCard = G.currentTurn.activeCards.find(cardType => Cards[cardType].collectFromSelectedPlayer);

	if (_.isNil(takingCard)) {
		return G;
	}

	if (ctx.currentPlayer === Number(opponentId)) {
		// pointless move
		return G;
	}

	let players = [...G.players];
	let player = {...players[ctx.currentPlayer]};
	let opponent = {...players[Number(opponentId)]};
	let amount = Math.min(opponent.coins, Cards[takingCard].payout);

	player.coins += amount;
	opponent.coins -= amount;

	let transfer = coinsTransferred(ctx.currentPlayer, opponentId, takingCard, amount, undefined);

	players[ctx.currentPlayer] = player;
	players[Number(opponentId)] = opponent;

	return {...G, players, currentTurn: appendChangeLog({...G.currentTurn, hasTakenFromPlayer: true}, [transfer])};
}

export function restartTurnMove(G) {
	if (G.currentTurn.hasDistributedCoins && G.currentTurn.canRestart) {
		return {...G, currentTurn: newTurn()};
	}

	return G;
}

export const cardTypeRollMatcher = (roll) => {
	return (cardType) => {
		let rolled = roll.reduce(sumReducer, 0);
		let range = cardRange(Cards[cardType]);

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
