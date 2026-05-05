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

    const result = await pool.query(`
      SELECT * FROM guests
      ORDER BY guest_id ASC
    `);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Guests retrieved successfully",
        data: result.rows
      })
    };

  } catch (err) {
    console.error("GET ALL GUESTS ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message })
    };
  }
};