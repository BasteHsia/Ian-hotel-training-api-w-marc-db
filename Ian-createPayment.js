const pool = require('../config/db');

exports.handler = async (event) => {
  const {
    booking_id,
    payment_amount,
    payment_method,
    payment_type,
    total_discount
  } = JSON.parse(event.body);

  try {
    if (
      !booking_id ||
      !payment_amount ||
      !payment_method ||
      !payment_type ||
      total_discount === undefined
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'All fields are required'
        }),
      };
    }

    const final_amount = payment_amount - total_discount;

    if (total_discount > payment_amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Discount cannot exceed payment amount'
        }),
      };
    }

    if (final_amount < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Final amount cannot be negative'
        }),
      };
    }

    const bookingCheck = await pool.query(
      'SELECT 1 FROM bookings WHERE booking_id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Booking not found'
        }),
      };
    }

    const result = await pool.query(
      `INSERT INTO payments 
       (booking_id, payment_amount, payment_method, payment_type, total_discount, payment_date, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'Paid')
       RETURNING *`,
      [booking_id, final_amount, payment_method, payment_type, total_discount]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Payment created successfully',
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