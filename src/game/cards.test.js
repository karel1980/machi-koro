import {compareRoll, compareRollAndCost} from './cards';

fdescribe('cards', () => {
	describe('compareRoll', () => {
		describe('comparing identical values', () => {
			it('returns 0 for identical cards, with single value', () => {
				expect(compareRoll('stadion','stadion')).toBe(0);
			});
			it('returns 0 for identical cards, with ranges', () => {
				expect(compareRoll('bakkerij','bakkerij')).toBe(0);
			});
			it('returns 0 for cards without roll value', () => {
				expect(compareRoll('pretpark','pretpark')).toBe(0);
			});
		});

		describe('different roll values', () => {
			it('returns -1 if left card has lower roll value', () => {
				expect(compareRoll('graanveld','stadion')).toBe(-1);
			});
			it('returns 1 if left card has higher roll value', () => {
				expect(compareRoll('stadion','graanveld')).toBe(1);
			});

			it('returns -1 if minimum is equal, but maximum of left is lower', () => {
				expect(compareRoll('veehouderij','bakkerij')).toBe(-1);
			});
			it('returns 1 if minimum is equal, but maximum of left is higher', () => {
				expect(compareRoll('bakkerij','veehouderij')).toBe(1);
			});

			it('returns 1 if left card does not have a roll value', () => {
				expect(compareRoll('pretpark', 'stadion')).toBe(1);
			});
			it('returns -1 if right card does not have a roll value', () => {
				expect(compareRoll('stadion', 'pretpark')).toBe(-1);
			});
		});
	});

	describe('cardRollAndCost', () => {
		it('returns 0 for identical cards', () => {
			expect(compareRollAndCost('stadion', 'stadion')).toBe(0);
		});

		it('returns -1 if roll is identical and cost of left is lower', () => {
			expect(compareRollAndCost('treinstation', 'pretpark')).toBe(-1);
		});

		it('returns 1 if roll is identical and cost of left is higher', () => {
			expect(compareRollAndCost('pretpark', 'treinstation')).toBe(1);
		});
	});
});