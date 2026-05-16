const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {

  const method =
    event.requestContext?.http?.method ||
    event.httpMethod;

  // ✅ HANDLE OPTIONS
  if (method === "OPTIONS") {

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };

  }

  try {

    // ✅ BEST SELLING ROOMS BY REVENUE
    const result = await pool.query(`

      SELECT 
        r.room_id,
        r.room_number,
        r.room_description,
        r.room_type,
        r.price_per_night,

        SUM(p.payment_amount)
          AS total_revenue

      FROM rooms r

      JOIN bookings b
        ON r.room_id = b.room_id

      JOIN payments p
        ON b.booking_id = p.booking_id

      GROUP BY 
        r.room_id,
        r.room_number,
        r.room_description,
        r.room_type,
        r.price_per_night

      ORDER BY total_revenue DESC

      LIMIT 3

    `);

    return {

      statusCode: 200,

      headers: corsHeaders,

      body: JSON.stringify({

        message:
          "Best selling rooms by revenue retrieved successfully",

        total_rooms:
          result.rows.length,

        data:
          result.rows

      }),

    };

  } catch (err) {

    console.log(err);

    return {

      statusCode: 500,

      headers: corsHeaders,

      body: JSON.stringify({

        message:
          "Internal server error",

        error:
          err.message

      }),

    };

  }

};