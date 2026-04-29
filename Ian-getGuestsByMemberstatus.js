const pool = require('./config/db');

exports.handler = async (event) => {
  const { is_member } = event.pathParameters;

  try {
    const memberStatus = is_member === 'true';

    const result = await pool.query(
      `SELECT * FROM guests WHERE is_member = $1`,
      [memberStatus]
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