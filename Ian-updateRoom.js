const pool = require('../config/db');

exports.handler = async (event) => {
  const { room_number } = event.pathParameters;
  const fields = JSON.parse(event.body);

  try {
    if (Object.keys(fields).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE rooms
      SET ${setClause}
      WHERE room_number = $${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, room_number]);

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
