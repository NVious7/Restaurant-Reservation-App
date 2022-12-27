import React from "react";
import { Link, useHistory } from "react-router-dom";
import { updateStatus } from "../utils/api";

function ReservationDetails(props) {
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = props;
  const history = useHistory();

  async function cancelHandler(reservation_id) {
    const abortController = new AbortController();
    const result = window.confirm(
      "Are you sure you want to cancel this reservation? This cannot be undone."
    );

    if (result) {
      await updateStatus(reservation_id, "cancelled", abortController.signal);
      history.go(0);
    }

    return () => abortController.abort();
  }

  return (
    <>
      <tr key={reservation_id}>
        <td className="align-middle">{first_name}</td>
        <td className="align-middle">{last_name}</td>
        <td className="align-middle">{mobile_number}</td>
        <td className="align-middle">{reservation_date}</td>
        <td className="align-middle">{reservation_time}</td>
        <td className="align-middle">{people}</td>
        <td
          className="align-middle"
          data-reservation-id-status={reservation_id}
        >
          {status}
        </td>
        <td>
          {status === "booked" ? (
            <Link to={`/reservations/${reservation_id}/seat`}>
              <button
                href={`/reservations/${reservation_id}/seat`}
                type="button"
                className="btn btn-sm table-condensed btn-primary m-1"
              >
                🪑 Seat
              </button>
            </Link>
          ) : (
            ""
          )}
        </td>
        <td>
          {status === "booked" ? (
            <Link to={`/reservations/${reservation_id}/edit`}>
              <button
                href={`/reservations/${reservation_id}/edit`}
                type="button"
                className="btn btn-sm table-condensed btn-primary m-1"
              >
                ✏️ Edit
              </button>
            </Link>
          ) : (
            ""
          )}
        </td>
        <td>
          {" "}
          {status === "booked" ? (
            <button
              data-reservation-id-cancel={reservation_id}
              className="btn btn-sm table-condensed btn-primary m-1"
              onClick={() => cancelHandler(reservation_id)}
            >
              🚫 Cancel
            </button>
          ) : (
            ""
          )}
        </td>
      </tr>
    </>
  );
}

export default ReservationDetails;
