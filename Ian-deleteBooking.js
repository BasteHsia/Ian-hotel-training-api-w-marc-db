const pool = require('./config/db');

exports.handler = async (event) => {

  // ✅ HANDLE CORS PREFLIGHT
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: ""
    };
  }

  // ⚠️ IMPORTANT: match API Gateway param
  const { id } = event.pathParameters; // <-- change here

  try {
    const result = await pool.query(
      'DELETE FROM bookings WHERE booking_id = $1 RETURNING *',
      [id] // <-- change here
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Booking not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Booking deleted successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

// 🔥 reusable headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};