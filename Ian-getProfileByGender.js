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
    const { gender } = event.pathParameters || {};

    // ✅ validation
    if (!gender) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "gender is required" }),
      };
    }

    const result = await pool.query(
      `SELECT * FROM profiles 
       WHERE LOWER(gender::text) = LOWER($1)`,
      [gender]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        count: result.rows.length,
        data: result.rows
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