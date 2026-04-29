const pool = require('./config/db');

exports.handler = async (event) => {
  const { shift } = event.pathParameters;

  try {
    const result = await pool.query(
      `SELECT * FROM employment_details WHERE shift = $1`,
      [shift]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No employees found for this shift'
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