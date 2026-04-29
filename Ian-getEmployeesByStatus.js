const pool = require('../config/db');

exports.handler = async (event) => {
  const { status } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM employment_details WHERE is_active = $1`,
      [status === 'true']
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No employees found for this status'
        }),
      };
    }

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