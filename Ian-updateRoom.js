const pool = require('./config/db');

// 🔥 reusable CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

exports.handler = async (event) => {
  try {
    const { room_number } = event.pathParameters || {};
    const fields = event.body ? JSON.parse(event.body) : {};

    // 🔥 VALIDATION
    if (!room_number) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'room_number is required' }),
      };
    }

    if (Object.keys(fields).length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    // 🔥 ALLOWED FIELDS ONLY (IMPORTANT SECURITY)
    const allowedFields = [
      "room_size",
      "room_capacity",
      "price_per_night",
      "room_description",
      "status"
    ];

    const filteredFields = Object.keys(fields)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = fields[key];
        return obj;
      }, {});

    if (Object.keys(filteredFields).length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Invalid fields provided' }),
      };
    }

    const keys = Object.keys(filteredFields);
    const values = Object.values(filteredFields);

    // 🔥 AUTO CAST NUMBERS (optional but useful)
    const processedValues = values.map((val, i) => {
      if (keys[i] === "room_capacity" || keys[i] === "price_per_night") {
        return Number(val);
      }
      return val;
    });

    // 🔥 DYNAMIC SET CLAUSE
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE rooms
      SET ${setClause}
      WHERE room_number = $${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...processedValues, room_number]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Room not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Room updated successfully",
        data: result.rows[0]
      }),
    };

  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: err.message }),
    };
  }
};