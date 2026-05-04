const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  const {
    profile_id,
    hire_date,
    job_title,
    position_level,
    emp_type,
    shift
  } = JSON.parse(event.body);

  try {
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
        body: JSON.stringify({ message: 'All fields are required' }),
      };
    }

    const profileCheck = await pool.query(
      `SELECT profile_type FROM profiles WHERE profile_id = $1`,
      [profile_id]
    );

    if (profileCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Profile not found' }),
      };
    }

    if (profileCheck.rows[0].profile_type !== 'employee') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Only employee profiles can be assigned employment details'
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
        body: JSON.stringify({
          message: 'This profile already has employment details'
        }),
      };
    }

    const result = await pool.query(
      `INSERT INTO employment_details
      (profile_id, hire_date, job_title, position_level, emp_type, status, shift, is_active)
      VALUES ($1, $2, $3, $4, $5, 'Probation', $6, true)
      RETURNING *`,
      [
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
      body: JSON.stringify({
        message: 'Employee created successfully',
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