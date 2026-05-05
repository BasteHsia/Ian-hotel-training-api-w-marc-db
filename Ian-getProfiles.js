const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {

  const method = event.requestContext?.http?.method;

  // ✅ HANDLE PREFLIGHT
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const result = await pool.query(
      `SELECT * FROM profiles ORDER BY profile_id DESC`
    );

    return {
      statusCode: 200,
      headers: corsHeaders, // ✅ VERY IMPORTANT
      body: JSON.stringify({
        data: result.rows
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders, // ✅ ALSO HERE
      body: JSON.stringify({ message: err.message }),
    };
  }
};