import {
	buyCardMove,
	distributeCoinsMove,
	INITIAL_DECK,
	initialPlayer,
	newTurn,
	playRollMove,
	playSwapCardsMove,
	restartTurnMove,
	takeCoinsFromPlayerMove
} from './machi-koro';

describe('machi-koro', () => {
	describe('playRollMove', () => {

		let G, ctx;

		beforeEach(() => {
			G = {currentTurn: {numRolls: 0}, players: [initialPlayer(), initialPlayer()]};
			ctx = {currentPlayer: 0};
		});

		it('increases numRolls on the current turn', () => {
			expect(playRollMove(G, ctx, 1).currentTurn.numRolls).toEqual(1);
		});

		it('sets lastRoll if it is a valid move', () => {
			expect(playRollMove(G, ctx, 1).currentTurn.lastRoll.length).toEqual(1);
		});

		it('does not let lastRoll if it is not a valid move', () => {
			expect(playRollMove(G, ctx, 0).currentTurn.lastRoll).toBeUndefined();

			expect(playRollMove(G, ctx, 2).currentTurn.lastRoll).toBeUndefined();

			expect(playRollMove(G, ctx, 3).currentTurn.lastRoll).toBeUndefined();
		});

		it('does not do anything when already rolled', () => {
			G = playRollMove(G, ctx, 1);
			let roll = G.currentTurn.lastRoll;

			expect(playRollMove(G, ctx, 0).currentTurn.lastRoll).toBe(roll);
			expect(playRollMove(G, ctx, 0).currentTurn.numRolls).toEqual(1);
		});

		it('can not roll with 2 dice if player does not have a train station', () => {
			G = playRollMove(G, ctx, 2);

			expect(G.currentTurn.lastRoll).toBeUndefined();
		});

		it('can roll with 2 dice if player has a train station', () => {
			G = enableCard(G, 'treinstation', 0);

			G = playRollMove(G, ctx, 2);

			expect(G.currentTurn.lastRoll.length).toBe(2);
		});

		it('can reroll', () => {
			expect(G.currentTurn.numRolls).toBe(0);
			G = playRollMove(G, ctx, 1);
			expect(G.currentTurn.numRolls).toBe(1);
			G = playRollMove(G, ctx, 1);
			expect(G.currentTurn.numRolls).toBe(1);

			G = enableCard(G, 'radiostation', 0);
			G = playRollMove(G, ctx, 1);
			expect(G.currentTurn.numRolls).toBe(2);
		});

	});

	describe('distributeCoinsMove', () => {
		describe('red cards', () => {
			it('does nothing when there are no red cards', () => {
				let G = {currentTurn: {numRolls: 1, lastRoll: [1]}, players: [initialPlayer(), initialPlayer()]};

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(4);
				expect(G.players[0].coins).toEqual(4);
				expect(G.currentTurn.changeLog).toEqual([
					{
						"amount": 1,
						"augmentingCards": undefined,
						"cardType": "graanveld",
						"from": null,
						"to": 0,
						"type": "coinsTransferred"
					},
					{
						"amount": 1,
						"augmentingCards": undefined,
						"cardType": "graanveld",
						"from": null,
						"to": 1,
						"type": "coinsTransferred"
					}
				]);
			});

			it('gives coins from player 0 to player 1 when player 1 has a red card and player 0 rolls that value', () => {
				let G = {currentTurn: {numRolls: 0}, players: [initialPlayer(), initialPlayer()], forceRoll: [3]};
				let ctx = {currentPlayer: 0};
				G = giveCardToPlayer(G, 'cafe', 1);
				G = playRollMove(G, ctx);

				G = distributeCoinsMove(G, ctx);

				expect(G.players[0].coins).toEqual(3);
				expect(G.players[1].coins).toEqual(4);
			});

			it('does nothing when a different value is rolled', () => {
				let G = {currentTurn: {numRolls: 1, lastRoll: [4]}, players: [initialPlayer(), initialPlayer()]};
				G = giveCardToPlayer(G, 'cafe', 1);

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(3);
				expect(G.players[1].coins).toEqual(3);
			});

			it('goes through players in reverse order until player is broke', () => {
				let G = {
					currentTurn: {numRolls: 1, lastRoll: [3]},
					players: [initialPlayer(), initialPlayer(), initialPlayer(), initialPlayer(), initialPlayer()]
				};
				G = giveCardToPlayer(G, 'cafe', 0);
				G = giveCardToPlayer(G, 'cafe', 1);
				G = giveCardToPlayer(G, 'cafe', 2);
				G = giveCardToPlayer(G, 'cafe', 3);
				G = giveCardToPlayer(G, 'cafe', 4);

				G = distributeCoinsMove(G, {currentPlayer: 2});

				expect(G.players[0].coins).toEqual(4);
				expect(G.players[1].coins).toEqual(4);
				expect(G.players[2].coins).toEqual(1);
				expect(G.players[3].coins).toEqual(3);
				expect(G.players[4].coins).toEqual(4);
			});

			it('correctly pays out if current user does not have enough left', () => {
				let G = {
					currentTurn: {numRolls: 1, lastRoll: [9]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};
				G = giveCardToPlayer(G, 'restaurant', 0);
				G = giveCardToPlayer(G, 'restaurant', 1);
				G = giveCardToPlayer(G, 'restaurant', 2);

				G = distributeCoinsMove(G, {currentPlayer: 2});

				expect(G.players[0].coins).toEqual(4);
				expect(G.players[1].coins).toEqual(5);
				expect(G.players[2].coins).toEqual(0);
			});

			it('increases income when there is a card with paymentIncreaseBy', () => {
				const INITIAL_GAME = {
					currentTurn: {numRolls: 1, lastRoll: [3]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};
				let G = giveCardToPlayer(INITIAL_GAME, 'cafe', 1);
				G = enableCard(G, 'winkelcentrum', 1);

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(2); //+1 for bakery, -2 for cafe + winkelcentrum
				expect(G.players[1].coins).toEqual(5);
				expect(G.players[2].coins).toEqual(3);
			});
		});

		describe('blue cards', () => {
			it('gives coins to all players if card value is rolled', () => {
				let G = {
					currentTurn: {numRolls: 1, lastRoll: [10]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};
				G = giveCardToPlayer(G, 'appelboomgaard', 0);
				G = giveCardToPlayer(G, 'appelboomgaard', 2);

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(6);
				expect(G.players[1].coins).toEqual(3);
				expect(G.players[2].coins).toEqual(6);
			});

		});

		describe('green cards', () => {
			it('gives coins to current player for simple green cards', () => {
				let G = {
					currentTurn: {numRolls: 1, lastRoll: [2]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(4);
				expect(G.players[1].coins).toEqual(3);
				expect(G.players[2].coins).toEqual(3);

				expect(G.currentTurn.changeLog).toEqual([{
					"type": "coinsTransferred",
					"from": null,
					"to": 0,
					"amount": 1,
					"cardType": "bakkerij",
					"augmentingCards": []
				}]);
			});

			it('gives coins for "modifier" green cards', () => {
				let G = {
					currentTurn: {numRolls: 1, lastRoll: [12]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};
				G = giveCardToPlayer(G, 'graanveld', 0);
				G = giveCardToPlayer(G, 'groenteenfruitmarkt', 0);
				G = giveCardToPlayer(G, 'graanveld', 1);
				G = giveCardToPlayer(G, 'groenteenfruitmarkt', 1);
				G = giveCardToPlayer(G, 'graanveld', 2);
				G = giveCardToPlayer(G, 'groenteenfruitmarkt', 2);

				G = distributeCoinsMove(G, {currentPlayer: 0});

				expect(G.players[0].coins).toEqual(9); // 2 wheatfields * 3 payout
				expect(G.players[1].coins).toEqual(3);
				expect(G.players[2].coins).toEqual(3);
			});

			it('increases income when there is a card with paymentIncreaseBy', () => {
				const INITIAL_GAME = {
					currentTurn: {numRolls: 1, lastRoll: [3]},
					players: [initialPlayer(), initialPlayer(), initialPlayer()]
				};

				let G = distributeCoinsMove(INITIAL_GAME, {currentPlayer: 0});
				expect(G.players[0].coins).toEqual(4);

				G = distributeCoinsMove(enableCard(
					INITIAL_GAME, 'winkelcentrum', 0), {currentPlayer: 0});
				expect(G.players[0].coins).toEqual(5);
			});
		});
	});

	describe('playCardRequiringUserInput', () => {
		describe('swap card', () => {
			it('can swap cards', () => {
				let G = {
					currentTurn: {numRolls: 0, hasDistributedCoins: true},
					players: [initialPlayer(), initialPlayer(), initialPlayer()],
					forceRoll: [6]
				};
				let ctx = {currentPlayer: 0};
				G = giveCardToPlayer(G, 'bedrijvencomplex', 0);
				G = playRollMove(G, ctx);
				G = playSwapCardsMove(G, ctx, 1, 'bakkerij', 'graanveld');

				expect(countCard(G.players[0].deck, 'bakkerij')).toBe(0);
				expect(countCard(G.players[0].deck, 'graanveld')).toBe(2);
				expect(countCard(G.players[1].deck, 'bakkerij')).toBe(2);
				expect(countCard(G.players[1].deck, 'graanveld')).toBe(0);
			});
		});
	});

	describe('buyCardMove', () => {
		it('has a buyCardMove', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = buyCardMove(G, {currentPlayer: 0});
			expect(G.players[0].coins).toEqual(3);
		});

		it('can buy cards', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = buyCardMove(G, {currentPlayer: 0}, 'bakkerij');

			expect(G.players[0].deck.length).toEqual(7);
			expect(G.players[0].coins).toEqual(2);
		});

		it('cannot cards which are too expensive', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = buyCardMove(G, {currentPlayer: 0}, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].coins).toEqual(3);
		});

		it('can buy a yellow card', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};
			G = setPlayerCoins(G, 0, 5);

			G = buyCardMove(G, {currentPlayer: 0}, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].deck.filter((pc => pc.card == 'treinstation'))[0].enabled).toBe(true);
			expect(G.players[0].coins).toEqual(1);
		});

		it('can not buy yellow card if player does not have enough coins', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = buyCardMove(G, {currentPlayer: 0}, 'treinstation');

			expect(G.players[0].deck.length).toEqual(6);
			expect(G.players[0].deck.filter((pc => pc.card == 'treinstation'))[0].enabled).toBe(false);
			expect(G.players[0].coins).toEqual(3);
		});

		it('does not allow buying card which has "maxOwnCount: 1 a second time', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = enableCard(G, 'treinstation', 0);
			G = setPlayerCoins(G, 0, 5);

			expect(G.players[0].coins).toEqual(5);
			expect(countCard(G.players[0].deck, 'treinstation')).toBe(1);
			expect(getPlayerCard(G.players[0].deck, 'treinstation').enabled).toBe(true);

			G = buyCardMove(G, {currentPlayer: 0}, 'treinstation');

			expect(G.players[0].coins).toEqual(5);
			expect(countCard(G.players[0].deck, 'treinstation')).toBe(1);
			expect(getPlayerCard(G.players[0].deck, 'treinstation').enabled).toBe(true);
		});

		it('does not allow buying a purple card which has "maxOwnCount: 1 a second time', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [12], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = giveCardToPlayer(G, 'stadion', 0);
			G = setPlayerCoins(G, 0, 10);

			expect(G.players[0].coins).toEqual(10);
			expect(countCard(G.players[0].deck, 'stadion')).toBe(1);

			G = buyCardMove(G, {currentPlayer: 0}, 'stadion');

			expect(G.players[0].coins).toEqual(10);
			expect(countCard(G.players[0].deck, 'stadion')).toBe(1);
		});
	});

	describe('collect coins from appointed player', () => {
		it('allows the player to collect coins from a specific player', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 0, hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()],
				forceRoll: [6]
			};
			let ctx = {currentPlayer: 0};
			G = giveCardToPlayer(G, 'tvstation', 0);
			G = setPlayerCoins(G, 0, 100);
			G = setPlayerCoins(G, 1, 100);
			G = playRollMove(G, ctx);

			G = takeCoinsFromPlayerMove(G, ctx, 1);

			expect(G.players[0].coins).toEqual(106);
			expect(G.players[1].coins).toEqual(94);
		});
	});

	describe('restartTurnMove', () => {
		it('sets the restart flag when rolling', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 0},
				players: [initialPlayer(), initialPlayer(), initialPlayer()],
				forceRoll: [3, 3]
			};

			G = enableCard(G, 'pretpark', 0);
			G = playRollMove(G, {currentPlayer: 0}, 1);

			expect(G.currentTurn.canRestart).toBe(true);
		});

		it('allows player to restart turn if restart is allowed', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {
					numRolls: 1,
					lastRoll: [3, 3],
					hasDistributedCoins: true,
					canRestart: true
				},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = enableCard(G, 'pretpark', 0);
			G = restartTurnMove(G, {currentPlayer: 0});

			expect(G.currentTurn.numRolls).toBe(0);
			expect(G.currentTurn.lastRoll).toBeUndefined();
		});

		it('does not allow restarting turn if player does not have the appropriate card', () => {
			let G = {
				deck: INITIAL_DECK,
				currentTurn: {numRolls: 1, lastRoll: [3, 3], hasDistributedCoins: true},
				players: [initialPlayer(), initialPlayer(), initialPlayer()]
			};

			G = restartTurnMove(G, {currentPlayer: 0});

			expect(G.currentTurn.numRolls).toBe(1);
			expect(G.currentTurn.lastRoll).toEqual([3, 3]);
		});
	});

	describe('takeFromPlayer', () => {
		it('allows taking from selected player', () => {
			let G = { players: [initialPlayer(), initialPlayer(), initialPlayer()], forceRoll: [6], currentTurn: { numRolls: 0 , hasDistributedCoins: true, changeLog: []}};
			let ctx = { currentPlayer: 0 };
			G = giveCardToPlayer(G, 'tvstation', 0);
			G = setPlayerCoins(G, 1, 100);
			G = playRollMove(G, ctx);

			G = takeCoinsFromPlayerMove(G, ctx, 1, 'tvstation');

			expect(G.players[0].coins).toEqual(9);
			expect(G.players[1].coins).toEqual(94);
			expect(G.players[2].coins).toEqual(3);

			expect(G.currentTurn.changeLog).toEqual([
				{"amount": 6, "augmentingCards": undefined, "cardType": "tvstation", "from": 0, "to": 1, "type": "coinsTransferred"}
			]);
		});

		it('does not take more than the selected player has', () => {
			let G = { players: [initialPlayer(), initialPlayer(), initialPlayer()], forceRoll: [6], currentTurn: { numRolls: 0 , hasDistributedCoins: true, changeLog: []}};
			let ctx = { currentPlayer: 0 };
			G = giveCardToPlayer(G, 'tvstation', 0);
			G = playRollMove(G, ctx);

			G = takeCoinsFromPlayerMove(G, ctx, 1, 'tvstation');

			expect(G.players[0].coins).toEqual(6);
			expect(G.players[1].coins).toEqual(0);
			expect(G.players[2].coins).toEqual(3);
			expect(G.currentTurn.changeLog).toEqual([{"amount": 3, "augmentingCards": undefined, "cardType": "tvstation", "from": 0, "to": 1, "type": "coinsTransferred"}]);
		});
	});

	const giveCardToPlayer = (G, cardType, playerId) => {
		let players = [...G.players];
		let player = players[playerId];
		players[playerId] = {...player, deck: [...player.deck, {card: cardType}]};
		return {...G, players: players};
	};

	const enableCard = (G, cardType, playerId) => {
		let players = [...G.players];
		let player = players[playerId];

		let cardIdx = player.deck.findIndex((cas) => cas.card === cardType);
		let deck = [...player.deck];
		deck[cardIdx] = {...deck[cardIdx], enabled: true};
		players[playerId] = {...player, deck: deck};
		return {...G, players: players};
	};

	const setPlayerCoins = (G, playerId, coins) => {
		let players = [...G.players];
		let player = players[playerId];
		players[playerId] = {...player, coins: coins};
		return {...G, players: players};
	};

	const countCard = (playerDeck, cardType) => {
		return playerDeck.filter((cas) => cas.card === cardType).length;
	};

	const getPlayerCard = (playerDeck, cardType) => {
		return playerDeck.filter((cas) => cas.card === cardType)[0];
	};

});