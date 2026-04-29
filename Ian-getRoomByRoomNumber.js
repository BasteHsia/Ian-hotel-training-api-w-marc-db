const pool = require('./config/db');

exports.handler = async (event) => {
  const { room_number } = event.pathParameters;

  try {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE room_number = $1',
      [room_number]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Room not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};