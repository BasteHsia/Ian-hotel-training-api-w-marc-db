const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  const { profile_id } = event.pathParameters;
  const updates = JSON.parse(event.body);

  try {
    const check = await pool.query(
      `SELECT 1 FROM profiles WHERE profile_id = $1`,
      [profile_id]
    );

    if (check.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Profile not found' }),
      };
    }

    const allowedFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'gender',
      'marital_status',
      'contact_number',
      'profile_type'
    ];

    const fields = [];
    const values = [];
    let index = 1;

    for (let key in updates) {
      if (!allowedFields.includes(key)) continue;

      fields.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }

    if (fields.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No valid fields provided' }),
      };
    }

    const query = `
      UPDATE profiles
      SET ${fields.join(', ')}
      WHERE profile_id = $${index}
      RETURNING *
    `;

    values.push(profile_id);

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile updated successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};