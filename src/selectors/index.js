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
function getDefaultTurnOrder(state) { return state.room.order; }
function getTurnIndex(state) { return state.room.turn; }
export function getPhase(state) { return state.room.phase; }

export const getPlayerNames = createSelector(
	[getPlayers],
	function(players) {
		return players.map(player => (player === null)? "?" : player.nickname);
	});
export const filterActivePlayers = createSelector(
	[getPlayers, getDefaultTurnOrder], 
	function(players, order) {
		return order.map(player_id => players[player_id]);
	});
export const filterMyPlayer = createSelector(
	[getPlayers, getSelf],
	function(players, me) {
		return players[me];
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