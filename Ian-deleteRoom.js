const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {

  const method = event.requestContext?.http?.method;

  // 🔥 HANDLE PREFLIGHT
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    // 🔥 IMPORTANT — GET PARAM FIRST
    const { room_number } = event.pathParameters || {};

    if (!room_number) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "room_number is required" })
      };
    }

    // 🔥 CLEAN VALUE
    const cleanRoomNumber = String(room_number);

    const result = await pool.query(
      'DELETE FROM rooms WHERE room_number = $1 RETURNING *',
      [cleanRoomNumber]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Room not found' })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Room deleted successfully',
        data: result.rows[0]
      })
    };

  } catch (err) {
    console.error("DELETE ROOM ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message })
    };
  }
};