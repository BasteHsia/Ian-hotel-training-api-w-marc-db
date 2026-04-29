const pool = require('./config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings ORDER BY booking_id'
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};