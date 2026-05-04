const pool = require('./config/db');

// 🔥 FULL OPEN CORS
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

exports.handler = async (event) => {
  try {
    let body = {};

    // 🔥 SAFE PARSER
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        body = Object.fromEntries(
          event.body.split("&").map(pair => {
            const [key, value] = pair.split("=");
            return [
              decodeURIComponent(key || ""),
              decodeURIComponent(value || "")
            ];
          })
        );
      }
    }

    const {
      room_number,
      room_size,
      room_capacity,
      price_per_night,
      room_description
    } = body;

    // 🔥 VALIDATION
    if (
      !room_number ||
      !room_size ||
      room_capacity === undefined ||
      price_per_night === undefined
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Missing required fields"
        })
      };
    }

    const capacity = Number(room_capacity);
    const price = Number(price_per_night);

    // 🔍 CHECK EXISTING
    const existingRoom = await pool.query(
      `SELECT 1 FROM rooms WHERE room_number = $1`,
      [room_number]
    );

    if (existingRoom.rows.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Room already exists"
        })
      };
    }

    // 🔥 AUTO GENERATE room_id (CODE LEVEL)
    const lastIdResult = await pool.query(
      `SELECT room_id FROM rooms ORDER BY room_id DESC LIMIT 1`
    );

    let newRoomId = 1;

    if (lastIdResult.rows.length > 0) {
      newRoomId = lastIdResult.rows[0].room_id + 1;
    }

    // 🔥 INSERT WITH GENERATED ID
    const result = await pool.query(
      `INSERT INTO rooms 
        (room_id, room_number, room_size, room_capacity, price_per_night, room_description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        newRoomId,
        room_number,
        room_size,
        capacity,
        price,
        room_description || null,
        "available"
      ]
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Room created successfully",
        data: result.rows[0]
      })
    };

  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: err.message
      })
    };
  }
};