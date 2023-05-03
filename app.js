const express = require('express')
const colors = require('colors')
const router = require('./Router/Route')
const PORT = process.env.PORT ?? 4000
const app = express()


// app.use(express.json())

app.use('/api/v1/concerts', router)
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