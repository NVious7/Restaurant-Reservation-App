const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasValidProperties = require("../errors/hasValidProperties");

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "reservation_id",
];

function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = Date.parse(reservation_date);

  if (date && date > 0) {
    return next();
  } else {
    return next({
      status: 400,
      message: `reservation_date field is invalid: ${reservation_date}.`,
    });
  }
}

function timeIsValid(req, res, next) {
  const { reservation_time } = req.body.data;
  const regex = new RegExp("([01]?[0-9]|2[0-3]):[0-5][0-9]");

  if (regex.test(reservation_time)) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_time is invalid: ${reservation_time}.`,
  });
}

function peopleIsValidNumber(req, res, next) {
  const { people } = req.body.data;
  const valid = Number.isInteger(people);

  if (valid && people > 0) {
    return next();
  }
  next({
    status: 400,
    message: `people is not a valid number ${people}.`,
  });
}

function notTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = new Date(reservation_date);
  const day = date.getUTCDay();

  if (day !== 2) {
    return next();
  }
  next({
    status: 400,
    message: "The restaurant is closed on Tuesday.",
  });
}

function notPastDate(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;

  const currDate = Date.now();
  const reservationDate = new Date(`${reservation_date} ${reservation_time}`);
  const newResDate = reservationDate.valueOf();

  if (isNaN(Date.parse(reservation_date))) {
    return next({
      status: 400,
      message: "reservation_date is invalid",
    });
  }
  if (newResDate < currDate) {
    return next({
      status: 400,
      message: "New reservations must be in the future.",
    });
  }
  next();
}

function duringOperationHours(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const reservationDate = new Date(`${reservation_date} ${reservation_time}`);

  const hours = reservationDate.getHours();
  const mins = reservationDate.getMinutes();

  const compareTime = hours * 100 + mins;
  if (compareTime >= 1030 && compareTime < 2130) {
    return next();
  }
  next({
    status: 400,
    message: "Reservations must be between 10:30 AM and 9:30 PM.",
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const rid = Number.parseInt(reservation_id);

  if (rid) {
    const reservation = await service.read(rid);

    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    }
  }
  return next({
    status: 404,
    message: `reservation_id: ${reservation_id} does not exist.`,
  });
}

function statusIsValid(req, res, next) {
  const { status } = req.body.data;

  if (status) {
    const validStatus = ["booked", "seated", "finished", "cancelled"];

    if (validStatus.includes(status)) {
      res.locals.status = status;
      return next();
    }
    return next({
      status: 400,
      message: `invalid status ${status}.`,
    });
  } else {
    res.locals.status = "booked";
    return next();
  }
}

function statusIsNotFinished(req, res, next) {
  const status = res.locals.reservation.status;
  if (status === "finished") {
    return next({
      status: 400,
      message: `A finished reservation cannot be updated. ${status}`,
    });
  }

  return next();
}

function statusIsBooked(req, res, next) {
  const { status } = req.body.data;

  if (status && status !== "booked") {
    return next({
      status: 400,
      message: `Status must be set to booked when creating a new reservation. Status: ${status}`,
    });
  }
  return next();
}

async function list(req, res) {
  const { date } = req.query;
  const { mobile_number } = req.query;

  if (date) {
    const data = await service.listByDate(date);
    res.json({ data });
  } else if (mobile_number) {
    const data = await service.search(mobile_number);
    res.json({ data });
  } else {
    const data = await service.list();
    res.json({ data });
  }
}

async function create(req, res) {
  const newReservation = req.body.data;

  if (!newReservation.status) {
    newReservation.status = "booked";
  }

  const data = await service.create(newReservation);
  res.status(201).json({ data: data });
}

async function read(req, res) {
  const reservation = res.locals.reservation;
  res.status(200).json({ data: reservation });
}

async function updateStatus(req, res) {
  const { status } = res.locals;
  const { reservation_id } = res.locals.reservation;

  const updatedRes = await service.updateStatus(reservation_id, status);
  res.status(200).json({ data: updatedRes });
}

async function update(req, res) {
  const reservation = req.body.data;

  const updatedReservation = {
    ...reservation,
    reservation_id: reservation.reservation_id,
  };
  const data = await service.update(updatedReservation);
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProperties(...REQUIRED_PROPERTIES),
    hasValidProperties(...VALID_PROPERTIES),
    dateIsValid,
    timeIsValid,
    peopleIsValidNumber,
    notTuesday,
    notPastDate,
    duringOperationHours,
    statusIsBooked,
    asyncErrorBoundary(create),
  ],
  read: [reservationExists, asyncErrorBoundary(read)],
  updateStatus: [
    reservationExists,
    statusIsValid,
    statusIsNotFinished,
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    hasProperties(...REQUIRED_PROPERTIES),
    hasValidProperties(...VALID_PROPERTIES),
    dateIsValid,
    timeIsValid,
    peopleIsValidNumber,
    reservationExists,
    statusIsValid,
    asyncErrorBoundary(update),
  ],
};
