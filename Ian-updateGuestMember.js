const pool = require('./config/db');

exports.handler = async (event) => {
  const { guest_id } = event.pathParameters;
  const { is_member } = JSON.parse(event.body);

  try {
    if (typeof is_member !== 'boolean') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'is_member must be true or false'
        }),
      };
    }

    const check = await pool.query(
      `SELECT 1 FROM guests WHERE guest_id = $1`,
      [guest_id]
    );

    if (check.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Guest not found' }),
      };
    }

    const result = await pool.query(
      `UPDATE guests 
       SET is_member = $1
       WHERE guest_id = $2
       RETURNING *`,
      [is_member, guest_id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Guest membership updated successfully',
        data: result.rows[0]
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};