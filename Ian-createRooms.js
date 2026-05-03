const pool = require('./config/db');

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const {
      room_number,
      room_size,
      room_capacity,
      price_per_night,
      room_description
    } = body;

    // ✅ VALIDATION
    if (
      !room_number ||
      !room_size ||
      room_capacity == null ||
      price_per_night == null
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "Missing required fields"
        })
      };
    }

    // 🔍 CHECK IF ROOM NUMBER EXISTS
    const existingRoom = await pool.query(
      `SELECT * FROM rooms WHERE room_number = $1`,
      [room_number]
    );

    if (existingRoom.rows.length > 0) {

      // 🔥 GET LATEST ROOM NUMBER
      const lastRoom = await pool.query(
        `SELECT room_number 
         FROM rooms 
         ORDER BY room_number::int DESC 
         LIMIT 1`
      );

      const latestRoomNumber = lastRoom.rows[0]?.room_number || null;

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "Room already exists",
          latest_room_number: latestRoomNumber,
          suggested_next_room: latestRoomNumber 
            ? String(parseInt(latestRoomNumber) + 1)
            : null
        })
      };
    }

    // ✅ INSERT ROOM (status handled by DB default)
    const result = await pool.query(
      `INSERT INTO rooms 
        (room_number, room_size, room_capacity, price_per_night, room_description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        room_number,
        room_size,
        room_capacity,
        price_per_night,
        room_description || null
      ]
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Room created successfully",
        data: result.rows[0]
      })
    };

  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: err.message
      })
    };
  }
};