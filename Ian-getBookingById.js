const pool = require('../config/db');

exports.handler = async (event) => {
  const { booking_id } = event.pathParameters;

  try {
    const result = await pool.query(
      `
      SELECT 
        g.guest_id,
        CONCAT(p.first_name, ' ', p.last_name) AS guest_name,
        r.room_number,
        r.price_per_night,
        b.check_in_date,
        b.check_out_date,
        (b.check_out_date - b.check_in_date) AS total_nights,
        pay.payment_amount,
        pay.payment_type

      FROM bookings b
      JOIN guests g ON b.guest_id = g.guest_id
      JOIN profiles p ON g.profile_id = p.profile_id
      JOIN rooms r ON b.room_id = r.room_id

      LEFT JOIN LATERAL (
        SELECT payment_amount, payment_type
        FROM payments
        WHERE booking_id = b.booking_id
        ORDER BY payment_date DESC
        LIMIT 1
      ) pay ON true

      WHERE b.booking_id = $1
      `,
      [booking_id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Booking not found' }),
      };
    }

    const data = result.rows[0];

    const total_price = data.total_nights * data.price_per_night;

    const payment_status =
      data.payment_amount >= total_price
        ? 'Fully Paid'
        : data.payment_amount > 0
        ? 'Partially Paid'
        : 'Unpaid';

    const formatDate = (date) =>
      new Date(date).toISOString().split('T')[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        guest_id: data.guest_id,
        guest_name: data.guest_name,
        room_number: data.room_number,
        check_in_date: formatDate(data.check_in_date),
        check_out_date: formatDate(data.check_out_date),
        total_nights: data.total_nights,
        price_per_night: data.price_per_night,
        total_price,
        payment_type: data.payment_type || 'No payment',
        payment_status
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};