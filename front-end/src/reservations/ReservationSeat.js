import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listTables, updateTable, readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationSeat() {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [seatErrors, setSeatErrors] = useState([]);

  useEffect(loadData, [reservation_id]);

  function loadData() {
    const abortController = new AbortController();

    listTables(abortController.signal)
      .then((res) =>
        res.filter((table) => {
          return !table.occupied;
        })
      )
      .then(setTables)
      .catch(setSeatErrors);

    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setSeatErrors);

    return () => abortController.abort();
  }

  const changeHandler = (event) => {
    setTableId(event.target.value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    const selectedTable = tables.find(
      (table) => table.table_id === Number(tableId)
    );
    if (selectedTable.capacity < reservation.people) {
      setSeatErrors([
        new Error("Table capacity is not big enough for party size."),
      ]);
    } else {
      await updateTable(
        reservation.reservation_id,
        tableId,
        abortController.signal
      );
      history.push("/dashboard");
    }
    return () => abortController.abort();
  };

  return (
    <>
      <ErrorAlert errors={seatErrors} />
      <div className="card my-3 border-primary text-center w-85">
        <h3 className="card-header text-white bg-primary">Seat </h3>
        <div className="card-body">
          <form onSubmit={submitHandler}>
            <div className="form-group">
              <h5 className="card-title">Table Number:</h5>
              <label htmlFor="table-id">
                <select
                  className="form-control"
                  id="table_id"
                  name="table_id"
                  value={tableId}
                  required={true}
                  onChange={changeHandler}
                >
                  <option value="">-- Select a Table --</option>
                  {tables.map((table) => (
                    <option key={table.table_id} value={table.table_id}>
                      {table.table_name} - Capacity: {table.capacity}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-danger m-2"
                onClick={() => history.push("/")}
              >
                {" "}
                Cancel{" "}
              </button>
              <button type="submit" className="btn btn-primary m-2">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ReservationSeat;
