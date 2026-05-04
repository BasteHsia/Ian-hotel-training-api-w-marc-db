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

  // 🔥 HANDLE PREFLIGHT (VERY IMPORTANT)
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    // 🔥 SAFE PARAM EXTRACTION
    const { guest_id } = event.pathParameters || {};

    if (!guest_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "guest_id is required" })
      };
    }

    console.log("Fetching guest:", guest_id);

    const result = await pool.query(
      `SELECT * FROM guests WHERE guest_id = $1`,
      [guest_id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Guest not found" })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Guest retrieved successfully",
        data: result.rows[0]
      })
    };

  } catch (err) {
    console.error("GET GUEST BY ID ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders, // 🔥 CRITICAL FIX
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message
      })
    };
  }
};