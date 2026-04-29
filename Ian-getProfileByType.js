const pool = require('./config/db');

exports.handler = async (event) => {
  const { profile_type } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM profiles WHERE profile_type = $1`,
      [profile_type]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ data: result.rows }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};