import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const history = useHistory();
  const [table, setTable] = useState({
    table_name: "",
    capacity: "",
  });
  const [tableErrors, setTableErrors] = useState([]);

  const changeHandler = ({ target: { name, value } }) => {
    if (name === "capacity") {
      setTable((previousTable) => ({
        ...previousTable,
        [name]: Number(value),
      }));
    } else {
      setTable((previousTable) => ({
        ...previousTable,
        [name]: value,
      }));
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    createTable(table, abortController.signal)
      .then(history.push(`/dashboard`))
      .catch(setTableErrors);

    return () => abortController.abort();
  };

  return (
    <div>
      <ErrorAlert errors={tableErrors} />
      <div className="my-3 border-primary">
        <h3 className="text-white bg-primary text-center py-2">New Table</h3>
        <div>
          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="form-label" htmlFor="table_name">
                Table Name:
              </label>
              <input
                className="form-control"
                id="table_name"
                name="table_name"
                type="text"
                value={table.table_name}
                minLength="2"
                onChange={changeHandler}
                required={true}
              />
              <label className="form-label" htmlFor="capacity">
                Capacity:
              </label>
              <input
                className="form-control"
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                value={table.capacity}
                onChange={changeHandler}
                required={true}
              />
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-danger m-2"
                  onClick={() => history.push("/dashboard")}
                >
                  {" "}
                  Cancel{" "}
                </button>
                <button type="submit" className="btn btn-primary m-2">
                  {" "}
                  Submit{" "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewTable;
