const pool = require('../config/db');

exports.handler = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM guests ORDER BY guest_id DESC`
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