import { playRollMove, playRedCardsMove, playBlueCardsMove } from './machi-koro';
import { newTurn, initialPlayer } from './machi-koro';
import { inspect } from 'util';

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

	const giveCardToPlayer = (G, cardType, playerId) => {
		let players = [...G.players];
		let player = players[playerId];
		players[playerId] = { ...player, deck: [ ...player.deck, { card: cardType } ] };
		return { ...G, players: players };
	};
});

