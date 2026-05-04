const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  try {
    const { room_number } = event.pathParameters || {};

    if (!room_number) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "room_number is required" }),
      };
    }

    const result = await pool.query(
      'SELECT * FROM rooms WHERE room_number = $1',
      [room_number]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Room not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.rows[0]),
    };

  } catch (err) {
    console.error("GET ROOM ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};