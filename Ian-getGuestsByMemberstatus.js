const pool = require('./config/db');

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
};

exports.handler = async (event) => {

  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const { is_member } = event.pathParameters || {};

    if (is_member === undefined) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "is_member is required" })
      };
    }

    // 🔥 convert string to boolean
    const isMemberBool = is_member === "true";

    const result = await pool.query(
      `SELECT * FROM guests WHERE is_member = $1`,
      [isMemberBool]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Guests filtered by membership",
        data: result.rows
      })
    };

  } catch (err) {
    console.error("GET GUESTS BY MEMBER ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message })
    };
  }
};