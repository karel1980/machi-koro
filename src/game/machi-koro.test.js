import {
	initialPlayer,
	newTurn,
	playBlueCardsMove,
	playGreenCardsMove,
	playRedCardsMove,
	playRollMove,
	buyCardMove,
	INITIAL_DECK
} from './machi-koro';

describe('machi-koro', () => {
	describe('playRollMove', () => {
		it('increases numRolls on the current turn', () => {
			let G = { currentTurn: { numRolls: 0 } };

			expect(playRollMove(G).currentTurn.numRolls).toEqual(1);
		});

		it('lets lastRoll', () => {
			let G = { currentTurn: { numRolls: 0 } };
			expect(playRollMove(G, undefined, 0).currentTurn.lastRoll).toBeUndefined();

			G = { currentTurn: { numRolls: 0 } };
			expect(playRollMove(G, undefined, 1).currentTurn.lastRoll.length).toEqual(1);

			G = { currentTurn: { numRolls: 0 } };
			expect(playRollMove(G, undefined, 2).currentTurn.lastRoll.length).toEqual(2);
			
			G = { currentTurn: { numRolls: 0 } };
			expect(playRollMove(G, undefined, 3).currentTurn.lastRoll).toBeUndefined();
		});

		it('does not do anything already rolled', () => {
			let G = playRollMove({ currentTurn: { numRolls: 0 } }, undefined, 1);
			let roll = G.currentTurn.lastRoll;

			expect(playRollMove(G, undefined, 0).currentTurn.lastRoll).toBe(roll);
			expect(playRollMove(G, undefined, 0).currentTurn.numRolls).toEqual(1);
		});
	});

	describe('playRedCardsMove', () => {
		it('does nothing when there are no red cards', () => {
			let G = { currentTurn: { numRolls: 1 }, players: [initialPlayer(), initialPlayer()] };

			G = playRedCardsMove(G, { currentPlayer: 0 });
			
			expect(G.players[0].coins).toEqual(3);
			expect(G.players[0].coins).toEqual(3);
		});

		it('gives coins from player 0 to player 1 when player 1 has a red card and player 0 rolls that value', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [3] }, players: [initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'cafe', 1);

			G = playRedCardsMove(G, { currentPlayer: 0 });

			expect(G.players[0].coins).toEqual(2);
			expect(G.players[1].coins).toEqual(4);
		});

		it('does nothing when a different value is rolled', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [4] }, players: [initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'cafe', 1);

			G = playRedCardsMove(G, { currentPlayer: 0 });

			expect(G.players[0].coins).toEqual(3);
			expect(G.players[1].coins).toEqual(3);
		});

		it('goes through players in reverse order until player is broke', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [3] }, players: [initialPlayer(), initialPlayer(), initialPlayer(), initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'cafe', 0);
			G = giveCardToPlayer(G, 'cafe', 1);
			G = giveCardToPlayer(G, 'cafe', 2);
			G = giveCardToPlayer(G, 'cafe', 3);
			G = giveCardToPlayer(G, 'cafe', 4);

			G = playRedCardsMove(G, { currentPlayer: 2 });

			expect(G.players[0].coins).toEqual(4);
			expect(G.players[1].coins).toEqual(4);
			expect(G.players[2].coins).toEqual(0);
			expect(G.players[3].coins).toEqual(3);
			expect(G.players[4].coins).toEqual(4);
		});

		it('correctly pays out if current user does not have enough left', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [9] }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'restaurant', 0);
			G = giveCardToPlayer(G, 'restaurant', 1);
			G = giveCardToPlayer(G, 'restaurant', 2);

			G = playRedCardsMove(G, { currentPlayer: 2 });

			expect(G.players[0].coins).toEqual(4);
			expect(G.players[1].coins).toEqual(5);
			expect(G.players[2].coins).toEqual(0);
		});
	});

	describe('playBlueCardsMove', () => {
		it('gives coins to all players if card value is rolled', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [10], hasPlayedRedCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'appelboomgaard', 0);
			G = giveCardToPlayer(G, 'appelboomgaard', 2);

			G = playBlueCardsMove(G, undefined);

			expect(G.players[0].coins).toEqual(6);
			expect(G.players[1].coins).toEqual(3);
			expect(G.players[2].coins).toEqual(6);
		});
	});

	describe('playGreenCardsMove', () => {
		it('gives coins to current player for simple green cards', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [2], hasPlayedRedCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = playGreenCardsMove(G, { currentPlayer: 0 });

			expect(G.players[0].coins).toEqual(4);
			expect(G.players[1].coins).toEqual(3);
			expect(G.players[2].coins).toEqual(3);
		});

		it('gives coins for "modifier" green cards', () => {
			let G = { currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedRedCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };
			G = giveCardToPlayer(G, 'graanveld', 0);
			G = giveCardToPlayer(G, 'groenteenfruitmarkt', 0);
			G = giveCardToPlayer(G, 'graanveld', 1);
			G = giveCardToPlayer(G, 'groenteenfruitmarkt', 1);
			G = giveCardToPlayer(G, 'graanveld', 2);
			G = giveCardToPlayer(G, 'groenteenfruitmarkt', 2);

			G = playGreenCardsMove(G, { currentPlayer: 0 });

			expect(G.players[0].coins).toEqual(9);
			expect(G.players[1].coins).toEqual(3);
			expect(G.players[2].coins).toEqual(3);
		});
	});

	describe('buyCardMove', () => {
		it('has a buyCardMove', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedRedCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = buyCardMove(G, { currentPlayer: 0 });
			expect(G.players[0].coins).toEqual(3);
		});

		it('can buy cards', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = buyCardMove(G, { currentPlayer: 0 }, 'bakkerij');

			expect(G.players[0].deck.length).toEqual(7);
			expect(G.players[0].coins).toEqual(2);
		});

		it('cannot cards which are too expensive', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = buyCardMove(G, { currentPlayer: 0 }, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].coins).toEqual(3);
		});

		it('can buy a yellow card', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };
			G = setPlayerCoins(G, 0, 5);

			G = buyCardMove(G, { currentPlayer: 0 }, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].deck.filter((pc => pc.card == 'treinstation'))[0].enabled).toBe(true);
			expect(G.players[0].coins).toEqual(1);
		});

		it('can not buy yellow card if player does not have enough coins', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = buyCardMove(G, { currentPlayer: 0 }, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].deck.filter((pc => pc.card == 'treinstation'))[0].enabled).toBe(false);
			expect(G.players[0].coins).toEqual(3);
		});

		it('does not allow buying card which has "maxOwnCount: 1 a second time', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = enableCard(G, 'treinstation', 0);
			G = setPlayerCoins(G, 0, 5);

			expect(G.players[0].coins).toEqual(5);
			expect(countCard(G.players[0].deck, 'treinstation')).toBe(1);
			expect(getPlayerCard(G.players[0].deck, 'treinstation').enabled).toBe(true);

			G = buyCardMove(G, { currentPlayer: 0 }, 'treinstation');

			expect(G.players[0].coins).toEqual(5);
			expect(countCard(G.players[0].deck, 'treinstation')).toBe(1);
			expect(getPlayerCard(G.players[0].deck, 'treinstation').enabled).toBe(true);
		});

		fit('does not allow buying a purple card which has "maxOwnCount: 1 a second time', () => {
			let G = { deck: INITIAL_DECK, currentTurn: { numRolls: 1, lastRoll: [12], hasPlayedGreenCards: true, hasPlayedBlueCards: true }, players: [initialPlayer(), initialPlayer(), initialPlayer()] };

			G = giveCardToPlayer(G, 'stadion', 0);
			G = setPlayerCoins(G, 0, 10);

			expect(G.players[0].coins).toEqual(10);
			expect(countCard(G.players[0].deck, 'stadion')).toBe(1);

			G = buyCardMove(G, { currentPlayer: 0 }, 'stadion');

			expect(G.players[0].coins).toEqual(10);
			expect(countCard(G.players[0].deck, 'stadion')).toBe(1);
		});
	});

	const giveCardToPlayer = (G, cardType, playerId) => {
		let players = [...G.players];
		let player = players[playerId];
		players[playerId] = { ...player, deck: [ ...player.deck, { card: cardType } ] };
		return { ...G, players: players };
	};

	const enableCard = (G, cardType, playerId) => {
		let players = [...G.players];
		let player = players[playerId];

		let cardIdx = player.deck.findIndex((cas) => cas.card === cardType);
		let deck = [ ...player.deck ];
		deck[cardIdx] = { ...deck[cardIdx], enabled: true };
		players[playerId] = { ...player, deck: deck };
		return { ...G, players: players };
	};

	const setPlayerCoins = (G, playerId, coins) => {
		let players = [...G.players];
		let player = players[playerId];
		players[playerId] = { ...player, coins: coins };
		return { ...G, players: players };
	};

	const countCard = (playerDeck, cardType) => {
		return playerDeck.filter((cas) => cas.card === cardType).length;
	};

	const getPlayerCard = (playerDeck, cardType) => {
		return playerDeck.filter((cas) => cas.card === cardType)[0];
	};

});