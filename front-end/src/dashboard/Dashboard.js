import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../utils/api";
import { previous, next, today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import { Link } from "react-router-dom";
import TableList from "../tables/TableList";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../reservations/ReservationList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const dateQuery = useQuery().get("date");
  if (dateQuery) {
    date = dateQuery;
  }

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsErrors, setReservationsErrors] = useState([]);

  const dateObj = new Date(`${date} PDT`);
  const dateString = dateObj.toDateString();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsErrors);

    listTables().then(setTables).catch(setReservationsErrors);

    return () => abortController.abort();
  }

  async function finishHandler(table_id) {
    const abortController = new AbortController();
    const result = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );

    if (result) {
      await finishTable(table_id, abortController.signal);
      loadDashboard();
    }

    return () => abortController.abort();
  }

  return (
    <main>
      <ErrorAlert errors={reservationsErrors} />
      <div className="my-3 border-primary text-center">
        <h3 className="text-white bg-primary py-2">Dashboard</h3>
        <div>
          <h4>Reservations for: {dateString}</h4>
          <Link to={`/dashboard?date=${previous(date)}`}>
            <button
              type="button"
              className="mob-table btn btn-primary btn-sm m-2"
            >
              ⬅️ Previous
            </button>
          </Link>
          <Link to={`/dashboard?date=${today()}`}>
            <button type="button" className="btn btn-primary btn-sm m-2">
              📅 Today
            </button>
          </Link>
          <Link to={`/dashboard?date=${next(date)}`}>
            <button type="button" className="btn btn-primary btn-sm m-2">
              Next ➡️
            </button>
          </Link>
          <ReservationList reservations={reservations} />
        </div>
      </div>
      <div className="my-3 border-primary text-center">
        <h3 className="text-white bg-primary py-2">Tables</h3>
        <div>
          <TableList tables={tables} finishHandler={finishHandler} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
