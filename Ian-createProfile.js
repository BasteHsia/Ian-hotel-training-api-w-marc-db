const pool = require('../config/db');

exports.handler = async (event) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    marital_status,
    contact_number,
    profile_type,
    guest_type
  } = JSON.parse(event.body);

  const client = await pool.connect();

  try {
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
        body: JSON.stringify({ message: 'All fields are required' }),
      };
    }

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
        body: JSON.stringify({
          message: 'Profile already exists'
        }),
      };
    }

    await client.query('BEGIN');

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
      body: JSON.stringify({
        message: 'Profile and guest created successfully',
        data: newProfile
      }),
    };

  } catch (err) {
    await client.query('ROLLBACK');

    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  } finally {
    client.release();
  }
};