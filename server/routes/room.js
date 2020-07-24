const express = require("express");
const router = express.Router();
const {Game, Player, sequelize} = require("../models");
const HexMap = require("../models").Map;

/**
 * GET /api/games/<id>/info
 * Yeilds a JSON object describing the game if the id is valid.
 * If the game does not exist, a 404 status is sent.
 */
router.get("/:id/info", function(req, res, next) {
	let id = (req.params.id || "").toLowerCase();
	console.log("Fetching game " + id);
	//try to find this room in the database
	Game.findByPk(id, {include:[Player]}).then(game => {
		//found it
		//add some extra fields for the response
		game.joinCode = game.id;
		res.json(game.toJSON());
	})
	.catch(err => {
		//not found
		res.status(404).send("Game not found");
	});
});

/**
 * GET /api/games/<id>/map
 * Yields a JSON object describing the map's terrain, special objects and
 * player-built structures.
 * @request  nothing special
 * @response  a JSON object with: name, description, robber, pirate,
 *            width, height, tiles, harbors, buildings, roads
 */
router.get("/:id/map", function(req, res, next) {
	let id = (req.params.id || "").toLowerCase();
	console.log("[API/games/id/map] Fetching map for game " + id);
	Game.findByPk(id, {
		attributes: ["structures"],
		include: [{
			model: HexMap,
			attributes: ["name", "description", "map_data"]
		}]
	})
	.then(game => {
		if(game == null) throw new Error("Game not found");
		//found it
		let shape = {
			name: game.Map.name,
			description: game.Map.description,
			built: game.structures,
			robber: -1, //replace with robber's current location
			pirate: -1,
			buildings: {},
			roads: {},
			...(game.Map.map_data)
		};
		for(let i in game.structures) {
			let x = game.structures[i]; //x is for intersection
			if(x.building != null) {
				shape.buildings[i] = x.building;
			}
		}
		res.json(shape);
	})
});

/**
 * POST /api/games/<id>/join
 * If the game exists, and can fit more players, you will be registered to the
 * database.
 * @request   a JSON object with the following fields:
 *   - socket.io: your socket.io client's unique identifier
 * @response  your player data as JSON
 * @error     if game is full, or DNE, you'll get 404
 */
router.post("/:id/join", async function(req, res, next) {
	let id = (req.params.id || "").toLowerCase();
	//this is the transaction that makes operations more atomic
	var t;
	try {
		//try to find this room in the database
		const game = await Game.findByPk(id);
		//handle the case where the game doesn't exist
		if(!game) throw new Error("This game does not exist");
		//otherwise, the game exists...
		//if game can't fit more players, stop
		if(game.num_players >= game.max_players)
			throw new Error("This game is full");
		//begin database transaction
		t = await sequelize.transaction();
		var newPlayer = null;
		//try to see if this person was already in the game
		if(req.session && typeof req.session.player == "number") {
			let oldPlayer = await game.getPlayers({
				where: {id: req.session.player},
				transaction: t
			});
			if(oldPlayer.length == 1) {
				newPlayer = oldPlayer[0];
				await newPlayer.update({
					socket_id: req.body["socket.io"],
					status: Player.STATUS.JOINING,
					turn_order: game.num_players
				}, {transaction: t});
			}
		}
		//if this person was not reconnecting to the game, then create a new Player
		if(newPlayer == null) {
			let pid = game.num_players + 1;
			//add player to game
			newPlayer = await game.createPlayer({
				socket_id: req.body["socket.io"],
				player_id: pid,
				nickname: "Player" + pid,
				color: Player.PLAYER_COLORS[pid % 8],
				status: Player.STATUS.JOINING,
				host: false,
				turn_order: game.num_players
			}, {transaction: t});
			await game.addPlayer(newPlayer, {transaction: t});
		}
		//update the number of players
		await game.increment("num_players", {transaction: t});
		//save changes to database
		t.commit();
		//create session authentication token
		req.session.player = newPlayer.id;
		//then, respond with {player_id: }
		res.json(newPlayer.toJSON());
		//socketio server tells everyone about new player
		newPlayer.info("$NAME is joining");
	}
	catch(err) {
		console.log("Error Joining: ", err);
		if(t) {
			t.rollback();
		}
		res.status(404).send(err.message);
	}
});

router.post("/create", async function(req, res, next) {
	try {
		let host = await sequelize.transaction(async function(t) {
			//generate new ID for game
			let id = await generateJoinCode(t);
			console.log("[API/create] creating game: " + id + " by " + req.body["socket.io"]);
			//store game in the database
			const game = await Game.create({
				id: id,
				status: Game.STATUS.LOBBY,
				status_timestamp: new Date(),
				num_players: 1,
				max_players: 4,
				seed: (Math.random() * 10)|0,
				deck: Game.DECK,
				MapId: 1
			}, {transaction: t});
			//add 1 player, the host, to this game
			const host = await game.createPlayer({
				socket_id: req.body["socket.io"],
				player_id: 1,
				nickname: "Player1",
				color: Player.PLAYER_COLORS[1],
				status: Player.STATUS.JOINING,
				host: true,
				turn_order: 0
			}, {transaction: t});
			return host;
		});
		console.log("[CREATED] the game was created (room.js:112)");
		//if the operation succeeded...
		//create session authentication token
		req.session.player = host.id;
		console.log("[CREATED] host %d with session %j", host.id, req.session);
		//send succesful response with player JSON data
		res.json({...host.toJSON(), join_code: host.GameId});
	} catch(err) {
		//if it failed, send error response
		console.log("[CREATED] Failed to create game: ", err.stack);
		res.status(500).send("");
	}
});

/**
 * Used to create a unique join code for each game.
 * Customize the following constants:
 * DIGITS_TOTAL: the length of each join code.
 * DIGITS_RAND: should be less than DIGITS_TOTAL. It controlls how much influence
 * time, randomness and the number of games have on the outcome. If it is low,
 * time has more influence. If it is high, randomness/numberOfGames will have more
 * influence.
 * @param t  a sequelize transaction
 * @return   string
 */
async function generateJoinCode(t) {
	const numGames = await Game.count({transaction: t});
	const DIGITS_TOTAL = 6;
	const DIGITS_RAND = 3;
	let a = numGames.toString(36).slice(DIGITS_RAND - 1);
	let r = Math.pow(36, DIGITS_RAND - a.length)|0;
	return a + ((Math.random() * r)|0).toString(36) + Date.now().toString(36).slice(DIGITS_RAND - DIGITS_TOTAL);
}

module.exports = router;