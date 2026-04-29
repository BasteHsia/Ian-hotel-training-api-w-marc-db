const pool = require('../config/db');

exports.handler = async (event) => {
  const { status } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM payments WHERE status = $1 ORDER BY payment_date DESC`,
      [status]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
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