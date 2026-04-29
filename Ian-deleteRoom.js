const pool = require('./config/db');

exports.handler = async (event) => {
  const { room_number } = event.pathParameters;

  try {
    const result = await pool.query(
      'DELETE FROM rooms WHERE room_number = $1 RETURNING *',
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
      body: JSON.stringify({ message: 'Room deleted successfully' }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};