import React from "react";
import { useHistory } from "react-router-dom";

function ReservationForm(props) {
  const { title, reservation, setReservation, submitHandler } = props;
  const history = useHistory();

  const changeHandler = ({ target: { name, value } }) => {
    if (name === "people") {
      setReservation((previousReservation) => ({
        ...previousReservation,
        [name]: Number(value),
      }));
    } else {
      setReservation((previousReservation) => ({
        ...previousReservation,
        [name]: value,
      }));
    }
  };

  return (
    <div className="my-3 border-primary">
      <h3 className="text-white bg-primary text-center py-2">
        {title} Reservation
      </h3>
      <div>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label className="form-label" htmlFor="first_name">
              First Name:{" "}
            </label>
            <input
              className="form-control"
              id="first_name"
              name="first_name"
              type="text"
              value={reservation.first_name || ""}
              onChange={changeHandler}
              required={true}
            />
            <label className="form-label" htmlFor="last_name">
              Last Name:
            </label>
            <input
              className="form-control"
              id="last_name"
              name="last_name"
              type="text"
              value={reservation.last_name || ""}
              onChange={changeHandler}
              required={true}
            />
            <br />
            <label className="form-label" htmlFor="mobile_number">
              Phone Number:{" "}
            </label>
            <input
              className="form-control"
              id="mobile_number"
              name="mobile_number"
              type="text"
              value={reservation.mobile_number || ""}
              onChange={changeHandler}
              required={true}
              placeholder="(xxx) xxx-xxxx"
            />
            <br />
            <label className="form-label" htmlFor="reservation_date">
              Reservation Date:{" "}
            </label>
            <input
              className="form-control"
              id="reservation_date"
              name="reservation_date"
              type="date"
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              value={reservation.reservation_date || ""}
              onChange={changeHandler}
              required={true}
            />
            <label className="form-label" htmlFor="reservation_time">
              Reservation Time:{" "}
            </label>
            <input
              className="form-control"
              id="reservation_time"
              name="reservation_time"
              type="time"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]:{2}"
              value={reservation.reservation_time || ""}
              onChange={changeHandler}
              required={true}
            />
            <br />
            <label className="form-label" htmlFor="people">
              Party Size:{" "}
            </label>
            <input
              className="form-control"
              id="people"
              name="people"
              type="number"
              min={1}
              value={reservation.people || ""}
              onChange={changeHandler}
              required={true}
            />
            <br />
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
  );
}

export default ReservationForm;
