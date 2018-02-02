import React from 'react';

import {Card} from './card';
import './board.css';
import * as _ from 'lodash';
import {allowedNumberOfRolls, playerCanRollWith2Dice} from "../game/machi-koro";
import {Cards} from '../game/cards';

export class Board extends React.Component {

	render() {
		let props = this.props;
		let buyingCardsIsAllowed = hasControl(props) && props.G.currentTurn.hasPlayedGreenCards && props.G.currentTurn.hasPlayedBlueCards && !props.G.currentTurn.hasBoughtCard;
		let buyCard = buyingCardsIsAllowed ? (cardType) => props.moves.buyCard(cardType) : null;
		return (
			<div>
				<Palette {...props}/>

				<Deck deck={props.G.deck} currentPlayer={props.G.players[props.ctx.currentPlayer]} onBuy={buyCard}/>
				<Player name="0" G={props.G} ctx={props.ctx} onBuy={buyCard}/>
				<Player name="1" G={props.G} ctx={props.ctx} onBuy={buyCard}/>
			</div>
		);
	}
};

const Palette = (props) => {

	let control = hasControl(props);
	let spectator = isSpectator(props);

	let roll1 = !control ? undefined : <button onClick={() => props.moves.roll(1)}>Roll with 1 die</button>;
	let roll2 = !control ? undefined : <button onClick={() => props.moves.roll(2)}>Roll with 2 dice</button>;
	let playRed = !control ? undefined : <button onClick={() => props.moves.playRedCards()}>Play red cards</button>;
	let playBlue = !control ? undefined : <button onClick={() => props.moves.playBlueCards()}>Play blue cards</button>;
	let playGreen = !control ? undefined :
		<button onClick={() => props.moves.playGreenCards()}>Play green cards</button>;
	let endTurn = !control ? undefined : <button onClick={() => props.events.endTurn()}>End my turn</button>;

	let title = spectator || !control ? 'Player ' + props.ctx.currentPlayer :
		control && !props.isActive ? 'Your turn' : 'Player ' + props.ctx.currentPlayer;

	title += ` (Coins: ${props.G.players[props.ctx.currentPlayer].coins})`;

	let rolled = props.G.currentTurn.numRolls === 0 ? '' :
		<span>...rolled <Dice values={props.G.currentTurn.lastRoll}/></span>;

	return (<div className="palette">
		<h3>{title} {rolled}</h3>
		<div>
			{showRollButton(props) ? roll1 : undefined}
			{showRoll2Button(props) ? roll2 : undefined}
			{props.G.currentTurn.numRolls > 0 && !props.G.currentTurn.hasPlayedRedCards ? playRed : undefined}
			{props.G.currentTurn.hasPlayedRedCards && !props.G.currentTurn.hasPlayedBlueCards ? playBlue : undefined}
			{props.G.currentTurn.hasPlayedRedCards && !props.G.currentTurn.hasPlayedGreenCards ? playGreen : undefined}
			{props.G.currentTurn.hasPlayedBlueCards && props.G.currentTurn.hasPlayedGreenCards ? endTurn : undefined}
		</div>
	</div>);
};

const Dice = (props) => {
	return props.values.map((value, idx) => <span key={`dice-${idx}`}
												  style={{marginLeft: '1em', marginRight: '1em'}}>{value}</span>)
};

const hasControl = (props) => {
	return props.isActive || (props.playerID === props.ctx.currentPlayer);
};

const isSpectator = (props) => {
	let playerID = Number(props.playerID);
	return _.isNaN(playerID) || playerID < 0 || playerID >= props.ctx.numPlayers;
};

const showRollButton = (props) => {
	return hasControl(props) && playerCanRoll(props.G.currentTurn.numRolls, props.G.players[props.ctx.currentPlayer], props.G.currentTurn.hasPlayedRedCards);
};

const showRoll2Button = (props) => {
	return showRollButton(props) && playerCanRollWith2Dice(props.G.players[props.ctx.currentPlayer]);
};

const playerCanRoll = (currentNumRolls, player, redCardsPlayed) => {
	return !redCardsPlayed && (currentNumRolls < allowedNumberOfRolls(player));
};

const Deck = (props) => (
	<div style={{textAlign: 'center'}}>
		<h2>Deck</h2>
		<div
			className="deck">{
			Object.keys(props.deck).filter((key) => props.deck[key] > 0)
				.map(key => {
					let menuItems = createDeckCardMenu(key, props.currentPlayer, props.currentPlayer.coins >= Cards[key].cost && props.onBuy);
					return (<Card key={key} type={key} menuItems={menuItems}/>)
				})
		}</div>
	</div>
);

const Player = (props) => {
	let player = props.G.players[props.name];
	return (
		<div style={{textAlign: 'center'}}>
			<h2>Player {props.name} (Coins: {player.coins})</h2>
			<div>{
				player.deck.map((playerCard, idx) => {
					let key = playerCardKey(props.name, playerCard.card, idx);
					let menuItems = createPlayerCardMenu(playerCard, player, props.onBuy);
					return <Card key={key} type={playerCard.card}
								 free={playerCard.free} enabled={playerCard.enabled} menuItems={menuItems}/>
				})
			}</div>
		</div>
	);
};

const createDeckCardMenu = (cardType, player, onBuy) => {
	return createCardMenu(cardType, player, onBuy);
};

const createPlayerCardMenu = (playerCard, player, onBuy) => {
	return createCardMenu(playerCard.card, player, playerCard.enabled === false && player.coins >= Cards[playerCard.card].cost && onBuy);
};

const createCardMenu = (cardType, player, onBuy) => {
	let menuItems = null;
	if (onBuy) {
		menuItems = [
			<li key="buy" onClick={() => onBuy(cardType)}>Buy this card</li>,
		];
	}
	return menuItems;
};

const playerCardKey = (playerId, card, cardIdx) => "player-" + playerId + "-" + card + "-" + cardIdx;