const express = require("express");
const router = express.Router();

router.get("/game_info", function(req, res, next) {
	let id = (req.params.id || "").toUpperCase();
	//try to find this room in the database
	if(id == "42AA") {
		res.json({
			joinCode: id,
			status: "CREATED",
			num_players: 0,
			max_players: 6,
			map: "hexagon",
			seed: 1,
			map_data: "",
			longest_road: null,
			largest_army: null
		});
	}
	//if not found, send a HTTP 404 error code 
	else {
		res.status(404);
	}
});

router.post("/new_game", function(req, res, next) {
	//generate new ID for game
	let id = generateJoinCode();
	//store it in the database
	//if it succeeded, send join code in response
	//if it failed, send error response
	res.status(500);
});

module.exports = router;