const pool = require('./config/db');

exports.handler = async (event) => {
  const { profile_id } = event.pathParameters;

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

    await pool.query(
      `DELETE FROM profiles WHERE profile_id = $1`,
      [profile_id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile deleted successfully'
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};