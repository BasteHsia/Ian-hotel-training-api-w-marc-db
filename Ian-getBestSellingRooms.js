const pool = require('./config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        room_id,
        COUNT(*) AS total_bookings
      FROM bookings
      GROUP BY room_id
      ORDER BY total_bookings DESC
      limit 1
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Best selling rooms retrieved',
        data: result.rows
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};