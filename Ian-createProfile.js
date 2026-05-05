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

  let client;

  try {
    // ✅ SAFE PARSE
    const body = event.body ? JSON.parse(event.body) : {};

    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      marital_status,
      contact_number,
      profile_type,
      guest_type
    } = body;

    // ✅ validation
    if (
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !gender ||
      !marital_status ||
      !contact_number ||
      !profile_type
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'All fields are required' }),
      };
    }

    client = await pool.connect();

    // ✅ duplicate check
    const existing = await client.query(
      `SELECT 1 FROM profiles 
       WHERE LOWER(first_name) = LOWER($1)
       AND LOWER(last_name) = LOWER($2)
       AND date_of_birth = $3`,
      [first_name, last_name, date_of_birth]
    );

    if (existing.rows.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Profile already exists'
        }),
      };
    }

    await client.query('BEGIN');

    // ✅ insert profile
    const profileResult = await client.query(
      `INSERT INTO profiles
      (first_name, last_name, date_of_birth, gender, marital_status, contact_number, profile_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        marital_status,
        contact_number,
        profile_type
      ]
    );

    const newProfile = profileResult.rows[0];

    // ✅ conditional guest insert
    if (profile_type === 'guest') {
      await client.query(
        `INSERT INTO guests
        (profile_id, guest_type, is_member)
        VALUES ($1, $2, $3)`,
        [
          newProfile.profile_id,
          guest_type || 'reservation holder',
          false
        ]
      );
    }

    await client.query('COMMIT');

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Profile and guest created successfully',
        data: newProfile
      }),
    };

  } catch (err) {
    if (client) await client.query('ROLLBACK');

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };

  } finally {
    if (client) client.release();
  }
};