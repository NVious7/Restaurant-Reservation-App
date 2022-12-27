import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { searchReservationByMobile } from "../utils/api";
import ReservationList from "../reservations/ReservationList";

function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchErrors, setSearchErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const history = useHistory();

  const changeHandler = (event) => {
    setMobileNumber(event.target.value);
  };

  const submitHandler = (event) => {
    setReservations([]);
    event.preventDefault();
    const abortController = new AbortController();

    async function searchByMobile() {
      try {
        setSubmitted(true);
        const result = await searchReservationByMobile(
          mobileNumber,
          abortController.signal
        );
        if (result.length) {
          setReservations(result);
        } else {
          setReservations(["No reservations found"]);
        }
      } catch (error) {
        setSearchErrors([...searchErrors, error.message]);
      }
    }
    searchByMobile();

    return () => abortController.abort();
  };

  return (
    <div className="my-3 border-primary">
      <h3 className="text-white bg-primary text-center py-2">Search</h3>
      <div>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label className="form-label" htmlFor="mobile_number">
              Mobile Number:
            </label>
            <input
              className="form-control"
              id="mobile_number"
              name="mobile_number"
              type="text"
              placeholder="Enter a customer's phone number"
              value={mobileNumber}
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
                🔍 Find{" "}
              </button>
            </div>
          </div>
        </form>
      </div>{" "}
      {submitted ? <ReservationList reservations={reservations} /> : ""}
    </div>
  );
}

export default Search;
