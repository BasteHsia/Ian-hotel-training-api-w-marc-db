const pool = require('../../config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        r.room_id,
        SUM(p.payment_amount) AS total_revenue
      FROM rooms r
      JOIN bookings b ON r.room_id = b.room_id
      JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY r.room_id
      ORDER BY total_revenue DESC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Best selling rooms by revenue retrieved',
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