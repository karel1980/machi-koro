import React from 'react';

import {Card} from './card';
import './board.css';
import * as _ from 'lodash';
import {allowedNumberOfRolls, playerCanRollWith2Dice, playerCardRollMatcher} from "../game/machi-koro";
import {Cards} from '../game/cards';

export class Board extends React.Component {

	state = {
		firstToSwap: undefined
	}

	startSwap(cardType) {
		this.setState({...this.state, firstToSwap: cardType});
	}

	render() {
		let props = this.props;
		let buyingCardsIsAllowed = hasControl(props) && props.G.currentTurn.hasDistributedCoins && !props.G.currentTurn.hasBoughtCard;
		let buyCard = buyingCardsIsAllowed ? (cardType) => props.moves.buyCard(cardType) : null;

		let canSwap = hasControl(props)
			&& !props.G.currentTurn.hasSwappedCards
			&& props.G.currentTurn.hasDistributedCoins
			&& !_.isNil(props.G.players[props.ctx.currentPlayer].deck
				.filter(playerCardRollMatcher(props.G.currentTurn.lastRoll))
				.find(playerCard => playerCard.enabled !== false && Cards[playerCard.card].allowSwapping));

		let startSwap = canSwap ? (cardType) => this.startSwap(cardType) : undefined;
		let endSwap = (canSwap && !_.isNil(this.state.firstToSwap)) ? (victim, cardType) => {
			props.moves.swapCards(victim, this.state.firstToSwap, cardType);
			this.setState({...this.state, firstToSwap: undefined});
		} : undefined;
		return (
			<div class="board-container">
				<div class="board-main">
					<Deck deck={props.G.deck} currentPlayer={props.G.players[props.ctx.currentPlayer]} onBuy={buyCard}
						  onStartSwap={startSwap}/>
					<Player name="0" G={props.G} ctx={props.ctx} onBuy={buyCard} onStartSwap={startSwap}
							onEndSwap={endSwap}/>
					<Player name="1" G={props.G} ctx={props.ctx} onBuy={buyCard} onStartSwap={startSwap}
							onEndSwap={endSwap}/>
				</div>
				<div class="board-sidepanel">
					<Palette {...props}/>
				</div>
			</div>
		);
	}
};

const Palette = (props) => {

	let control = hasControl(props);
	let spectator = isSpectator(props);

	let roll1 = !control ? undefined : <button onClick={() => props.moves.roll(1)}>Roll with 1 die</button>;
	let roll2 = !control ? undefined : <button onClick={() => props.moves.roll(2)}>Roll with 2 dice</button>;
	let distributeCoins = !control ? undefined : <button onClick={() => props.moves.distributeCoins()}>Distribute coins</button>;
	let restartTurn = !control ? undefined :
		<button onClick={() => props.moves.restartTurn()}>Play another turn</button>;
	let endTurn = !control ? undefined : <button onClick={() => props.events.endTurn()}>End my turn</button>;

	let title = spectator || !control ? 'Player ' + props.ctx.currentPlayer :
		control && !props.isActive ? 'Your turn' : 'Player ' + props.ctx.currentPlayer;

	let currentPlayer = props.G.players[props.ctx.currentPlayer];
	title += ` (Coins: ${currentPlayer.coins})`;

	let rolled = props.G.currentTurn.numRolls === 0 ? '' :
		<span>...rolled <Dice values={props.G.currentTurn.lastRoll}/></span>;

	return (<div className="palette">
		<h3>{title} {rolled}</h3>
		<div>
			{showRollButton(props) ? roll1 : undefined}
			{showRoll2Button(props) ? roll2 : undefined}
			{props.G.currentTurn.numRolls > 0 && !props.G.currentTurn.hasDistributedCoins ? distributeCoins : undefined}
			{props.G.currentTurn.hasDistributedCoins && props.G.currentTurn.canRestart ? restartTurn : undefined}
			{props.G.currentTurn.hasDistributedCoins && !props.G.currentTurn.canRestart ? endTurn : undefined}
		</div>
	</div>);
};

const Dice = (props) => {
	return props.values.map((value, idx) => <span key={`dice-${idx}`}
												  style={{marginLeft: '1em', marginRight: '1em'}}>{value}</span>)
};

const hasControl = (props) => {
	return props.isActive === true || (props.playerID === props.ctx.currentPlayer);
};

const isSpectator = (props) => {
	let playerID = Number(props.playerID);
	return _.isNaN(playerID) || playerID < 0 || playerID >= props.ctx.numPlayers;
};

const showRollButton = (props) => {
	return hasControl(props) && playerCanRoll(props.G.currentTurn.numRolls, props.G.players[props.ctx.currentPlayer], props.G.currentTurn.hasDistributedCoins);
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
					let playerCard = props.currentPlayer.deck.find(playerCard => playerCard.card === key && playerCard.enabled !== false);
					let menuItems = createDeckCardMenu(
						key,
						props.currentPlayer,
						props.currentPlayer.coins >= Cards[key].cost // can afford
							&& (_.isNil(playerCard) || _.isUndefined(Cards[playerCard.card].maxOwnCount)) // does not own, or owns and can own multiple
							&& props.onBuy);
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
					let menuItems = createPlayerCardMenu(playerCard, props.name, player, props.name === props.ctx.currentPlayer && props.onBuy,
						props.name === props.ctx.currentPlayer && props.onStartSwap,
						props.name !== props.ctx.currentPlayer && props.onEndSwap);
					return <Card key={key} type={playerCard.card}
								 free={playerCard.free} enabled={playerCard.enabled} menuItems={menuItems}/>
				})
			}</div>
		</div>
	);
};

const createDeckCardMenu = (cardType, player, onBuy) => {
	return createCardMenu(cardType, undefined, player, onBuy);
};

const createPlayerCardMenu = (playerCard, playerId, player, onBuy, onStartSwap, onEndSwap) => {
	return createCardMenu(playerCard.card, playerId, player, playerCard.enabled === false && player.coins >= Cards[playerCard.card].cost && onBuy, onStartSwap, onEndSwap);
};

const createCardMenu = (cardType, playerId, player, onBuy, onStartSwap, onEndSwap) => {
	let menuItems = [];
	if (onBuy) {
		menuItems.push(<li key="buy" onClick={() => onBuy(cardType)}>Buy this card</li>)
	}
	if (onStartSwap && Cards[cardType].symbol !== 'tower') {
		menuItems.push(<li key="startSwap" onClick={() => onStartSwap(cardType)}>Swap this card...</li>)
	}
	if (onEndSwap && Cards[cardType].symbol !== 'tower') {
		menuItems.push(<li key="endSwap" onClick={() => onEndSwap(playerId, cardType)}>Swap it!</li>)
	}
	return menuItems.length === 0 ? undefined : menuItems;
};

const playerCardKey = (playerId, card, cardIdx) => "player-" + playerId + "-" + card + "-" + cardIdx;