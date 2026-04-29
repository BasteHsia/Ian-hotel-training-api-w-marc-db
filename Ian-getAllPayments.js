const pool = require('../config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM payments ORDER BY payment_date DESC`
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