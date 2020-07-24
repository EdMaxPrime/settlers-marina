import { createSelector } from "reselect";
import * as Status from "../store/utilities";

/*
Naming convention:
  - getX: this function keeps the size and order of the result set the same;
  all it does is access a nested property
  - filterX: this function reduces the size of the result set such that all
  objects have property X
  - sortXbyY: this function sorts the result set X by property Y
  - computeX: this function calculates some derived state
*/

function getSelf(state) { return state.user.playerID; }
function getPlayers(state) { return state.room.players; }
function getTurnIndex(state) { return state.room.turn_now; }
export function getPhase(state) { return state.room.phase; }
export function getAction(state) { return state.action; }
function getPossible(state) { return state.map.possible; }
function getBuildings(state) { return state.map.buildings; }

export const getPlayerNames = createSelector(
	[getPlayers],
	function(players) {
		return players.map(player => (player === null)? "?" : player.nickname);
	});
export const getPlayerColors = createSelector(
	[getPlayers],
	function(players) {
		return players.map(player => (player === null)? "#444" : player.color);
	});
/**
 * A selector function to extract the correct ordering of players from an
 * array of player objects. Returns an array of player_ids, ordered by
 * turn_order.
 */
const getDefaultTurnOrder = createSelector(
	[getPlayers],
	function(players) {
		return players.filter(player => player != null && player.status === "JOINED")
		.sort((p1, p2) => p1.turn_order - p2.turn_order)
		.map(player => player.player_id);
	});
/* Returns an array of player objects that are connected and playing */
export const filterActivePlayers = createSelector(
	[getPlayers, getDefaultTurnOrder], 
	function(players, order) {
		return order.map(player_id => players[player_id]);
	});
/* Returns your player object */
export const filterMyPlayer = createSelector(
	[getPlayers, getSelf],
	function(players, me) {
		return players[me];
	});
/* Returns true if you are a host of the game, false otherwise */
export const amIHost = createSelector(
	[filterMyPlayer],
	function(me) {
		return me != null && me.host;
	});
export const computeTurnNow = createSelector(
	[getDefaultTurnOrder, getTurnIndex],
	function(turns, index) {
		return turns[index];
	});
export const filterCurrentPlayer = createSelector(
	[getPlayers, computeTurnNow],
	function(players, index) {
		return players[index];
	});
/* Returns true if it is your turn, false otherwise */
export const amIPlaying = createSelector(
	[filterCurrentPlayer, filterMyPlayer],
	function(c, me) {
		return c == me;
	});
/* Returns an array of possible targets for the current action, could be empty*/
export const filterPossibilities = createSelector(
	[getAction, getPossible],
	function(action, possible) {
		return (action === null)? [] : possible[action];
	});
/* Returns an array of settlements: {color, intersection}*/
export const filterSettlements = createSelector(
	[getBuildings, getPlayerColors],
	function(b, c) {
		var result = [];
		for(let intersection in b) {
			result.push({
				intersection: parseInt(intersection), 
				color: c[ b[intersection][0] ]
			});
		}
		return result;
	});