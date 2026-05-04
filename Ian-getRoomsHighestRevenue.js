const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

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
      limit 1
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