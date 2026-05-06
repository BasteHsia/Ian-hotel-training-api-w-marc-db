const pool = require('./config/db');

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const { employee_id } = event.pathParameters || {};

    if (!employee_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "employee_id is required" }),
      };
    }

    const updates = event.body ? JSON.parse(event.body) : {};

    const allowedFields = [
      "guest_id",
      "position",
      "department",
      "hire_date",
      "salary",
      "shift",
      "is_active"
    ];

    const fields = [];
    const values = [];
    let index = 1;

    for (let key in updates) {
      if (!allowedFields.includes(key)) continue;

      fields.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }

    if (fields.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "No valid fields provided for update"
        }),
      };
    }

    const check = await pool.query(
      `SELECT 1 FROM employment_details WHERE employee_id = $1`,
      [employee_id]
    );

    if (check.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Employee not found" }),
      };
    }

    values.push(employee_id);

    const query = `
      UPDATE employment_details
      SET ${fields.join(", ")}
      WHERE employee_id = $${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Employee updated successfully",
        data: result.rows[0]
      }),
    };

  } catch (err) {
    console.error("Error updating employee:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};