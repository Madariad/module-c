const mysql = require('mysql')
const colors = require('colors');
const crypto = require('crypto');
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


function getReservation(req, res)
{
  const {reservation_token, reservations, duration} = req.body
  const {concertId, showId} = req.params

  const timestamp = duration > 0 && duration <= 300 ? duration : null
  const reservedToken = reservation_token ? reservation_token : token

  db.query(`SELECT location_seat_rows.id AS rows_id, location_seat_rows.name AS rows_name, location_seats.ticket_id AS ticket, COUNT(location_seats.number) AS total, GROUP_CONCAT(CASE WHEN location_seats.reservation_id IS NOT NULL THEN location_seats.number END) AS unavailable FROM concerts LEFT JOIN shows  ON  concerts.id = shows.concert_id  LEFT JOIN location_seat_rows ON location_seat_rows.show_id = shows.id LEFT JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id LEFT JOIN tickets ON location_seats.ticket_id = tickets.id WHERE concerts.id = ${concertId} AND shows.id = ${showId} GROUP BY location_seat_rows.id, location_seats.ticket_id`, (error, result) => {
    if (error) throw error 
    if (result == '') {
      res.status(404)
      return res.json({error: "A concert or show with this ID does not exist"})
    } else {
      console.log(result);
      const errors = {};
      for (let index = 0; index < reservations.length; index++) {
        const {row, seat} = reservations[index];
        const isSeatValid = result.some(rowInfo => rowInfo.rows_id === row && !rowInfo.unavailable.includes(seat.toString()));
        const isRowValid = result.some(rowInfo => rowInfo.rows_id === row);

        if (!isRowValid) {
          errors[row] = `Row ${row} does not exist or does not belong to the given show`;
        } else if (!isSeatValid) {
          errors[`${row}_${seat}`] = `Seat ${seat} in row ${row} is invalid`;
        } else {
          db.query(`SELECT reservation_id FROM location_seats WHERE location_seat_row_id = ${row} AND number = ${seat}`, (error, result) => {
            if (result.length > 0) {
              errors[`${row}_${seat}`] = `Seat ${seat} in row ${row} is already taken`;
            } else if (timestamp) {
              const now = new Date();
              const reservationTime = new Date(now.getTime() + timestamp * 1000);
              const reservationTimeString = reservationTime.toISOString();
              db.query(`INSERT INTO reservations (token, expires_at) VALUES 
              (${db.escape(reservedToken)}, ${reservationTimeString})`, (error, result) => {
                console.log(result.insertId);
                db.query(`UPDATE location_seats SET reservation_id = ${result.insertId}
                WHERE location_seat_row_id = ${row} AND number = ${seat}`, (error, result) => {
                  console.log(result);
                });
              });
              res.json({reserved: true, reservation_token: reservedToken, reservation_until: reservationTimeString});
            }
          });
        }
      }
      if (Object.keys(errors).length > 0) {
        res.status(400);
        return res.json({ error: 'Validation failed', fields: errors });
      }
    }
  });
}









// // reservation
// function getReservation(req, res)
// {
//   const {reservation_token, reservations, duration} = req.body
//   const {concertId, showId} = req.params

//   const timestempe = duration > 0 && duration <= 300 ? duration :  null 
//   const reservedToken = reservation_token ? reservation_token : token  

//   //  for (let index = 0; index < array.length; index++) {
//   //   const element = array[index];


//   //   db.query(`SELECT location_seats.reservation_id AS reserved_id, location_seats.location_seat_row_id AS row, location_seats.number AS number FROM location_seats WHERE location_seat_row_id = ${row} AND number = ${seat}`, (error, result) => 
//   //   {
//   //     result.map(reserved => (
        
//   //        reserved.reserved_id ? () => {return res.json('error row and show');} : console.log('edddd') 
//   //       ))
//   //   })
    
//   //  }




//   if(reservation_token){
//     db.query(`SELECT token AS tk FROM reservations`, (error, result) => 
//     {
//       if (error) {
//         console.error(error);
//       }
//       for (let index = 0; index < result.length; index++) {
//         const is_token = result[index].tk.trim() == reservation_token.trim();

//         if (is_token) {
//             res.status(403).json({ error: 'Invalid reservation token' });
//             return;                      
//         }
//       }
//     })
//     return
//   }



//   db.query(`SELECT location_seat_rows.id AS rows_id, location_seat_rows.name AS rows_name, COUNT(location_seats.number) AS total, GROUP_CONCAT(CASE WHEN location_seats.ticket_id IS NOT NULL THEN location_seats.number END) AS unavailable FROM concerts LEFT JOIN shows  ON  concerts.id = shows.concert_id  LEFT JOIN location_seat_rows ON location_seat_rows.show_id = shows.id LEFT JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id LEFT JOIN tickets ON location_seats.ticket_id = tickets.id WHERE concerts.id = ${concertId} AND shows.id = ${showId} GROUP BY location_seat_rows.id`, (error, result) => {
//     if (result == '') {
//       res.status(404)
//       return res.json({error: "A concert or show with this ID does not exist"})
//     } else {
//       for (let index = 0; index < reservations.length; index++) {
//         const {row, seat} = reservations[index];
    
//         if (timestempe) {
//           const now = new Date();
//           const reservationTime = new Date(now.getTime() + timestempe * 1000);
//           const reservationTimeString = reservationTime.toISOString();


//           db.query(`INSERT INTO reservations (token, expires_at) VALUES 
//           (${db.escape(reservedToken)}, ${reservationTimeString})`, (error, result) => {
//             console.log(result.insertId);
            
//             db.query(`UPDATE location_seats SET reservation_id = ${result.insertId}
//              WHERE location_seat_row_id = ${row} AND number = ${seat}`, (erorr, result) => {
//              console.log(result);
//             })
//           }) 


//           res.json({reserved: true, reservation_token: reservedToken, reservation_until: reservationTimeString})
        
//       }
//       }
//     }
//   })
// }


module.exports = {getConcertsAll, getConcertsId, getConcertsSeating, getReservation}























// SELECT location_seat_rows.id, location_seat_rows.name, COUNT(location_seats.number) AS total, GROUP_CONCAT(CASE WHEN location_seats.ticket_id IS NOT NULL THEN location_seats.number END) AS unavailable FROM concerts LEFT JOIN shows ON concerts.id = shows.concert_id  LEFT JOIN location_seat_rows ON location_seat_rows.show_id = shows.id LEFT JOIN location_seats ON location_seats.location_seat_row_id = location_seat_rows.id LEFT JOIN tickets ON location_seats.ticket_id = tickets.id WHERE concerts.id = 1 AND shows.concert_id = concerts.id GROUP BY location_seat_rows.id;