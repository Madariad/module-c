const express = require('express')
const colors = require('colors')
const router = require('./Router/Route')
const body_parser = require('body-parser') 
const cors = require('cors')
const PORT = process.env.PORT ?? 4000
const app = express()

let corsOptions = {
    origin :  '*',
}
app.use(express.json())
app.get('/ll', () => {console.log("jjdjjd");})
app.use('/api/v1/concerts', router)
app.use(body_parser)
app.use(cors(corsOptions))
app.listen(PORT, (error) => {
    if (error) {
        
    }else {
        console.log(colors.bgRed.black(`server connenct PORT ${PORT}`))
    }
})

// app.get('/api/v1/concerts/:concertId/shows/:showId/seating', (req, res) => {
//     const concertId = req.params.concertId;
//     const showId = req.params.showId;
  
//     // код обработки запроса
//   });