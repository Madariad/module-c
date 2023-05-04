const router = require('express')
const {getConcertsAll, getConcertsId, getConcertsSeating, getReservation} = require('../Controller/ConcertController')

const route = router.Router()

route.get('/', getConcertsAll)
route.get('/:id', getConcertsId)
route.get('/:concertId/shows/:showId/seating', getConcertsSeating)
route.post('/:concertId/shows/:showId/reservation', getReservation)



module.exports = route