const pool = require('./config/db');

exports.handler = async (event) => {
  const { profile_id } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM profiles WHERE profile_id = $1`,
      [profile_id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Profile not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: result.rows[0] }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};