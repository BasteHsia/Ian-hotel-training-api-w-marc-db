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
      WITH booking_counts AS (
        SELECT 
          DATE(check_in_date) AS booking_date,
          COUNT(*) AS total_bookings
        FROM bookings
        GROUP BY DATE(check_in_date)
      ),
      max_count AS (
        SELECT MAX(total_bookings) AS highest
        FROM booking_counts
      )
      SELECT *
      FROM booking_counts
      WHERE total_bookings = (SELECT highest FROM max_count)
      ORDER BY booking_date;
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Date with highest number of bookings retrieved',
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