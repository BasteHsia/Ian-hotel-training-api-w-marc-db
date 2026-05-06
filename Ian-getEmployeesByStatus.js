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
    const { status } = event.pathParameters || {};

    if (!status) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "status is required" }),
      };
    }

    // 🔥 safer boolean parsing
    const isActive =
      status.toLowerCase() === "true" ||
      status === "1";

    const result = await pool.query(
      `SELECT * FROM employment_details WHERE is_active = $1`,
      [isActive]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'No employees found for this status'
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ data: result.rows }),
    };

  } catch (err) {
    console.error("Error filtering employees:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};