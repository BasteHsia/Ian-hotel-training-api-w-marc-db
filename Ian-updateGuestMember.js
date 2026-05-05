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
    const { guest_id } = event.pathParameters || {};

    if (!guest_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "guest_id is required" }),
      };
    }

    // 🔥 FLEXIBLE INPUT HANDLING
    let is_member;

    // try parsing body safely
    if (event.body) {
      try {
        const parsed = JSON.parse(event.body);
        is_member = parsed.is_member;
      } catch (e) {
        console.log("Body is not JSON");
      }
    }

    // fallback: if frontend sends as string (edge case)
    if (typeof is_member === "string") {
      is_member = is_member === "true";
    }

    // final validation
    if (typeof is_member !== "boolean") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "is_member must be true or false"
        }),
      };
    }

    // 🔍 check if guest exists
    const check = await pool.query(
      `SELECT 1 FROM guests WHERE guest_id = $1`,
      [guest_id]
    );

    if (check.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Guest not found' }),
      };
    }

    // 🔥 update
    const result = await pool.query(
      `UPDATE guests 
       SET is_member = $1
       WHERE guest_id = $2
       RETURNING *`,
      [is_member, guest_id]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Guest membership updated successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    console.error("UPDATE MEMBER ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};