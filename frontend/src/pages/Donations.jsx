import React, { useEffect, useMemo, useState } from "react";
import { useFestival } from "../context/FestivalContext";
import { apiFetch } from "../utils/api";


// =====================================================
// DONATIONS PAGE
// =====================================================

function Donations() {
  const { currentYear } = useFestival();

  // ===================================================
  // STATE
  // ===================================================

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    donorName: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Received",
  });


  // ===================================================
  // API
  // ===================================================

  const API_URL = "/donations";


  // ===================================================
  // LOAD DONATIONS
  // ===================================================

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}?year=${currentYear}`
      );

      const list = Array.isArray(response?.donations)
        ? response.donations
        : [];

      setDonations(list);

    } catch (error) {
      console.error("FETCH DONATIONS ERROR:", error);

      setDonations([]);

      setError(
        error.message ||
        "Unable to load donations."
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // LOAD WHEN YEAR CHANGES
  // ===================================================

  useEffect(() => {
    fetchDonations();
  }, [currentYear]);


  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    setForm({
      donorName: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Received",
    });

    setEditingId(null);
  };


  // ===================================================
  // OPEN ADD
  // ===================================================

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };


  // ===================================================
  // OPEN EDIT
  // ===================================================

  const openEditModal = (donation) => {
    setEditingId(donation._id);

    setForm({
      donorName:
        donation.donorName ||
        donation.name ||
        "",

      amount:
        donation.amount ??
        "",

      paymentMethod:
        donation.paymentMethod ||
        "Cash",

      status:
        donation.status ||
        "Received",
    });

    setShowModal(true);
  };


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };


  // ===================================================
  // SAVE DONATION
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const donorName =
      form.donorName.trim();

    const amount =
      Number(form.amount);


    if (!donorName) {
      alert("Please enter donor name.");
      return;
    }


    if (
      !form.amount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      alert("Please enter a valid amount.");
      return;
    }


    try {
      setSaving(true);

      const payload = {
        donorName,  
        amount,
        paymentMethod:
          form.paymentMethod,

        status:
          form.status,

        festivalYear:
          Number(currentYear),
      };


      if (editingId) {

        await apiFetch(
          `${API_URL}/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

      } else {

        await apiFetch(
          API_URL,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

      }


      closeModal();

      await fetchDonations();

    } catch (error) {
      console.error(
        "SAVE DONATION ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to save donation."
      );

    } finally {
      setSaving(false);
    }
  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this donation?"
      );

    if (!confirmed) {
      return;
    }


    try {

      await apiFetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      await fetchDonations();

    } catch (error) {

      console.error(
        "DELETE DONATION ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to delete donation."
      );
    }
  };


  // ===================================================
  // SEARCH
  // ===================================================

  const filteredDonations =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return donations;
      }


      return donations.filter(
        (donation) => {

          const donor =
            String(
              donation.donorName ||
              donation.name ||
              ""
            ).toLowerCase();

          const mobile =
            String(
              donation.mobile ||
              donation.mobileNumber ||
              ""
            ).toLowerCase();

          const payment =
            String(
              donation.paymentMethod ||
              ""
            ).toLowerCase();

          const status =
            String(
              donation.status ||
              ""
            ).toLowerCase();


          return (
            donor.includes(value) ||
            mobile.includes(value) ||
            payment.includes(value) ||
            status.includes(value)
          );
        }
      );

    }, [donations, search]);


  // ===================================================
  // AMOUNTS
  // ===================================================

  const totalAmount =
    donations.reduce(
      (total, donation) =>
        total +
        Number(
          donation.amount || 0
        ),
      0
    );


  const receivedAmount =
    donations
      .filter(
        (donation) =>
          String(
            donation.status || ""
          ).toLowerCase() ===
          "received"
      )
      .reduce(
        (total, donation) =>
          total +
          Number(
            donation.amount || 0
          ),
        0
      );


  const pendingAmount =
    donations
      .filter(
        (donation) =>
          String(
            donation.status || ""
          ).toLowerCase() ===
          "pending"
      )
      .reduce(
        (total, donation) =>
          total +
          Number(
            donation.amount || 0
          ),
        0
      );


  // ===================================================
  // FORMAT MONEY
  // ===================================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

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
        month: "short",
        year: "numeric",
      }
    );
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="donations-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="donations-header">

        <div>
          <div className="donations-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>

          <h1>
            Donations
          </h1>

          <p>
            Manage contributions received
            for the {currentYear} festival.
          </p>
        </div>


        <button
          className="donations-primary-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Donation
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="donations-error">
          <div>
            <strong>
              Unable to load donations
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            onClick={fetchDonations}
          >
            Retry
          </button>
        </div>
      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="donations-stats">

        <div className="donations-stat-card">

          <div className="donations-stat-icon">
            ₹
          </div>

          <div className="donations-stat-content">

            <span>
              TOTAL DONATIONS
            </span>

            <strong>
              {formatMoney(totalAmount)}
            </strong>

            <small>
              {donations.length} records
            </small>

          </div>

        </div>


        <div className="donations-stat-card">

          <div className="donations-stat-icon success">
            ✓
          </div>

          <div className="donations-stat-content">

            <span>
              RECEIVED
            </span>

            <strong>
              {formatMoney(receivedAmount)}
            </strong>

            <small>
              Successfully received
            </small>

          </div>

        </div>


        <div className="donations-stat-card">

          <div className="donations-stat-icon pending">
            ◷
          </div>

          <div className="donations-stat-content">

            <span>
              PENDING
            </span>

            <strong>
              {formatMoney(pendingAmount)}
            </strong>

            <small>
              Awaiting payment
            </small>

          </div>

        </div>


        <div className="donations-stat-card">

          <div className="donations-stat-icon">
            #
          </div>

          <div className="donations-stat-content">

            <span>
              RECORDS
            </span>

            <strong>
              {donations.length}
            </strong>

            <small>
              {currentYear} festival
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          DONATION SECTION
      ================================================= */}

      <section className="donations-section">

        <div className="donations-section-header">

          <div>

            <div className="donations-eyebrow">
              {currentYear} CONTRIBUTIONS
            </div>

            <h2>
              Donation Records
            </h2>

            <p>
              All donations for the selected
              festival year.
            </p>

          </div>


          <div className="donations-record-count">
            {filteredDonations.length}
            {" "}
            {filteredDonations.length === 1
              ? "record"
              : "records"}
          </div>

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="donations-toolbar">

          <div className="donations-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search donor, mobile, payment..."
            />

            {search && (
              <button
                className="donations-clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


          <button
            className="donations-refresh"
            onClick={fetchDonations}
            disabled={loading}
          >
            ↻
            Refresh
          </button>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="donations-loading">

            <div className="donations-spinner" />

            <span>
              Loading donations...
            </span>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredDonations.length === 0 && (

            <div className="donations-empty">

              <div className="donations-empty-icon">
                ₹
              </div>

              <h3>
                {search
                  ? "No matching donations"
                  : "No donations yet"}
              </h3>

              <p>
                {search
                  ? "Try a different search."
                  : `Add the first donation for ${currentYear}.`}
              </p>

              {!search && (
                <button
                  className="donations-primary-button"
                  onClick={openAddModal}
                >
                  <span>+</span>
                  Add Donation
                </button>
              )}

            </div>

          )}


        {/* =================================================
            TABLE
        ================================================= */}

        {!loading &&
          filteredDonations.length > 0 && (

            <div className="donations-table-wrapper">

              <table className="donations-table">

                <thead>

                  <tr>

                    <th>
                      DONOR
                    </th>

                    <th>
                      MOBILE
                    </th>

                    <th className="amount-column">
                      AMOUNT
                    </th>

                    <th>
                      PAYMENT
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      DATE
                    </th>

                    <th className="actions-column">
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDonations.map(
                    (donation, index) => {

                      const donorName =
                        donation.donorName ||
                        donation.name ||
                        "Unknown Donor";

                      const mobile =
                        donation.mobile ||
                        donation.mobileNumber ||
                        "-";

                      const status =
                        donation.status ||
                        "Received";

                      const isReceived =
                        String(status)
                          .toLowerCase() ===
                        "received";


                      return (

                        <tr
                          key={
                            donation._id ||
                            index
                          }
                        >

                          {/* DONOR */}

                          <td>

                            <div className="donor-cell">

                              <div className="donor-avatar">
                                {donorName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {donorName}
                                </strong>

                                <small>
                                  Donor
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* MOBILE */}

                          <td>

                            <span className="mobile-value">
                              {mobile}
                            </span>

                          </td>


                          {/* AMOUNT */}

                          <td className="amount-column">

                            <strong className="table-amount">
                              {formatMoney(
                                donation.amount
                              )}
                            </strong>

                          </td>


                          {/* PAYMENT */}

                          <td>

                            <span className="payment-badge">
                              {donation.paymentMethod ||
                                "Cash"}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                `donation-status-badge ${
                                  isReceived
                                    ? "received"
                                    : "pending"
                                }`
                              }
                            >

                              <span className="status-dot" />

                              {status}

                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            <span className="date-value">

                              {formatDate(
                                donation.date ||
                                donation.createdAt
                              )}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td className="actions-column">

                            <div className="table-actions">

                              <button
                                className="table-edit-button"
                                onClick={() =>
                                  openEditModal(
                                    donation
                                  )
                                }
                                title="Edit donation"
                              >
                                ✎
                              </button>


                              <button
                                className="table-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    donation._id
                                  )
                                }
                                title="Delete donation"
                              >
                                🗑
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div
          className="donations-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeModal();
            }

          }}
        >

          <div className="donations-modal">

            {/* HEADER */}

            <div className="donations-modal-header">

              <div>

                <div className="donations-eyebrow">
                  {currentYear} DONATION
                </div>

                <h2>
                  {editingId
                    ? "Edit Donation"
                    : "Add Donation"}
                </h2>

                <p>
                  Enter the contribution details.
                </p>

              </div>


              <button
                className="donations-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="donations-form"
              onSubmit={handleSubmit}
            >

              {/* DONOR */}

              <div className="donations-form-group">

                <label>
                  Donor Name *
                </label>

                <input
                  type="text"
                  name="donorName"
                  value={form.donorName}
                  onChange={handleChange}
                  placeholder="Enter donor name"
                  autoComplete="off"
                  required
                />

              </div>



              {/* AMOUNT */}

              <div className="donations-form-group">

                <label>
                  Amount *
                </label>

                <div className="donations-amount-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="1"
                    required
                  />

                </div>

              </div>


              <div className="donations-form-grid">

                {/* PAYMENT */}

                <div className="donations-form-group">

                  <label>
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* STATUS */}

                <div className="donations-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    <option value="Received">
                      Received
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                  </select>

                </div>

              </div>


              {/* YEAR INFO */}

              <div className="donations-info-grid">

                <div className="donations-info-box">

                  <span>
                    FESTIVAL YEAR
                  </span>

                  <strong>
                    {currentYear}
                  </strong>

                </div>


                <div className="donations-info-box">

                  <span>
                    RECORD DATE
                  </span>

                  <strong>
                    {new Date().toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </strong>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="donations-modal-actions">

                <button
                  type="button"
                  className="donations-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="donations-primary-button"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Donation"
                    : "Save Donation"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          PAGE CSS
      ================================================= */}

      <style>{`

        /* ============================================
           PAGE
        ============================================ */

        .donations-page {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 34px 38px 70px;
          box-sizing: border-box;
          color: #f5f1f7;
        }


        /* ============================================
           HEADER
        ============================================ */

        .donations-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
        }

        .donations-eyebrow {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }

        .donations-header h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 800;
          color: #f8f3f8;
        }

        .donations-header p {
          margin: 9px 0 0;
          color: #8f8497;
          font-size: 15px;
        }


        /* ============================================
           PRIMARY BUTTON
        ============================================ */

        .donations-primary-button {
          border: 0;
          min-height: 48px;
          padding: 0 21px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #ffd76c,
            #efb43b
          );
          color: #21180b;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow:
            0 8px 24px
            rgba(245,189,69,0.13);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;
        }

        .donations-primary-button span {
          font-size: 20px;
          line-height: 0;
        }

        .donations-primary-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 28px
            rgba(245,189,69,0.18);
        }

        .donations-primary-button:disabled {
          opacity: .5;
          cursor: not-allowed;
          transform: none;
        }


        /* ============================================
           ERROR
        ============================================ */

        .donations-error {
          margin-bottom: 22px;
          padding: 15px 17px;
          border: 1px solid
            rgba(255,91,91,.2);
          border-radius: 13px;
          background:
            rgba(255,65,65,.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .donations-error div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .donations-error strong {
          color: #ff9b9b;
          font-size: 13px;
        }

        .donations-error span {
          color: #8e7e88;
          font-size: 12px;
        }

        .donations-error button {
          border: 1px solid
            rgba(245,189,69,.25);
          background:
            rgba(245,189,69,.08);
          color: #f5bd45;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 700;
        }


        /* ============================================
           STAT CARDS
        ============================================ */

        .donations-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .donations-stat-card {
          min-height: 130px;
          padding: 22px;
          border-radius: 17px;
          border: 1px solid
            rgba(255,255,255,.075);
          background:
            linear-gradient(
              145deg,
              #151019,
              #100c14
            );
          display: flex;
          align-items: center;
          gap: 15px;
          box-sizing: border-box;
        }

        .donations-stat-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(245,189,69,.08);
          color: #f5bd45;
          font-size: 19px;
          font-weight: 800;
        }

        .donations-stat-icon.success {
          color: #79d89c;
          background:
            rgba(77,190,113,.08);
        }

        .donations-stat-icon.pending {
          color: #f5bd45;
          background:
            rgba(245,189,69,.08);
        }

        .donations-stat-content {
          min-width: 0;
        }

        .donations-stat-content span {
          display: block;
          color: #7d7185;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        .donations-stat-content strong {
          display: block;
          color: #f5f0f7;
          font-size: 24px;
          line-height: 1.1;
        }

        .donations-stat-content small {
          display: block;
          color: #706577;
          margin-top: 7px;
          font-size: 11px;
        }


        /* ============================================
           MAIN SECTION
        ============================================ */

        .donations-section {
          overflow: hidden;
          border-radius: 19px;
          border: 1px solid
            rgba(255,255,255,.075);
          background:
            #110d16;
        }

        .donations-section-header {
          padding: 24px 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid
            rgba(255,255,255,.065);
        }

        .donations-section-header h2 {
          margin: 0;
          color: #f4eff7;
          font-size: 23px;
        }

        .donations-section-header p {
          margin: 7px 0 0;
          color: #74697c;
          font-size: 12px;
        }

        .donations-record-count {
          padding: 8px 12px;
          border-radius: 9px;
          background:
            rgba(245,189,69,.06);
          color: #bba58a;
          font-size: 12px;
          white-space: nowrap;
        }


        /* ============================================
           TOOLBAR
        ============================================ */

        .donations-toolbar {
          padding: 17px 22px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid
            rgba(255,255,255,.055);
        }

        .donations-search {
          height: 46px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 13px;
          border: 1px solid
            rgba(255,255,255,.08);
          border-radius: 11px;
          background: #17111d;
          box-sizing: border-box;
        }

        .donations-search > span {
          color: #74687d;
          font-size: 21px;
        }

        .donations-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #eee8f1;
          font-size: 13px;
        }

        .donations-search input::placeholder {
          color: #5f5667;
        }

        .donations-clear-search {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 7px;
          background:
            rgba(255,255,255,.05);
          color: #8f8396;
          cursor: pointer;
          font-size: 18px;
        }

        .donations-refresh {
          height: 46px;
          padding: 0 16px;
          border: 1px solid
            rgba(255,255,255,.08);
          border-radius: 11px;
          background:
            rgba(255,255,255,.025);
          color: #a99daa;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .donations-refresh:hover {
          color: #f5bd45;
          border-color:
            rgba(245,189,69,.2);
        }


        /* ============================================
           TABLE
        ============================================ */

        .donations-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .donations-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .donations-table th {
          height: 48px;
          padding: 0 18px;
          background: #0f0b13;
          color: #6e6477;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-align: left;
          white-space: nowrap;
          border-bottom: 1px solid
            rgba(255,255,255,.06);
        }

        .donations-table td {
          height: 75px;
          padding: 12px 18px;
          color: #aaa0ae;
          font-size: 13px;
          border-bottom: 1px solid
            rgba(255,255,255,.045);
          vertical-align: middle;
          box-sizing: border-box;
        }

        .donations-table tbody tr {
          transition:
            background .15s ease;
        }

        .donations-table tbody tr:hover {
          background:
            rgba(245,189,69,.025);
        }

        .donations-table tbody tr:last-child td {
          border-bottom: 0;
        }

        /* fixed column widths */

        .donations-table th:nth-child(1),
        .donations-table td:nth-child(1) {
          width: 27%;
        }

        .donations-table th:nth-child(2),
        .donations-table td:nth-child(2) {
          width: 15%;
        }

        .donations-table th:nth-child(3),
        .donations-table td:nth-child(3) {
          width: 12%;
        }

        .donations-table th:nth-child(4),
        .donations-table td:nth-child(4) {
          width: 13%;
        }

        .donations-table th:nth-child(5),
        .donations-table td:nth-child(5) {
          width: 12%;
        }

        .donations-table th:nth-child(6),
        .donations-table td:nth-child(6) {
          width: 12%;
        }

        .donations-table th:nth-child(7),
        .donations-table td:nth-child(7) {
          width: 9%;
        }


        /* ============================================
           DONOR
        ============================================ */

        .donor-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .donor-avatar {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(245,189,69,.08);
          color: #f5bd45;
          font-size: 14px;
          font-weight: 800;
        }

        .donor-cell > div:last-child {
          min-width: 0;
        }

        .donor-cell strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #eee8f1;
          font-size: 13px;
        }

        .donor-cell small {
          display: block;
          margin-top: 4px;
          color: #6e6475;
          font-size: 10px;
        }


        /* ============================================
           TABLE VALUES
        ============================================ */

        .mobile-value {
          color: #aaa0ae;
          white-space: nowrap;
        }

        .table-amount {
          color: #f5bd45;
          font-size: 14px;
          white-space: nowrap;
        }

        .payment-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border-radius: 7px;
          background:
            rgba(255,255,255,.04);
          color: #b4aaba;
          font-size: 11px;
          white-space: nowrap;
        }

        .date-value {
          color: #8d8292;
          font-size: 11px;
          white-space: nowrap;
        }


        /* ============================================
           STATUS
        ============================================ */

        .donation-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .donation-status-badge.received {
          color: #7bd69b;
          background:
            rgba(72,180,105,.08);
          border: 1px solid
            rgba(72,180,105,.12);
        }

        .donation-status-badge.pending {
          color: #f3c36e;
          background:
            rgba(245,189,69,.08);
          border: 1px solid
            rgba(245,189,69,.12);
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }


        /* ============================================
           ACTIONS
        ============================================ */

        .actions-column {
          text-align: center !important;
        }

        .table-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .table-edit-button,
        .table-delete-button {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition:
            transform .15s ease,
            background .15s ease;
        }

        .table-edit-button {
          border: 1px solid
            rgba(245,189,69,.15);
          background:
            rgba(245,189,69,.05);
          color: #e9b74a;
        }

        .table-delete-button {
          border: 1px solid
            rgba(255,86,86,.13);
          background:
            rgba(255,86,86,.04);
          color: #e78686;
        }

        .table-edit-button:hover,
        .table-delete-button:hover {
          transform: translateY(-1px);
        }


        /* ============================================
           LOADING
        ============================================ */

        .donations-loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 13px;
          color: #766b7e;
          font-size: 13px;
        }

        .donations-spinner {
          width: 31px;
          height: 31px;
          border: 3px solid
            rgba(245,189,69,.12);
          border-top-color:
            #f5bd45;
          border-radius: 50%;
          animation:
            donations-spin .8s linear infinite;
        }

        @keyframes donations-spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* ============================================
           EMPTY
        ============================================ */

        .donations-empty {
          min-height: 340px;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .donations-empty-icon {
          width: 65px;
          height: 65px;
          margin-bottom: 16px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(245,189,69,.07);
          color: #f5bd45;
          font-size: 24px;
          font-weight: 800;
        }

        .donations-empty h3 {
          margin: 0;
          color: #eee8f1;
          font-size: 18px;
        }

        .donations-empty p {
          margin: 8px 0 20px;
          color: #716779;
          font-size: 13px;
        }


        /* ============================================
           MODAL
        ============================================ */

        .donations-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(0,0,0,.78);
          backdrop-filter: blur(8px);
          overflow-y: auto;
          box-sizing: border-box;
        }

        .donations-modal {
          width: min(560px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border-radius: 20px;
          border: 1px solid
            rgba(255,255,255,.09);
          background:
            linear-gradient(
              145deg,
              #17111c,
              #100c14
            );
          box-shadow:
            0 30px 90px
            rgba(0,0,0,.55);
        }

        .donations-modal-header {
          padding: 23px 25px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid
            rgba(255,255,255,.065);
        }

        .donations-modal-header h2 {
          margin: 0;
          color: #f6f1f8;
          font-size: 24px;
        }

        .donations-modal-header p {
          margin: 6px 0 0;
          color: #756a7d;
          font-size: 12px;
        }

        .donations-close {
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid
            rgba(255,255,255,.07);
          border-radius: 9px;
          background:
            rgba(255,255,255,.035);
          color: #a99eac;
          font-size: 22px;
          cursor: pointer;
        }


        /* ============================================
           FORM
        ============================================ */

        .donations-form {
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .donations-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .donations-form-group label {
          color: #978b9f;
          font-size: 12px;
          font-weight: 700;
        }

        .donations-form-group input,
        .donations-form-group select {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          box-sizing: border-box;
          outline: none;
          border: 1px solid
            rgba(255,255,255,.08);
          border-radius: 10px;
          background: #1a1420;
          color: #eee8f1;
          font-size: 13px;
        }

        .donations-form-group input:focus,
        .donations-form-group select:focus {
          border-color:
            rgba(245,189,69,.45);
          box-shadow:
            0 0 0 3px
            rgba(245,189,69,.05);
        }

        .donations-form-group input::placeholder {
          color: #62596a;
        }

        .donations-form-group select {
          cursor: pointer;
        }

        .donations-form-group select option {
          background: #17111c;
          color: #eee8f1;
        }


        /* ============================================
           AMOUNT
        ============================================ */

        .donations-amount-input {
          height: 48px;
          display: flex;
          align-items: center;
          border: 1px solid
            rgba(255,255,255,.08);
          border-radius: 10px;
          background: #1a1420;
          overflow: hidden;
        }

        .donations-amount-input > span {
          padding-left: 14px;
          color: #f5bd45;
          font-weight: 800;
        }

        .donations-amount-input input {
          height: 100%;
          border: 0;
          background: transparent;
        }

        .donations-form-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 14px;
        }


        /* ============================================
           INFO
        ============================================ */

        .donations-info-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 12px;
        }

        .donations-info-box {
          padding: 14px;
          border: 1px solid
            rgba(245,189,69,.1);
          border-radius: 10px;
          background:
            rgba(245,189,69,.035);
        }

        .donations-info-box span {
          display: block;
          margin-bottom: 5px;
          color: #766b7c;
          font-size: 8px;
          letter-spacing: 1.4px;
          font-weight: 800;
        }

        .donations-info-box strong {
          color: #f5bd45;
          font-size: 13px;
        }


        /* ============================================
           MODAL BUTTONS
        ============================================ */

        .donations-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .donations-secondary-button {
          min-height: 48px;
          padding: 0 19px;
          border: 1px solid
            rgba(255,255,255,.08);
          border-radius: 10px;
          background:
            rgba(255,255,255,.03);
          color: #b7adbd;
          font-weight: 700;
          cursor: pointer;
        }

        .donations-secondary-button:hover {
          background:
            rgba(255,255,255,.055);
        }


        /* ============================================
           RESPONSIVE
        ============================================ */

        @media (max-width: 1200px) {

          .donations-page {
            padding: 30px 25px 60px;
          }

          .donations-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }


        @media (max-width: 760px) {

          .donations-page {
            padding: 25px 16px 50px;
          }

          .donations-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .donations-header h1 {
            font-size: 34px;
          }

          .donations-primary-button {
            width: 100%;
          }

          .donations-stats {
            grid-template-columns: 1fr;
          }

          .donations-section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .donations-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .donations-refresh {
            width: 100%;
          }

          .donations-form-grid,
          .donations-info-grid {
            grid-template-columns: 1fr;
          }

          .donations-modal-actions {
            flex-direction: column-reverse;
          }

          .donations-modal-actions button {
            width: 100%;
          }

        }


        @media (max-width: 480px) {

          .donations-page {
            padding: 20px 12px 40px;
          }

          .donations-header h1 {
            font-size: 30px;
          }

          .donations-stat-card {
            min-height: 105px;
            padding: 17px;
          }

          .donations-stat-content strong {
            font-size: 21px;
          }

          .donations-section-header {
            padding: 20px;
          }

          .donations-toolbar {
            padding: 14px;
          }

          .donations-form {
            padding: 18px;
          }

        }

        /* ============================================
   RESPONSIVE
============================================ */

@media (max-width: 1200px) {

  .donations-page {
    padding: 30px 25px 60px;
  }

  .donations-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}


/* ============================================
   MOBILE
============================================ */

@media (max-width: 760px) {

  .donations-page {
    padding: 22px 14px 45px;
  }


  /* ------------------------------
     HEADER
  ------------------------------ */

  .donations-header {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    margin-bottom: 22px;
  }

  .donations-header h1 {
    font-size: 30px;
  }

  .donations-header p {
    font-size: 13px;
    line-height: 1.5;
  }

  .donations-primary-button {
    width: 100%;
    min-height: 46px;
  }


  /* ------------------------------
     ERROR
  ------------------------------ */

  .donations-error {
    flex-direction: column;
    align-items: stretch;
  }

  .donations-error button {
    width: 100%;
  }


  /* =================================
     STATISTICS - 2 x 2 GRID
  ================================= */

  .donations-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 18px;
  }

  .donations-stat-card {
    min-height: 92px;
    padding: 13px;
    border-radius: 14px;
    gap: 10px;
  }

  .donations-stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 15px;
  }

  .donations-stat-content span {
    font-size: 7px;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }

  .donations-stat-content strong {
    font-size: 17px;
  }

  .donations-stat-content small {
    margin-top: 4px;
    font-size: 9px;
  }


  /* =================================
     DONATION RECORD SECTION
  ================================= */

  .donations-section {
    border-radius: 15px;
  }

  .donations-section-header {
    padding: 17px 15px;
    gap: 10px;
  }

  .donations-section-header h2 {
    font-size: 20px;
  }

  .donations-section-header p {
    font-size: 10px;
    line-height: 1.4;
  }

  .donations-record-count {
    padding: 6px 9px;
    font-size: 10px;
  }


  /* =================================
     SEARCH / REFRESH
  ================================= */

  .donations-toolbar {
    padding: 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .donations-search {
    height: 42px;
  }

  .donations-search input {
    font-size: 12px;
  }

  .donations-refresh {
    width: 100%;
    height: 40px;
  }


  /* =================================
     MOBILE DONATION LIST
  ================================= */

  .donations-table-wrapper {
    overflow: visible;
    width: 100%;
  }

  .donations-table {
  width: 100%;
  min-width: 0;
  border-collapse: separate;
  border-spacing: 0 14px; /* gap between cards */
  table-layout: auto;
}


  /* Hide desktop table header */

  .donations-table thead {
    display: none;
  }


  /* Each donation becomes a card */

  .donations-table tbody {
    display: block;
    padding: 6px 10px 10px;
  }

  .donations-table tbody tr {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      auto;

    grid-template-areas:
      "donor amount"
      "mobile status"
      "payment date"
      "actions actions";

    gap: 7px 10px;

    width: 100%;
    min-height: auto;

    padding: 12px;

    box-sizing: border-box;

    border: 1px solid rgba(255,255,255,.075);
    border-radius: 13px;

    background:
      linear-gradient(
        145deg,
        #17111e,
        #110d16
      );

    box-shadow:
      0 5px 18px rgba(0,0,0,.12);

    transition:
      transform .15s ease,
      border-color .15s ease;
  }

  .donations-table tbody tr:hover {
    background:
      linear-gradient(
        145deg,
        #191420,
        #120e17
      );

    transform: none;
  }


  /* Remove normal table sizing */

  .donations-table td {
    display: block;

    width: auto !important;
    height: auto !important;

    padding: 0;

    border: 0;

    font-size: 11px;

    min-width: 0;
  }


  /* --------------------------------
     DONOR
  -------------------------------- */

  .donations-table td:nth-child(1) {
    grid-area: donor;
  }

  .donor-cell {
    display: block;
    min-width: 0;
  }


  /* Remove avatar */

  .donor-avatar {
    display: none;
  }


  .donor-cell > div:last-child {
    min-width: 0;
  }

  .donor-cell strong {
    display: block;

    max-width: 100%;

    color: #f4eff7;

    font-size: 13px;
    font-weight: 800;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  /* Remove "Donor" text */

  .donor-cell small {
    display: none;
  }


  /* --------------------------------
     MOBILE
  -------------------------------- */

  .donations-table td:nth-child(2) {
    grid-area: mobile;

    text-align: right;

    align-self: center;
  }

  .donations-table td:nth-child(2)::before {
    content: "";
  }

  .mobile-value {
    color: #b8aebe;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }


  /* --------------------------------
     AMOUNT
  -------------------------------- */

  .donations-table td:nth-child(3) {
    grid-area: amount;

    text-align: right;
    align-self: center;
  }

  .table-amount {
    color: #f5bd45;
    font-size: 13px;
    font-weight: 800;
  }


  /* --------------------------------
     PAYMENT
  -------------------------------- */

  .donations-table td:nth-child(4) {
    grid-area: payment;
    align-self: center;
  }

  .payment-badge {
    padding: 4px 7px;

    border-radius: 6px;

    font-size: 9px;

    background:
      rgba(255,255,255,.035);

    color: #8f8495;
  }


  /* --------------------------------
     STATUS
  -------------------------------- */

  .donations-table td:nth-child(5) {
    grid-area: status;

    text-align: right;
    align-self: center;
  }

  .donation-status-badge {
    padding: 4px 7px;

    gap: 4px;

    font-size: 8px;
  }

  .status-dot {
    width: 4px;
    height: 4px;
  }


  /* --------------------------------
     DATE
  -------------------------------- */

  .donations-table td:nth-child(6) {
    grid-area: date;

    text-align: right;

    align-self: center;
  }

  .date-value {
    font-size: 9px;
    color: #706577;
  }


  /* --------------------------------
     EDIT / DELETE
  -------------------------------- */

  .donations-table td:nth-child(7) {
    grid-area: actions;

    display: flex;

    justify-content: center;
    align-items: center;

    padding-top: 4px;

    border-top: 1px solid
      rgba(255,255,255,.055);
  }

  .table-actions {
    display: flex;

    justify-content: center;
    align-items: center;

    gap: 8px;

    width: 100%;
  }

  .table-edit-button,
  .table-delete-button {
    width: 32px;
    height: 32px;

    border-radius: 8px;

    font-size: 13px;
  }


  /* --------------------------------
     LOADING
  -------------------------------- */

  .donations-loading {
    min-height: 220px;
  }


  /* --------------------------------
     EMPTY
  -------------------------------- */

  .donations-empty {
    min-height: 250px;
    padding: 30px 15px;
  }

  .donations-empty h3 {
    font-size: 16px;
  }

  .donations-empty p {
    font-size: 11px;
  }


  /* --------------------------------
     MODAL
  -------------------------------- */

  .donations-modal-overlay {
    padding: 10px;
    align-items: flex-end;
  }

  .donations-modal {
    width: 100%;
    max-height: calc(100vh - 20px);

    border-radius: 18px 18px 0 0;
  }

  .donations-modal-header {
    padding: 18px;
  }

  .donations-modal-header h2 {
    font-size: 20px;
  }

  .donations-form {
    padding: 18px;
    gap: 14px;
  }

  .donations-form-grid,
  .donations-info-grid {
    grid-template-columns: 1fr;
  }

  .donations-modal-actions {
    flex-direction: column-reverse;
  }

  .donations-modal-actions button {
    width: 100%;
  }

}


/* ============================================
   EXTRA SMALL MOBILE
============================================ */

@media (max-width: 480px) {

  .donations-page {
    padding: 18px 10px 35px;
  }

  .donations-header h1 {
    font-size: 28px;
  }

  .donations-header p {
    font-size: 12px;
  }


  /* Smaller 2 x 2 statistics */

  .donations-stats {
    gap: 8px;
  }

  .donations-stat-card {
    min-height: 84px;
    padding: 11px;
    gap: 8px;
  }

  .donations-stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 13px;
  }

  .donations-stat-content strong {
    font-size: 15px;
  }

  .donations-stat-content small {
    font-size: 8px;
  }


  /* Donation cards */

  .donations-table tbody {
    padding: 5px 7px 8px;
  }

  .donations-table tbody tr {
    padding: 11px;

    grid-template-columns:
      minmax(0, 1fr)
      auto;

    gap: 6px 8px;

    border-radius: 12px;
  }

  .donor-cell strong {
    font-size: 12px;
  }

  .mobile-value {
    font-size: 10px;
  }

  .table-amount {
    font-size: 12px;
  }

  .payment-badge {
    font-size: 8px;
  }

  .donation-status-badge {
    font-size: 7px;
  }

  .date-value {
    font-size: 8px;
  }


  /* Search */

  .donations-toolbar {
    padding: 10px;
  }

  .donations-search {
    height: 40px;
  }


  /* Modal */

  .donations-form {
    padding: 15px;
  }

}

      `}</style>

    </div>
  );
}


export default Donations;