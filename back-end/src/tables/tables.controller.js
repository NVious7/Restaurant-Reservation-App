const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasValidProperties = require("../errors/hasValidProperties");
const reservationService = require("../reservations/reservations.service");

const VALID_PROPERTIES_TABLE = ["table_name", "capacity"];

const VALID_PROPERTIES_RES = ["reservation_id"];

async function tableExists(req, res, next) {
  const table_id = req.params.table_id;
  const data = await service.read(table_id);
  if (data) {
    res.locals.table = data;
    return next();
  }
  return next({
    status: 404,
    message: `Table: ${table_id} does not exist.`,
  });
}

function nameIsValid(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    return next({
      status: 400,
      message: "Invalid table_name",
    });
  }
  return next();
}

function capacityIsValid(req, res, next) {
  const { capacity } = req.body.data;
  if (
    !capacity ||
    capacity < 1 ||
    isNaN(capacity) ||
    !Number.isInteger(capacity)
  ) {
    return next({
      status: 400,
      message: "Invalid capacity",
    });
  }
  return next();
}

function hasSufficientCapacity(req, res, next) {
  const capacity = res.locals.table.capacity;
  const people = res.locals.reservation.people;

  if (capacity < people) {
    return next({
      status: 400,
      message: "Table does not have sufficient capacity.",
    });
  }
  return next();
}

function tableisOccupied(req, res, next) {
  const occupied = res.locals.table.occupied;
  if (occupied) {
    return next({
      status: 400,
      message: "Table is occupied.",
    });
  }
  return next();
}

function tableisNotOccupied(req, res, next) {
  const occupied = res.locals.table.occupied;
  if (!occupied) {
    return next({
      status: 400,
      message: "Table is not occupied.",
    });
  }
  return next();
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const rid = Number.parseInt(reservation_id);

  if (rid) {
    const reservation = await reservationService.read(reservation_id);

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

function tableIsSeated(req, res, next) {
  const seated = res.locals.reservation.status;
  if (seated === "seated") {
    return next({
      status: 400,
      message: "Table is already seated.",
    });
  }
  return next();
}

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function create(req, res) {
  const newTable = req.body.data;

  if (newTable.reservation_id) {
    newTable.occupied = true;
  } else {
    newTable.occupied = false;
  }
  const data = await service.create(newTable);
  res.status(201).json({ data });
}

async function update(req, res) {
  const { table } = res.locals;
  const { reservation_id } = res.locals.reservation;
  const { table_id } = req.params;

  const updatedTable = {
    ...table,
    table_id: table_id,
    reservation_id: reservation_id,
    occupied: true,
  };

  const data = await service.update(updatedTable);

  const updatedReservation = {
    status: "seated",
    reservation_id: reservation_id,
  };
  await reservationService.update(updatedReservation);

  res.status(200).json({ data });
}

async function finish(req, res) {
  const table = res.locals.table;
  const table_id = req.params.table_id;
  const res_id = res.locals.table.reservation_id;

  const updatedTable = {
    ...table,
    reservation_id: null,
    occupied: false,
  };
  const data = await service.finish(updatedTable, res_id);

  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProperties(...VALID_PROPERTIES_TABLE),
    hasValidProperties(...VALID_PROPERTIES_TABLE),
    nameIsValid,
    capacityIsValid,
    asyncErrorBoundary(create),
  ],
  update: [
    hasProperties(...VALID_PROPERTIES_RES),
    hasValidProperties(...VALID_PROPERTIES_RES),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    hasSufficientCapacity,
    tableisOccupied,
    tableIsSeated,
    asyncErrorBoundary(update),
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    tableisNotOccupied,
    asyncErrorBoundary(finish),
  ],
};
