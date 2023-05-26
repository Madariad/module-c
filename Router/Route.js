const router = require('express')
const {getConcertsAll, getConcertsId, getConcertsSeating, getReservation} = require('../Controller/ConcertController')
const cors = require('cors')
const route = router.Router()

route.get('/', cors(), getConcertsAll)
route.get('/:id', cors(), getConcertsId)
route.get('/:concertId/shows/:showId/seating', cors(), getConcertsSeating)
route.post('/:concertId/shows/:showId/reservation', cors(), getReservation)



module.exports = route