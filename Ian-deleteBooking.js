const pool = require('./config/db');

// ✅ reusable headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {

  const method = event.requestContext?.http?.method;

  // ✅ handle preflight
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    console.log("EVENT:", JSON.stringify(event)); // 🔥 DEBUG

    const booking_id = event.pathParameters?.booking_id;

    if (!booking_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "booking_id is required" }),
      };
    }

    const cleanId = booking_id.trim();

    console.log("DELETE booking:", cleanId);

    const result = await pool.query(
      'DELETE FROM bookings WHERE booking_id = $1 RETURNING *',
      [cleanId]
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
    console.error("DELETE ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message
      }),
    };
  }
};