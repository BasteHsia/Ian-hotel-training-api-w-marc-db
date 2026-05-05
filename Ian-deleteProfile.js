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

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  const client = await pool.connect();

  try {
    const { profile_id } = event.pathParameters || {};

    if (!profile_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'profile_id is required' }),
      };
    }

    await client.query('BEGIN');

    // ✅ DELETE FROM CHILD FIRST
    await client.query(
      `DELETE FROM guests WHERE profile_id = $1`,
      [profile_id]
    );

    // ✅ THEN DELETE PROFILE
    const result = await client.query(
      `DELETE FROM profiles WHERE profile_id = $1 RETURNING *`,
      [profile_id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Profile not found' }),
      };
    }

    await client.query('COMMIT');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Profile and related guest deleted successfully'
      }),
    };

  } catch (err) {
    await client.query('ROLLBACK');

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };

  } finally {
    client.release();
  }
};