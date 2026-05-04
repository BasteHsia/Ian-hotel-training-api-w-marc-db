const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(payment_date) AS date,
        SUM(payment_amount) AS total_revenue
      FROM payments
      GROUP BY DATE(payment_date)
      ORDER BY total_revenue DESC
      limit 2
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Top revenue dates retrieved',
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