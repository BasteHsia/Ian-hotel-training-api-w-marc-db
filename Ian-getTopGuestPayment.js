const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;

  // ✅ handle preflight
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

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
      LIMIT 1
    `);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Top paying guest retrieved",
        data: result.rows
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: err.message
      }),
    };
  }
};