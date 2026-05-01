const pool = require('./config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        g.guest_id,
        SUM(p.payment_amount) AS total_payment
      FROM guests g
      JOIN bookings b ON g.guest_id = b.guest_id
      JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY g.guest_id
      ORDER BY total_payment DESC
      limit 1
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Top paying guests retrieved',
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