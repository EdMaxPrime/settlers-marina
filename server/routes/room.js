const express = require("express");
const router = express.Router();
const {Game, Player, Map, sequelize} = require("../models");

/**
 * GET /api/games/<id>/info
 * Yeilds a JSON object describing the game if the id is valid.
 * If the game does not exist, a 404 status is sent.
 */
router.get("/:id/info", function(req, res, next) {
	let id = (req.params.id || "").toLowerCase();
	console.log("Fetching game " + id);
	//try to find this room in the database
	Game.findByPk(id, {include:[Player, Map]}).then(game => {
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
 * PUT /api/games/<id>/join
 * @request You must have a socketio session cookie
 * If the game exists, and can fit more players, you will be registered to the
 * database.
 * @response your player data as JSON
 * @error  if game is full, or DNE, you'll get 404
 */
router.put("/:id/join", async function(req, res, next) {
	let id = (req.params.id || "").toLowerCase();
	//this is the transaction that makes operations more atomic
	var t;
	//try to find this room in the database
	try {
		//found it
		const game = await Game.findByPk(id);
		//if game can't fit more players, stop
		if(game.num_players >= game.max_players)
			throw new Error("This game is full");
		let pid = game.num_players + 1;
		t = await sequelize.transaction();
		//add player to game
		const newPlayer = await Player.create({
			socket_id: req.settlers.id,
			player_id: pid,
			nickname: "Player" + pid,
			color: Player.PLAYER_COLORS[pid],
			status: Player.STATUS.JOINING,
			host: false,
			turn_order: pid
		}, {transaction: t});
		await game.addPlayer(newPlayer, {transaction: t});
		//update the number of players
		game.set("num_players", game.num_players+1);
		await game.save({transaction: t});
		//save changes to database
		t.commit();
		//then, respond with {player_id: }
		res.json(newPlayer.toJSON());
		//socketio server tells everyone about new player
		req.settlers.ns.to(`${game.GameId} players`)
		               .emit("chat", "info", `${newPlayer.nickname} is joining`);
	}
	catch(err) {
		console.log("Error Joining: ", err);
		if(t) {
			t.rollback();
		}
		res.status(404).send("This game doesn't exist");
	}
});

router.post("/new_game", async function(req, res, next) {
	try {
		let host = await sequelize.transaction(async function(t) {
			//generate new ID for game
			let id = await generateJoinCode(t);
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
				socket_id: req.settlers.id,
				player_id: 1,
				nickname: "Player1",
				color: Player.PLAYER_COLORS[1],
				status: Player.STATUS.JOINING,
				host: true,
				turn_order: 1
			}, {transaction: t});
			return host;
		});
		console.log("created game!");
		//if it succeeded, send join code in response
		res.json({...host.toJSON(), join_code: host.GameId});
	} catch(err) {
		//if it failed, send error response
		console.log("Failed to create game: ", err);
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