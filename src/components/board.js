import React from 'react';

import {Card} from './card';
import './board.css';
import * as _ from 'lodash';
import {allowedNumberOfRolls, playerCanRollWith2Dice} from "../game/machi-koro";
import {Cards, compareRollAndCost} from '../game/cards';
import {Dice} from "./dice";
import {DropdownMenu} from "react-dd-menu";

export class Board extends React.Component {

	state = {
		firstToSwap: undefined
	};

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
			&& !_.isNil(props.G.currentTurn.activeCards
				.find(cardType => Cards[cardType].allowSwapping));

		let startSwap = canSwap ? (cardType) => this.startSwap(cardType) : undefined;
		let endSwap = (canSwap && !_.isNil(this.state.firstToSwap)) ? (victim, cardType) => {
			props.moves.swapCards(victim, this.state.firstToSwap, cardType);
			this.setState({...this.state, firstToSwap: undefined});
		} : undefined;

		return (
			<div className="board-container">
				<div className="board-main">
					<Deck deck={props.G.deck} currentPlayer={props.G.players[props.ctx.currentPlayer]} onBuy={buyCard}
						  onStartSwap={startSwap}/>
					<Player name="0" G={props.G} ctx={props.ctx} onBuy={buyCard} onStartSwap={startSwap}
							onEndSwap={endSwap}/>
					<Player name="1" G={props.G} ctx={props.ctx} onBuy={buyCard} onStartSwap={startSwap}
							onEndSwap={endSwap}/>
				</div>
				<div className="board-sidepanel">
					<Palette {...props}/>
				</div>
			</div>
		);
	}
}

const Event = (props) => {
	switch (props.type) {
		case 'coinsTransferred':
			return <div>Player {props.to} received {props.amount} from {_.isNil(props.from) ? 'the bank' : `Player ${props.from}`} ({props.cardType})</div>;
		case 'coinsTransferStopped':
			return <div>Player {props.from} is broke, cannot give coins to {props.to} ({props.cardType})</div>;
		default:
			return <div>Unknown event: {JSON.stringify(props)}</div>;
	}
};

const Palette = (props) => {

	let control = hasControl(props);
	let spectator = isSpectator(props);

	let canRoll1Dice = canRollWithDice(props, 1);
	let canRoll2Dice = canRollWithDice(props, 2);
	let canDistributeCoins = control && props.G.currentTurn.numRolls > 0 && !props.G.currentTurn.hasDistributedCoins;
	let canRestartTurn = control && !_.isNil((props.G.currentTurn.activeCards || []).find(cardType => Cards[cardType].reRoll));
	let canEndTurn = control && props.G.currentTurn.hasDistributedCoins;

	let title = spectator || !control ? 'Player ' + props.ctx.currentPlayer :
		control && !props.isActive ? 'Your turn' : 'Player ' + props.ctx.currentPlayer;

	let currentPlayer = props.G.players[props.ctx.currentPlayer];
	title += ` (Coins: ${currentPlayer.coins})`;

	let rolled = props.G.currentTurn.numRolls === 0 ? '' :
		<div><Dice values={props.G.currentTurn.lastRoll}/></div>;

	let canTakeCoinsFromOnePlayer = control && props.G.currentTurn.hasDistributedCoins && !props.G.currentTurn.hasTakenFromPlayer && !_.isNil((props.G.currentTurn.activeCards || []).find(cardType => Cards[cardType].collectFromSelectedPlayer));
	let canTakeCoinsFromAllPlayers = control && props.G.currentTurn.hasDistributedCoins && !props.G.currentTurn.hasTakenFromAllPlayers && !_.isNil((props.G.currentTurn.activeCards || []).find(cardType => Cards[cardType].payoutFromEveryone));

	return (<div>
		<div className="palette">
			<h3>{title}</h3>
			<div className="actions">
				<div className="action-roll">
					<div>Roll dice</div>
					<div>
						<button disabled={!canRoll1Dice} onClick={() => props.moves.roll(1)}>one dice</button>
						<button disabled={!canRoll2Dice} onClick={() => props.moves.roll(2)}>two dice</button>
					</div>
				</div>
				<div className="action-distribute">
					<div>Distribute</div>
					<button disabled={!canDistributeCoins} onClick={() => props.moves.distributeCoins()}>Distribute coins</button>
				</div>
				<div className="action-swap">
					<div>Swap a card</div>
					<div>TODO</div>
				</div>
				<div className="action-take-coins">
					<div>Take coins from one player</div>
					<div>
						<SelectOpponent players={props.G.players} ctx={props.ctx} onSelected={(playerId) => props.moves.takeCoinsFromPlayer(playerId)} enabled={canTakeCoinsFromOnePlayer}/>
					</div>
				</div>
				<div className="action-take-coins">
					<div>Take coins from everyone</div>
					<div>
						<SelectOpponent players={props.G.players} ctx={props.ctx} onSelected={(playerId) => props.moves.takeCoinsFromAllPlayers(playerId)} enabled={canTakeCoinsFromAllPlayers}/>
					</div>
				</div>
				<div className="action-buy-card">
					<div>Buy a card</div>
					<div>TODO</div>
				</div>
				<div className="action-restart-turn">
					<div>Restart turn</div>
					<div><button disabled={!canRestartTurn} onClick={() => props.moves.restartTurn()}>Restart</button></div>
				</div>
				<div className="action-end-turn">
					<div>End my turn</div>
					<button disabled={!canEndTurn} onClick={() => props.events.endTurn()}>End it</button>
				</div>
			</div>
		</div>

		{rolled}

		<div>{props.G.currentTurn.changeLog.map((event, idx) => <Event
			key={`changelog-entry-${idx}`} {...event}/>)}</div>
	</div>);
};

class SelectOpponent extends React.Component {

	state = {isMenuOpen: false};

	toggle() {
		this.setState({...this.state, isMenuOpen: !this.state.isMenuOpen});
	}

	close() {
		this.setState({...this.state, isMenuOpen: false});
	}

	callback(playerId) {
		this.props.onSelected(playerId);
	}

	render() {
		const menuOptions = {
			isOpen: this.state.isMenuOpen,
			close: () => this.close(),
			toggle: <button disabled={!this.props.enabled} type="button" onClick={() => this.toggle()}>Select an opponent</button>,
			align: 'center',
		};

		return (
			<DropdownMenu {...menuOptions}>
				{this.props.players
					.map((player, id) => ({
						player, id
					}))
					.filter(({id}) => Number(id) !== Number(this.props.ctx.currentPlayer))
					.map(({player, id}) => <li key={`select-opponent-${id}`} onClick={() => this.callback(id)}>Player {id} {this.props.players[id].coins}</li>)}
			</DropdownMenu>
		);
	}
};

const hasControl = (props) => {
	return props.isActive === true || (props.playerID === props.ctx.currentPlayer);
};

const isSpectator = (props) => {
	let playerID = Number(props.playerID);
	return _.isNaN(playerID) || playerID < 0 || playerID >= props.ctx.numPlayers;
};

const canRollWithDice = (props, numberOfDice) => {
	let player = props.G.players[props.ctx.currentPlayer];
	return hasControl(props) && !props.G.currentTurn.hasDistributedCoins && (props.G.currentTurn.numRolls < allowedNumberOfRolls(player))
		&& numberOfDice <= (playerCanRollWith2Dice(player) ? 2 : 1);
};

const Deck = (props) => (
	<div style={{textAlign: 'center'}}>
		<h2>Deck</h2>
		<div
			className="deck">{
			Object.keys(props.deck).filter((key) => props.deck[key] > 0)
				.sort((cardType1, cardType2) => compareRollAndCost(cardType1, cardType2))
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
				player.deck.sort((pc1, pc2) => compareRollAndCost(pc1.card, pc2.card)).map((playerCard, idx) => {
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