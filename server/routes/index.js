const express = require('express')
const router = express.Router()

const gamesRouter = require('./room')

router.use('/games', gamesRouter)

// Error handling
router.use((req, res, next) => {
  const error = new Error("Not Found, Please Check URL!");
  error.status = 404;
  next(error);
})

module.exports = router
