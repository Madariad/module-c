const mysql = require('mysql')
const colors = require('colors');
// const { query } = require('express');
const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'node'
    })
db.connect(() => {
    console.log( colors.bgCyan.blue('database connected'));
})
function getConcertsAll(req, res) {
    db.query(`SELECT * FROM concerts`, (error, concerts) => {
      if (error) {
        console.error(error)
        return res.sendStatus(500)
      }
  
      const concertsWithLocationsAndShows = concerts.map(concert => {
        const { id, artist, location_id } = concert
  
        return new Promise((resolve, reject) => {
          db.query(`SELECT * FROM locations WHERE id = ?`, [location_id], (error, locations) => {
            if (error) {
              reject(error)
              return
            }
  
            db.query(`SELECT * FROM shows WHERE concert_id = ?`, [id], (error, shows) => {
              if (error) {
                reject(error)
                return
              }
  
              resolve({
                id,
                artist,
                location: locations[0],
                shows
              })
            })
          })
        })
      })
  
      Promise.all(concertsWithLocationsAndShows)
        .then(results => res.json({ concerts: results }))
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
    })
  } 


function getConcertsId(req, res) {
    const id = req.params.id
 
    db.query(`SELECT * FROM concerts WHERE id = ?`, [id] ,(error, concerts) => {
      if (error) {
        console.error(error)
       
      }

      if (concerts == '') {
        res.status(404)
         return res.json({error: 'A concert with this ID does not exist'})           
       
      }

      const concertsWithLocationsAndShows = concerts.map(concert => {
        const { id, artist, location_id } = concert
  
        return new Promise((resolve, reject) => {
          db.query(`SELECT * FROM locations WHERE id = ?`, [location_id], (error, locations) => {
            if (error) {
              reject(error)
              return
            }
  
            db.query(`SELECT * FROM shows WHERE concert_id = ?`, [id], (error, shows) => {
              if (error) {
                reject(error)
                return
              }
  
              resolve({
                id,
                artist,
                location: locations[0],
                shows
              })
            })
          })
        })
      })
  
      Promise.all(concertsWithLocationsAndShows)
        .then(results => res.json({ concerts: results }))
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
    })
  } 








function getConcertsSeating(req, res){
  const concertId = req.params.concertId
  const showId = req.params.showId

 db.query(`
 SELECT 
     location_seat_rows.id AS id,
     location_seat_rows.name AS name,
     COUNT(*) AS total,
     GROUP_CONCAT(
         CASE 
             WHEN location_seats.id NOT IN (
                 SELECT ticket_seat_id 
                 FROM tickets 
                 WHERE tickets.show_id = 1
             ) THEN location_seats.id 
         END
     ) AS unavailable 
 FROM location_seat_rows 
 JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id 
 GROUP BY location_seat_rows.id 
`, (error, results, fields) => {
 if (error) throw error;
 const rows = results.map(row => ({
     id: row.id,
     name: row.name,
     seats: {
         total: row.total,
         unavailable: row.unavailable ? row.unavailable.split(',').map(id => parseInt(id)) : []
     }
 }));
//  res.json(rows)
 console.log(JSON.stringify({ rows }));
});

  // db.query(`SELECT * FROM concerts WHERE id = ?`, [concertId] ,(error, concerts) => {
  //   if (error) {
  //     console.error(error)
     
  //   }

  //   if (concerts == '') {
  //     res.status(404)
  //      return res.json({error: 'A concert with this ID does not exist'})           
     
  //   }

  //   const concertsWithLocationsAndShows = concerts.map(concert => {
  //     const { id, artist, location_id } = concert

  //     return new Promise((resolve, reject) => {

  //         db.query(`SELECT * FROM shows WHERE concert_id = ?`, [showId], (error, shows) => {
  //           if (error) {
  //             reject(error)
  //             return
  //           }


  //           db.query(`SELECT * FROM location_seat_rows LEFT JOIN shows ON shows.id = location_seat_rows.show_id`, (err, result) => {
  //             res.json(result)
  //             // console.log(res);
  //           })
            
  //           // const showWithLocationSeat = shows.map(show => {
  //           // return  {id} = show
  //           // })   
            









            
            // db.query(`SELECT * FROM location_seat_rows WHERE show_id = ?`, [idi], (error, rows) => {
            //   if (error) {
            //     reject(error)
            //     return
            //   }
        
              //const rowId = 

              // db.query(`SELECT * FROM location_seats LEFT JOIN location_seat_rows ON location_seats.id = location_seat_row_id`, (error, seats) => {
              //       console.log(seats[0]);
              // })


              // resolve({
              //    rows
              // })              
      //       }) 
            
            

      //     })
      //   })
      // })

    //   Promise.all(concertsWithLocationsAndShows)
    //   .then(results => res.json(results ))
    //   .catch(error => {
    //     console.error(error)
    //     res.sendStatus(500)
    //   })
      
    // })

    
  }

module.exports = {getConcertsAll, getConcertsId, getConcertsSeating}


  












 //  const locarionsAll =  db.query(`SELECT  locations.* FROM concerts LEFT JOIN locations ON concerts.location_id = locations.id`)
    

 

//    return  res.json({
//                 concerts: consertsAll,
//                 location: locarionsAll
                
//             })




    // db.query(`SELECT concerts.*, locations.* FROM concerts LEFT JOIN locations ON concerts.location_id = locations.id`, function (err, result, fields) {
    //     if (err) {
    //     //   console.log(err);
    //     } 
    //    return   console.log(result)
    //     //res.status(200)
    //     // return res.json({
    //     //     concerts: result,
    //     //     // location: locations
            
    //     // })
    //   });
// } 

 

// export const getConcerts = (req, res) =>  {
//     res.json(db.query(`SELECT * FROM concerts`))
// } 
