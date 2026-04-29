const pool = require('./config/db');

exports.handler = async (event) => {
  const { gender } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM profiles 
       WHERE LOWER(gender::text) = LOWER($1)`,
      [gender]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        count: result.rows.length,
        data: result.rows
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};