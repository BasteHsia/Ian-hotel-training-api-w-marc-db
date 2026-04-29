const pool = require('../config/db');

exports.handler = async (event) => {
  const {
    room_number,
    guest_id,
    check_in_date,
    check_out_date,
    number_of_guests
  } = JSON.parse(event.body);

  try {
    if (!room_number || !guest_id || !check_in_date || !check_out_date || !number_of_guests) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    if (new Date(check_in_date) >= new Date(check_out_date)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Check-out date must be after check-in date"
        }),
      };
    }

    const roomResult = await pool.query(
      'SELECT room_id FROM rooms WHERE room_number = $1',
      [room_number]
    );

    if (roomResult.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Room does not exist' }),
      };
    }

    const room_id = roomResult.rows[0].room_id;

    const guestCheck = await pool.query(
      'SELECT 1 FROM guests WHERE guest_id = $1',
      [guest_id]
    );

    if (guestCheck.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Guest not found' }),
      };
    }

    const overlapCheck = await pool.query(
      `SELECT 1 FROM bookings
       WHERE room_id = $1
       AND status = 'confirmed'
       AND (
         DATE(check_in_date) < DATE($3)
         AND DATE(check_out_date) > DATE($2)
       )`,
      [room_id, check_in_date, check_out_date]
    );

    if (overlapCheck.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Room already booked for selected dates'
        }),
      };
    }

    const bookingIdResult = await pool.query(`SELECT COUNT(*) FROM bookings`);
    const count = parseInt(bookingIdResult.rows[0].count) + 1;
    const booking_id = `BOOKINGID-${String(count).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO bookings 
       (booking_id, room_id, guest_id, check_in_date, check_out_date, number_of_guests)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_id, room_id, guest_id, check_in_date, check_out_date, number_of_guests]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Booking created successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};