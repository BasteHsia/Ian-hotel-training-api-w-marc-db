const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  const { employee_id } = event.pathParameters;

  try {
    const check = await pool.query(
      `SELECT 1 FROM employment_details WHERE employee_id = $1`,
      [employee_id]
    );

    if (check.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Employee not found' }),
      };
    }

    await pool.query(
      `DELETE FROM employment_details WHERE employee_id = $1`,
      [employee_id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Employee deleted successfully'
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};