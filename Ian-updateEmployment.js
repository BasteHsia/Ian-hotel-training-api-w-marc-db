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
  const updates = JSON.parse(event.body);

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

    const fields = [];
    const values = [];
    let index = 1;

    for (let key in updates) {
      fields.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }

    if (fields.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No fields provided for update'
        }),
      };
    }

    const query = `
      UPDATE employment_details
      SET ${fields.join(', ')}
      WHERE employee_id = $${index}
      RETURNING *
    `;

    values.push(employee_id);

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Employee updated successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};