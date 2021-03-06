import * as _ from "lodash";
import {cardRange} from "./machi-koro";

export const Cards = {
	"pretpark": {
		"category": "yellow",
		"name": "Pretpark",
		"cost": 16,
		"description": "Als je dubbel gooit, ben je direct nog een keer aan de beurt.",
		"symbol": "tower",
		"maxOwnCount": 1,
		"allowAnotherTurnOnDoubleThrow": true
	},
	"treinstation": {
		"cost": 4,
		"name": "Treinstation",
		"category": "yellow",
		"description": "Je mag met twee dobbelstenen gooien.",
		"symbol": "tower",
		"maxOwnCount": 1,
		"canRollWith2Dice": true
	},
	"winkelcentrum": {
		"symbol": "tower",
		"cost": 10,
		"name": "Winkelcentrum",
		"category": "yellow",
		"description": "Verhoog het aantal munten dat je voor je [coffee] en [house] kaarten krijgt met 1.",
		"maxOwnCount": 1,
		"paymentIncreaseBy": 1,
		"paymentIncreaseForSymbols": ["coffee", "house"]
	},
	"radiostation": {
		"cost": 22,
		"category": "yellow",
		"name": "Radiostation",
		"description": "Je mag je dobbelstenen eenmaal per beurt opnieuw gooien.",
		"symbol": "tower",
		"reRoll": true,
		"maxOwnCount": 1
	},
	"graanveld": {
		"symbol": "wheat",
		"roll": "1",
		"description": "Ontvang 1 munt van de bank ongeacht wiens beurt het is.",
		"cost": 1,
		"category": "blue",
		"name": "Graanveld",
		"payout": 1
	},
	"veehouderij": {
		"name": "Veehouderij",
		"category": "blue",
		"cost": 1,
		"description": "Ontvang 1 munt van de bank ongeacht wiens beurt het is.",
		"roll": "2",
		"symbol": "cattle",
		"payout": 1
	},
	"bakkerij": {
		"cost": 1,
		"category": "green",
		"name": "Bakkerij",
		"description": "Ontvang 1 munt van de bank als het jouw beurt is.",
		"roll": "2 - 3",
		"symbol": "house",
		"payout": 1
	},
	"supermarkt": {
		"symbol": "house",
		"roll": "4",
		"description": "Ontvang 1 munt van de bank als het jouw beurt is.",
		"cost": 2,
		"name": "Supermarkt",
		"category": "green",
		"payout": 1
	},
	"groenteenfruitmarkt": {
		"cost": 2,
		"name": "Groente- en fruitmarkt",
		"category": "green",
		"description": "Ontvang 3 munten van de bank voor elke [wheat] kaart die je bezit als het jouw beurt is.",
		"roll": "11 - 12",
		"symbol": "apple",
		"payout": 3,
		"payoutFor": "wheat"
	},
	"cafe": {
		"description": "Ontvang 1 munt van iedere speler die dit getal gooit.",
		"cost": 1,
		"category": "red",
		"name": "Cafe",
		"symbol": "coffee",
		"roll": "3",
		"payout": 1
	},
	"bos": {
		"name": "Bos",
		"category": "blue",
		"cost": 3,
		"description": "Ontvang 1 munt van de bank ongeacht wiens beurt het is.",
		"roll": "5",
		"symbol": "gear",
		"payout": 1
	},
	"meubelfabriek": {
		"cost": 3,
		"category": "green",
		"name": "Meubelfabriek",
		"description": "Ontvang 3 munten van de bank voor elke [gear] kaart die je bezit als het jouw beurt is.",
		"roll": "8",
		"symbol": "factory",
		"payout": 3,
		"payoutFor": "gear"
	},
	"restaurant": {
		"roll": "9 - 10",
		"symbol": "coffee",
		"category": "red",
		"name": "Restaurant",
		"cost": 3,
		"description": "Ontvang 2 munten van iedere speler die dit getal gooit.",
		"payout": 2,
	},
	"appelboomgaard": {
		"symbol": "wheat",
		"roll": "10",
		"description": "Ontvang 3 munten van de bank ongeacht wiens beurt het is.",
		"category": "blue",
		"name": "Appelboomgaard",
		"cost": 3,
		"payout": 3
	},
	"kaasfabriek": {
		"description": "Ontvang 3 munten van de bank voor elke [cattle] kaart die je bezit als het jouw beurt is.",
		"name": "Kaasfabriek",
		"category": "green",
		"cost": 5,
		"symbol": "factory",
		"roll": "7",
		"payout": 3,
		"payoutFor": "cattle"
	},
	"stadion": {
		"roll": "6",
		"symbol": "tower",
		"name": "Stadion",
		"category": "purple",
		"cost": 6,
		"description": "Ontvang 2 munten van iedere speler als het jouw beurt is.",
		"payout": 2,
		"payoutFromEveryone": true,
		"maxOwnCount": 1
	},
	"mijn": {
		"symbol": "gear",
		"roll": "9",
		"description": "Ontvang 5 munten van de bank ongeacht wiens beurt het is.",
		"cost": 6,
		"name": "Mijn",
		"category": "blue",
		"payout": 5
	},
	"tvstation": {
		"roll": "6",
		"symbol": "tower",
		"name": "Tv-Station",
		"category": "purple",
		"cost": 7,
		"description": "Ontvang 6 munten van een speler naar keuze als het jouw beurt is.",
		"payout": 6,
		"collectFromSelectedPlayer": true,
		"maxOwnCount": 1
	},
	"bedrijvencomplex": {
		"cost": 8,
		"category": "purple",
		"name": "Bedrijvencomplex",
		"description": "Je mag een kaart met een speler naar keuze ruilen (geen [tower] kaart) als het jouw beurt is.",
		"roll": "6",
		"symbol": "tower",
		"maxOwnCount": 1,
		"allowSwapping": true,
		"excludedSymbols": ["tower"]
	}
};


export const compareRoll = (cardType1, cardType2) => {
	let card1 = Cards[cardType1];
	let roll1 = card1.roll;
	let card2 = Cards[cardType2];
	let roll2 = card2.roll;

	if (roll1 === roll2) {
		return 0;
	}

	if (_.isUndefined(roll1)) {
		return 1;
	}
	if (_.isUndefined(roll2)) {
		return -1;
	}

	let range1 = cardRange(card1);
	let range2 = cardRange(card2);

	if (range1.min === range2.min) {
		return range1.max === range2.max ? 0 :
			range1.max < range2.max ? -1 : 1;
	}

	return range1.min < range2.min ? -1 : 1;
};

export const compareRollAndCost = (cardType1, cardType2) => {
	let rollCompare = compareRoll(cardType1, cardType2);
	if (rollCompare !== 0) {
		return rollCompare;
	}

	let cost1 = Cards[cardType1].cost;
	let cost2 = Cards[cardType2].cost;

	if (cost1 === cost2) {
		return 0;
	}

	return cost1 < cost2 ? -1 : 1;
};