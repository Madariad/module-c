const mysql = require('mysql')
const colors = require('colors');
const crypto = require('crypto');
const { error } = require('console');
const token = crypto.randomBytes(10).toString('hex')
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

//GENERAL FOR CONCERTS

function getConcertsWithLocationsAndShows(concerts) {
  return concerts.map(concert => {
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
          
          shows.forEach(el => {
            delete  el.concert_id
          });

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
}


//CONCERT ALL

function getConcertsAll(req, res) {
  db.query(`SELECT * FROM concerts`, (error, concerts) => {
    if (error) {
      console.error(error)
      return res.sendStatus(500)
    }

    const concertsWithLocationsAndShows = getConcertsWithLocationsAndShows(concerts)

    Promise.all(concertsWithLocationsAndShows)
      .then(results => res.json({ concerts: results }))
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
  })
}



//CONCERT ID


function getConcertsId(req, res) {
  const id = req.params.id


  db.query(`SELECT * FROM concerts WHERE id = ?`, [id], (error, concerts) => {
    if (error) {
      console.error(error)
    }

    if (concerts == '') {
      res.status(404)
      return res.json({ error: 'A concert with this ID does not exist' })
    }

    const concertsWithLocationsAndShows = getConcertsWithLocationsAndShows(concerts)

    Promise.all(concertsWithLocationsAndShows)
      .then(results => res.json({ concerts: results }))
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
  })
}




// CONCERT SEATING

function getConcertsSeating(req, res)
{

 const {concertId, showId} = req.params

   db.query(`SELECT location_seat_rows.id AS rows_id, location_seat_rows.name AS rows_name, COUNT(location_seats.number) AS total, GROUP_CONCAT(CASE WHEN location_seats.ticket_id IS NOT NULL THEN location_seats.number END) AS unavailable FROM concerts LEFT JOIN shows  ON  concerts.id = shows.concert_id  LEFT JOIN location_seat_rows ON location_seat_rows.show_id = shows.id LEFT JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id LEFT JOIN tickets ON location_seats.ticket_id = tickets.id WHERE concerts.id = ${concertId} AND shows.id = ${showId} GROUP BY location_seat_rows.id`, (error, result) => {
    if (result == '') {
      res.status(404)
      return res.json({error: "A concert or show with this ID does not exist"})
    } else {
      const rows = result.map((row) => ({
        id: row.rows_id,
        name: row.rows_name,
        seats: {
          total: row.total,
          unavailable: row.unavailable,
        }
      }));
  
      res.json({ rows });
    }
   })

}

//  console.log(row, seat);
  // db.query(`INSERT INTO reservations (token, expires_at) VALUES (${reservation_token ? reservation_token : token}, ${duration}) 
  //           INSERT INTO location_seats (reservation_id) VALUES ()
  // `)

//  db.query(`UPDATE reservations SET token = ${reservation_token ? reservation_token : token }, expire_at = ${duration}`)


// reservation

function getReservation(req, res)
{
  const {reservation_token, reservations, duration} = req.body
  console.log(duration, reservation_token);
  const  {row, seat} = reservations[0]

  db.query(`INSERT INTO reservations (token, expires_at)
  SELECT 'asasas', '2020-12-31 23:59:59'
  FROM location_seats
  WHERE location_seat_row_id = 1 AND number = 1`, (error, result) => {
    console.log(result);
  })
  db.query(`UPDATE location_seats SET reservation_id = 1
  WHERE location_seat_row_id = 1 AND number = 1`, (erorr, result) => {
    console.log(result);
  })
  // db.query(`SELECT * FROM location_seats WHERE location_seat_row_id = ${row} AND number = ${seat}`, (error, result) => 
  // {
  //   if (error) throw error

  //   const rows = result.map(row => 






  //     (
         
  //     )
  //   )

  //   console.log(rows);
  // })
  // res.send('success')
}
module.exports = {getConcertsAll, getConcertsId, getConcertsSeating, getReservation}

// INSERT INTO reservations (token, expires_at)
// UPDATE location_seats SET reservatio_id = reservations.id 
// SELECT 'asasas', '2020-12-31 23:59:59'
// FROM location_seats
// WHERE location_seat_row_id = 1 AND number = 1;




// INSERT INTO reservations (token, expires_at)
// SELECT 'asasas', '2020-12-31 23:59:59'
// FROM location_seats
// WHERE location_seat_row_id = 1 AND number = 1;
// UPDATE location_seats SET reservation_id = reservations.id
// WHERE location_seat_row_id = 1 AND number = 1;






















// SELECT location_seat_rows.id, location_seat_rows.name, COUNT(location_seats.number) AS total, GROUP_CONCAT(CASE WHEN location_seats.ticket_id IS NOT NULL THEN location_seats.number END) AS unavailable FROM concerts LEFT JOIN shows ON concerts.id = shows.concert_id  LEFT JOIN location_seat_rows ON location_seat_rows.show_id = shows.id LEFT JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id LEFT JOIN tickets ON location_seats.ticket_id = tickets.id WHERE concerts.id = 1 AND shows.concert_id = concerts.id GROUP BY location_seat_rows.id;