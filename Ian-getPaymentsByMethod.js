const pool = require('../config/db');

exports.handler = async (event) => {
  const { method } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM payments WHERE payment_method = $1 ORDER BY payment_date DESC`,
      [method]
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