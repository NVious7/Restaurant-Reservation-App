function ValidateReservation(reservation) {
  const date = reservation.reservation_date;
  const time = reservation.reservation_time;
  const errors = [];

  // No reservations on Tuesdays
  const day = new Date(date).getUTCDay();

  if (day === 2) {
    errors.push(new Error("Restaurant is closed on Tuesdays."));
  }

  // Reservation cannot be in the past
  const today = Date.now();
  const newReservationDate = new Date(`${date} ${time}`);
  const compareDate = newReservationDate.valueOf();

  if (today > compareDate) {
    errors.push(new Error("Reservation date must be in the future."));
  }

  // Reservation must be during hours of 10:30AM - 9:30PM
  const hours = newReservationDate.getHours();
  const mins = newReservationDate.getMinutes();
  const compareTime = hours * 100 + mins;

  if (compareTime < 1030 || compareTime >= 2130) {
    errors.push(
      new Error("Reservations must be between 10:30 AM and 9:30 PM.")
    );
  }

  return errors;
}

export default ValidateReservation;
