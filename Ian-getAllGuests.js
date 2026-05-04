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
    const result = await pool.query(
      `SELECT * FROM guests ORDER BY guest_id DESC`
    );

    return {
      statusCode: 200,
      headers: corsHeaders, // 🔥 IMPORTANT
      body: JSON.stringify({
        count: result.rows.length,
        data: result.rows
      }),
    };

  } catch (err) {
    console.error("GET GUESTS ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders, // 🔥 IMPORTANT
      body: JSON.stringify({ message: err.message }),
    };
  }
};