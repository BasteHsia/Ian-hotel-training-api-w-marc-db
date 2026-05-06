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
    const {
      profile_id,
      hire_date,
      job_title,
      position_level,
      emp_type,
      shift
    } = event.body ? JSON.parse(event.body) : {};

    if (
      !profile_id ||
      !hire_date ||
      !job_title ||
      !position_level ||
      !emp_type ||
      !shift
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    const profileCheck = await pool.query(
      `SELECT profile_type FROM profiles WHERE profile_id = $1`,
      [profile_id]
    );

    if (profileCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Profile not found" }),
      };
    }

    if (profileCheck.rows[0].profile_type !== "employee") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Only employee profiles can be assigned employment details"
        }),
      };
    }

    const existing = await pool.query(
      `SELECT 1 FROM employment_details WHERE profile_id = $1`,
      [profile_id]
    );

    if (existing.rows.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "This profile already has employment details"
        }),
      };
    }

    // ✅ AUTO-GENERATE NEXT EMPLOYEE ID
    const lastEmployee = await pool.query(`
      SELECT employee_id
      FROM employment_details
      WHERE employee_id IS NOT NULL
      ORDER BY CAST(REPLACE(employee_id, 'EMP', '') AS INTEGER) DESC
      LIMIT 1
    `);

    let nextEmployeeId = "EMP001";

    if (lastEmployee.rows.length > 0) {
      const lastNumber = parseInt(
        lastEmployee.rows[0].employee_id.replace("EMP", ""),
        10
      );

      nextEmployeeId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
    }

    const result = await pool.query(
      `INSERT INTO employment_details
      (
        employee_id,
        profile_id,
        hire_date,
        job_title,
        position_level,
        emp_type,
        status,
        shift,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'Probation', $7, true)
      RETURNING *`,
      [
        nextEmployeeId,
        profile_id,
        hire_date,
        job_title,
        position_level,
        emp_type,
        shift
      ]
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Employee created successfully",
        data: result.rows[0]
      }),
    };

  } catch (err) {
    console.error("Error creating employment:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};