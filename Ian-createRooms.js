const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const {
      room_number,
      room_size,
      room_capacity,
      price_per_night,
      room_description
    } = body;

    // 🔴 VALIDATION (no status here)
    if (
      !room_number ||
      !room_size ||
      !room_capacity ||
      !price_per_night
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields"
        })
      };
    }

    // 🔍 CHECK DUPLICATE ROOM NUMBER
    const existingRoom = await pool.query(
      `SELECT * FROM rooms WHERE room_number = $1`,
      [room_number]
    );

    if (existingRoom.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Room number already exists"
        })
      };
    }

    // ✅ AUTO STATUS = 'Available'
    const result = await pool.query(
      `INSERT INTO rooms 
        (room_number, room_size, room_capacity, price_per_night, status, room_description)
       VALUES ($1, $2, $3, $4, 'Available', $5)
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
      body: JSON.stringify({
        message: "Room created successfully",
        data: result.rows[0]
      })
    };

  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message
      })
    };
  }
};