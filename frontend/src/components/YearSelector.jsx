import { useState } from "react";
import { useFestival } from "../context/FestivalContext";

function YearSelector() {
  const {
    currentYear,
    availableYears,
    changeFestivalYear,
    addFestivalYear,
  } = useFestival();

  const [showAdd, setShowAdd] =
    useState(false);

  const [newYear, setNewYear] =
    useState("");

  const handleAddYear = () => {
    const year = Number(newYear);

    if (!year) {
      alert("Please enter a year.");
      return;
    }

    if (
      year < 2000 ||
      year > 2100
    ) {
      alert(
        "Please enter a valid year."
      );
      return;
    }

    const added =
      addFestivalYear(year);

    if (!added) {
      alert(
        "This festival year already exists."
      );
      return;
    }

    setNewYear("");
    setShowAdd(false);
  };

  return (
    <div className="year-selector">

      <div className="year-selector-label">

        <span>
          FESTIVAL YEAR
        </span>

        <strong>
          {currentYear}
        </strong>

      </div>

      <select
        value={currentYear}
        onChange={(event) =>
          changeFestivalYear(
            Number(event.target.value)
          )
        }
      >

        {availableYears.map(
          (year) => (
            <option
              key={year}
              value={year}
            >
              {year}
            </option>
          )
        )}

      </select>

      <button
        className="add-year-button"
        onClick={() =>
          setShowAdd(!showAdd)
        }
      >
        +
      </button>

      {showAdd && (

        <div className="add-year-popup">

          <input
            type="number"
            placeholder="2027"
            value={newYear}
            onChange={(event) =>
              setNewYear(
                event.target.value
              )
            }
          />

          <button
            onClick={handleAddYear}
          >
            Add Year
          </button>

        </div>

      )}

    </div>
  );
}

export default YearSelector;