const pool = require('./config/db');

exports.handler = async (event) => {
  const { booking_id } = event.pathParameters;

  try {
    const result = await pool.query(
      'DELETE FROM bookings WHERE booking_id = $1 RETURNING *',
      [booking_id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Booking not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking deleted successfully' }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};