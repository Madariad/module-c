const router = require('express')
const {getConcertsAll, getConcertsId, getConcertsSeating} = require('../Controller/ConcertController')

const route = router.Router()

route.get('/', getConcertsAll)
route.get('/:id', getConcertsId)
route.get('/:concertId/shows/:paramId/seating', getConcertsSeating)

// route.get('/:id', (req, res) => {
//     console.log(req.params.id);
// })


module.exports = route