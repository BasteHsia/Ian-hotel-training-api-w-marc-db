const pool = require('./config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        b.room_id,
        SUM(p.payment_amount) AS total_revenue
      FROM bookings b
      JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY b.room_id
      ORDER BY total_revenue DESC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Rooms with highest revenue retrieved',
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