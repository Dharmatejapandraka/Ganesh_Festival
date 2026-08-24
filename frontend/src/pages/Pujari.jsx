import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFestival } from "../context/FestivalContext";

// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:5000/api/pujari";

// =====================================================
// GET TOKEN
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

// =====================================================
// COMPONENT
// =====================================================

function Pujari() {
  const { currentYear } = useFestival();

  // ===================================================
  // STATE
  // ===================================================

  const [pujaris, setPujaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    amount: "",
    details: "",
  });

  // ===================================================
  // FETCH PUJARIS
  // ===================================================

  const fetchPujaris = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        console.error("JWT token not found in localStorage");

        setPujaris([]);

        alert(
          "Please login again. Authentication token not found."
        );

        return;
      }

      console.log("Fetching pujaris...");
      console.log("Year:", currentYear);

      const response = await fetch(
        `${API_URL}?year=${currentYear}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("PUJARI RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch pujaris"
        );
      }

      setPujaris(
        Array.isArray(data.pujaris)
          ? data.pujaris
          : []
      );
    } catch (error) {
      console.error("FETCH PUJARIS ERROR:", error);

      setPujaris([]);

      alert(
        error.message ||
          "Unable to load pujaris."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD WHEN YEAR / PAGE LOADS
  // ===================================================

  useEffect(() => {
    fetchPujaris();
  }, [currentYear]);

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===================================================
  // OPEN MODAL
  // ===================================================

  const openModal = () => {
    setForm({
      name: "",
      mobile: "",
      amount: "",
      details: "",
    });

    setShowModal(true);
  };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setForm({
      name: "",
      mobile: "",
      amount: "",
      details: "",
    });
  };

  // ===================================================
  // ADD PUJARI
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------------
    // NAME VALIDATION
    // -----------------------------------------------

    if (!form.name.trim()) {
      alert("Please enter pujari name.");
      return;
    }

    // -----------------------------------------------
    // MOBILE VALIDATION
    // -----------------------------------------------

    if (!form.mobile.trim()) {
      alert("Please enter mobile number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      alert(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    // -----------------------------------------------
    // AMOUNT VALIDATION
    // -----------------------------------------------

    if (
      form.amount === "" ||
      Number(form.amount) < 0
    ) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        alert(
          "Please login again. Authentication token not found."
        );
        return;
      }

      // ---------------------------------------------
      // POST
      // ---------------------------------------------

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: form.name.trim(),
            mobile: form.mobile.trim(),
            amount: Number(form.amount),
            details: form.details.trim(),
            festivalYear: Number(currentYear),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "ADD PUJARI RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add pujari"
        );
      }

      alert("Pujari added successfully.");

      closeModal();

      await fetchPujaris();
    } catch (error) {
      console.error(
        "ADD PUJARI ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to add pujari"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // DELETE PUJARI
  // ===================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pujari?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert(
          "Please login again. Authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "DELETE PUJARI RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete pujari"
        );
      }

      alert(
        "Pujari deleted successfully."
      );

      await fetchPujaris();
    } catch (error) {
      console.error(
        "DELETE PUJARI ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete pujari"
      );
    }
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredPujaris = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return pujaris;
    }

    return pujaris.filter(
      (pujari) =>
        pujari.name
          ?.toLowerCase()
          .includes(text) ||
        pujari.mobile
          ?.includes(text) ||
        pujari.details
          ?.toLowerCase()
          .includes(text)
    );
  }, [pujaris, search]);

  // ===================================================
  // TOTAL AMOUNT
  // ===================================================

  const totalAmount = pujaris.reduce(
    (total, pujari) =>
      total +
      Number(pujari.amount || 0),
    0
  );

  // ===================================================
  // MONEY FORMAT
  // ===================================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="pujari-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <section className="pujari-header">

        <div>
          <div className="pujari-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>

          <h1>Pujari</h1>

          <p>
            Manage pujari details and
            festival payments.
          </p>
        </div>

        <button
          className="pujari-primary-button"
          onClick={openModal}
        >
          + Add Pujari
        </button>

      </section>

      {/* =========================================
          STATS
          ONLY TWO CARDS
      ========================================== */}

      <section className="pujari-stats">

        {/* TOTAL PUJARIS */}

        <div className="pujari-stat-card">

          <div className="pujari-stat-icon">
            ॐ
          </div>

          <div>
            <span>
              Total Pujaris
            </span>

            <strong>
              {pujaris.length}
            </strong>

            <small>
              {currentYear}
            </small>
          </div>

        </div>

        {/* TOTAL AMOUNT */}

        <div className="pujari-stat-card">

          <div className="pujari-stat-icon">
            ₹
          </div>

          <div>
            <span>
              Total Amount
            </span>

            <strong>
              {formatMoney(totalAmount)}
            </strong>

            <small>
              Festival payment
            </small>
          </div>

        </div>

      </section>

      {/* =========================================
          SEARCH
      ========================================== */}

      <div className="pujari-search-row">

        <div className="pujari-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search pujari name or mobile..."
          />

        </div>

        <span className="pujari-count">
          {filteredPujaris.length}{" "}
          {filteredPujaris.length === 1
            ? "pujari"
            : "pujaris"}
        </span>

      </div>

      {/* =========================================
          RECORDS
      ========================================== */}

      <section className="pujari-records">

        <div className="pujari-records-header">

          <div>

            <div className="pujari-eyebrow">
              {currentYear} PUJARI RECORDS
            </div>

            <h2>
              Pujari List
            </h2>

          </div>

          <strong>
            {formatMoney(totalAmount)}
          </strong>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="pujari-empty">

            <div className="pujari-empty-icon">
              ⏳
            </div>

            <h3>
              Loading...
            </h3>

          </div>

        ) : filteredPujaris.length === 0 ? (

          /* =====================================
             EMPTY
          ====================================== */

          <div className="pujari-empty">

            <div className="pujari-empty-icon">
              ॐ
            </div>

            <h3>
              No Pujaris Found
            </h3>

            <p>
              Add a pujari for {currentYear}.
            </p>

            <button
              className="pujari-primary-button"
              onClick={openModal}
            >
              + Add Pujari
            </button>

          </div>

        ) : (

          /* =====================================
             LIST
          ====================================== */

          <div className="pujari-list">

            {filteredPujaris.map(
              (pujari) => (

                <div
                  className="pujari-row"
                  key={pujari._id}
                >

                  {/* PERSON */}

                  <div className="pujari-person">

                    <div className="pujari-avatar">
                      ॐ
                    </div>

                    <div>

                      <strong>
                        {pujari.name}
                      </strong>

                      <span>
                        {pujari.mobile}
                      </span>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="pujari-details">

                    <small>
                      DETAILS
                    </small>

                    <span>
                      {pujari.details ||
                        "No details"}
                    </span>

                  </div>

                  {/* AMOUNT */}

                  <div className="pujari-amount">

                    <small>
                      AMOUNT
                    </small>

                    <strong>
                      {formatMoney(
                        pujari.amount
                      )}
                    </strong>

                  </div>

                  {/* DATE */}

                  <div className="pujari-date">

                    <small>
                      DATE
                    </small>

                    <span>
                      {formatDate(
                        pujari.createdAt
                      )}
                    </span>

                  </div>

                  {/* DELETE */}

                  <button
                    className="pujari-delete"
                    onClick={() =>
                      handleDelete(
                        pujari._id
                      )
                    }
                    title="Delete pujari"
                  >
                    🗑
                  </button>

                </div>
              )
            )}

          </div>

        )}

      </section>

      {/* =========================================
          ADD MODAL
      ========================================== */}

      {showModal && (

        <div
          className="pujari-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !saving
            ) {
              closeModal();
            }

          }}
        >

          <div className="pujari-modal">

            {/* MODAL HEADER */}

            <div className="pujari-modal-header">

              <div>

                <div className="pujari-eyebrow">
                  {currentYear} PUJARI
                </div>

                <h2>
                  Add Pujari
                </h2>

              </div>

              <button
                className="pujari-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              className="pujari-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="pujari-form-group">

                <label>
                  Pujari Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter pujari name"
                  required
                />

              </div>

              {/* MOBILE */}

              <div className="pujari-form-group">

                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  required
                />

              </div>

              {/* AMOUNT */}

              <div className="pujari-form-group">

                <label>
                  Amount *
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="0"
                  required
                />

              </div>

              {/* DETAILS */}

              <div className="pujari-form-group">

                <label>
                  Details
                </label>

                <input
                  type="text"
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Optional details"
                />

              </div>

              {/* DATE */}

              <div className="pujari-auto-date">

                <div>

                  <span>
                    DATE
                  </span>

                  <strong>
                    {new Date().toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </strong>

                </div>

                <small>
                  Date is automatically recorded.
                </small>

              </div>

              {/* BUTTONS */}

              <div className="pujari-modal-actions">

                <button
                  type="button"
                  className="pujari-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pujari-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Pujari"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================================
          CSS
      ========================================== */}

      <style>{`

        /* =========================================
           PAGE
        ========================================== */

        .pujari-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        /* =========================================
           HEADER
        ========================================== */

        .pujari-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 32px;
        }

        .pujari-eyebrow {
          color: #f5bd45;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }

        .pujari-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 42px;
          font-weight: 800;
        }

        .pujari-header p {
          color: #8d8297;
          margin: 10px 0 0;
        }


        /* =========================================
           BUTTON
        ========================================== */

        .pujari-primary-button {
          border: none;
          border-radius: 11px;
          padding: 13px 20px;
          background: linear-gradient(
            135deg,
            #ffd76c,
            #efb43b
          );
          color: #241909;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .pujari-primary-button:hover {
          transform: translateY(-2px);
        }

        .pujari-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* =========================================
           STATS
           ONLY TWO CARDS
        ========================================== */

        .pujari-stats {
          display: grid;

          /*
            TWO CARDS
          */
          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 20px;
          margin-bottom: 25px;
        }

        .pujari-stat-card {
          min-height: 135px;
          padding: 23px;

          display: flex;
          align-items: center;
          gap: 17px;

          box-sizing: border-box;

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 18px;
        }

        .pujari-stat-icon {
          width: 50px;
          height: 50px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            rgba(245,189,69,0.08);

          color: #f5bd45;

          font-size: 21px;
          font-weight: 800;
        }

        .pujari-stat-card span {
          display: block;
          color: #8d8297;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .pujari-stat-card strong {
          display: block;
          color: #f4eff8;
          font-size: 24px;
        }

        .pujari-stat-card small {
          color: #6f6577;
          font-size: 11px;
        }


        /* =========================================
           SEARCH
        ========================================== */

        .pujari-search-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .pujari-search {
          width: min(600px, 100%);
          height: 51px;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 0 16px;

          box-sizing: border-box;

          background: #130e18;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 12px;
        }

        .pujari-search span {
          color: #7d7286;
          font-size: 20px;
        }

        .pujari-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #f4eff8;
        }

        .pujari-search input::placeholder {
          color: #62596a;
        }

        .pujari-count {
          color: #807589;
          font-size: 13px;
        }


        /* =========================================
           RECORDS
        ========================================== */

        .pujari-records {
          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 20px;
          overflow: hidden;
        }

        .pujari-records-header {
          min-height: 105px;

          padding: 25px 28px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }

        .pujari-records-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 24px;
        }

        .pujari-records-header > strong {
          color: #f5bd45;
          font-size: 17px;

          padding: 10px 14px;

          border-radius: 10px;

          background:
            rgba(245,189,69,0.08);
        }


        /* =========================================
           LIST
        ========================================== */

        .pujari-list {
          display: flex;
          flex-direction: column;
        }

        .pujari-row {
          min-height: 92px;

          padding: 17px 28px;

          display: grid;

          grid-template-columns:
            minmax(230px, 1.4fr)
            minmax(180px, 1fr)
            minmax(120px, 0.7fr)
            minmax(120px, 0.7fr)
            42px;

          align-items: center;
          gap: 20px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.055);
        }

        .pujari-row:last-child {
          border-bottom: none;
        }

        .pujari-person {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .pujari-avatar {
          width: 43px;
          height: 43px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            rgba(245,189,69,0.08);

          color: #f5bd45;
          font-size: 18px;
        }

        .pujari-person strong {
          display: block;
          color: #eee9f1;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .pujari-person span {
          color: #746a7d;
          font-size: 12px;
        }

        .pujari-details small,
        .pujari-amount small,
        .pujari-date small {
          display: block;
          color: #6e6477;
          font-size: 10px;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .pujari-details span,
        .pujari-date span {
          color: #bcb3c3;
          font-size: 13px;
        }

        .pujari-details span {
          overflow-wrap: anywhere;
        }

        .pujari-amount strong {
          color: #f2b63e;
          font-size: 15px;
        }

        .pujari-delete {
          width: 38px;
          height: 38px;

          border-radius: 9px;

          border:
            1px solid
            rgba(255,80,80,0.13);

          background:
            rgba(255,80,80,0.04);

          color: #dc7474;
          cursor: pointer;
        }

        .pujari-delete:hover {
          background:
            rgba(255,80,80,0.1);
        }


        /* =========================================
           EMPTY
        ========================================== */

        .pujari-empty {
          min-height: 300px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 40px;
        }

        .pujari-empty-icon {
          width: 62px;
          height: 62px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background:
            rgba(245,189,69,0.07);

          color: #f5bd45;

          font-size: 25px;

          margin-bottom: 15px;
        }

        .pujari-empty h3 {
          margin: 0;
          color: #eae4ee;
        }

        .pujari-empty p {
          color: #746a7d;
          margin: 8px 0 20px;
          font-size: 13px;
        }


        /* =========================================
           MODAL
        ========================================== */

        .pujari-modal-overlay {
          position: fixed;
          inset: 0;

          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background:
            rgba(0,0,0,0.78);

          backdrop-filter: blur(7px);

          overflow-y: auto;
        }

        .pujari-modal {
          width: min(680px, 100%);

          max-height:
            calc(100vh - 50px);

          overflow-y: auto;

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.1);

          border-radius: 20px;
        }

        .pujari-modal-header {
          padding: 24px 26px;

          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }

        .pujari-modal-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 25px;
        }

        .pujari-modal-close {
          width: 38px;
          height: 38px;

          border: none;
          border-radius: 9px;

          background:
            rgba(255,255,255,0.04);

          color: #aaa0ae;

          font-size: 23px;
          cursor: pointer;
        }

        .pujari-form {
          padding: 26px;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 19px;
        }

        .pujari-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pujari-form-group label {
          color: #93879d;
          font-size: 13px;
          font-weight: 600;
        }

        .pujari-form-group input {
          width: 100%;
          height: 48px;

          padding: 0 14px;

          box-sizing: border-box;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 10px;

          background: #19131f;

          color: #eee8f0;

          outline: none;

          font-size: 14px;
        }

        .pujari-form-group input:focus {
          border-color:
            rgba(245,189,69,0.5);
        }

        .pujari-form-group input::placeholder {
          color: #62596a;
        }

        .pujari-auto-date {
          grid-column: 1 / -1;

          padding: 16px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          border-radius: 12px;

          background:
            rgba(245,189,69,0.045);

          border:
            1px solid
            rgba(245,189,69,0.12);
        }

        .pujari-auto-date div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .pujari-auto-date span {
          color: #786d81;
          font-size: 10px;
          letter-spacing: 1.5px;
        }

        .pujari-auto-date strong {
          color: #f5bd45;
          font-size: 16px;
        }

        .pujari-auto-date small {
          color: #756a7c;
          font-size: 11px;
        }

        .pujari-modal-actions {
          grid-column: 1 / -1;

          display: flex;
          justify-content: flex-end;

          gap: 12px;
        }

        .pujari-secondary-button {
          border:
            1px solid
            rgba(255,255,255,0.09);

          background:
            rgba(255,255,255,0.03);

          color: #bdb4c3;

          border-radius: 10px;

          padding: 13px 20px;

          font-weight: 700;

          cursor: pointer;
        }


        /* =========================================
           TABLET
        ========================================== */

        @media (max-width: 1000px) {

          .pujari-page {
            padding: 30px 24px 50px;
          }

          /*
            KEEP TWO STAT CARDS
          */
          .pujari-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 14px;
          }

          .pujari-row {
            grid-template-columns:
              1fr 1fr;
          }

        }


        /* =========================================
           MOBILE
        ========================================== */

        @media (max-width: 700px) {

          .pujari-page {
            padding: 24px 16px 40px;
          }


          /* HEADER */

          .pujari-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .pujari-header h1 {
            font-size: 34px;
          }

          .pujari-header p {
            font-size: 13px;
          }

          .pujari-primary-button {
            width: auto;
          }


          /*
            =========================================
            IMPORTANT:
            TWO STAT CARDS IN ONE ROW
            =========================================
          */

          .pujari-stats {
            display: grid !important;

            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;

            gap: 10px !important;

            width: 100% !important;

            margin-bottom: 18px;
          }

          .pujari-stat-card {
            width: 100% !important;

            min-width: 0 !important;

            min-height: 125px;

            padding: 14px !important;

            display: flex;

            flex-direction: column;

            align-items: flex-start;

            justify-content: center;

            gap: 10px;

            border-radius: 15px;

            box-sizing: border-box;
          }

          .pujari-stat-icon {
            width: 38px;
            height: 38px;

            border-radius: 10px;

            font-size: 17px;
          }

          .pujari-stat-card span {
            font-size: 9px;

            letter-spacing: 0.8px;

            margin-bottom: 4px;
          }

          .pujari-stat-card strong {
            font-size: 20px;
          }

          .pujari-stat-card small {
            font-size: 9px;
          }


          /* SEARCH */

          .pujari-search-row {
            flex-direction: column;
            align-items: stretch;

            gap: 8px;
          }

          .pujari-search {
            width: 100%;
          }

          .pujari-count {
            align-self: flex-end;
          }


          /* RECORDS */

          .pujari-records-header {
            padding: 20px;
          }

          .pujari-records-header h2 {
            font-size: 20px;
          }

          .pujari-records-header > strong {
            font-size: 14px;
          }


          /* PUJARI ROW */

          .pujari-row {
            grid-template-columns: 1fr;

            padding: 20px;

            gap: 15px;
          }

          .pujari-delete {
            justify-self: end;
          }


          /* FORM */

          .pujari-form {
            grid-template-columns: 1fr;
          }

          .pujari-auto-date,
          .pujari-modal-actions {
            grid-column: auto;
          }

          .pujari-auto-date {
            flex-direction: column;
            align-items: flex-start;
          }


          /* MODAL */

          .pujari-modal-overlay {
            padding: 12px;
          }

          .pujari-modal {
            width: 100%;
            border-radius: 16px;
          }

          .pujari-modal-header {
            padding: 20px;
          }

          .pujari-form {
            padding: 20px;
          }

          .pujari-modal-actions {
            flex-direction: column;
          }

          .pujari-modal-actions button {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}

export default Pujari;