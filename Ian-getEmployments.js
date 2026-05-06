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
      `SELECT * FROM employment_details ORDER BY hire_date DESC`
    );

    return {
      statusCode: 200,
      headers: corsHeaders, // ✅ FIXED
      body: JSON.stringify({ data: result.rows }),
    };

  } catch (err) {
    console.error("Error fetching employment_details:", err); // 🔥 debug

    return {
      statusCode: 500,
      headers: corsHeaders, // ✅ FIXED
      body: JSON.stringify({ message: err.message }),
    };
  }
};