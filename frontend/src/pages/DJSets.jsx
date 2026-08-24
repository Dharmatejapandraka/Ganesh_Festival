import React, { useEffect, useMemo, useState } from "react";
import {
  get,
  post,
  del,
} from "../utils/api";

const API_BASE_URL = "http://localhost:5000";

const DJSets = () => {
  const [djSets, setDjSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(2026);

  const [showModal, setShowModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [form, setForm] = useState({
    djName: "",
    city: "",
    mobile: "",
    totalAmount: "",
    advanceAmount: "",
    festivalYear: 2026,
    image: null,
  });

  // =====================================================
  // LOAD DJ SETS
  // =====================================================

  const loadDJSets = async () => {
    try {
      setLoading(true);

      console.log(
        "Loading DJ sets for year:",
        selectedYear
      );

      const response = await get(
        `/dj-sets?year=${selectedYear}`
      );

      console.log(
        "DJ SET FRONTEND RESPONSE:",
        response
      );

      if (response?.success) {
        setDjSets(
          Array.isArray(response.djSets)
            ? response.djSets
            : []
        );
      } else {
        setDjSets([]);
      }

    } catch (error) {
      console.error(
        "LOAD DJ SETS ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to load DJ sets."
      );

      setDjSets([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN YEAR CHANGES
  // =====================================================

  useEffect(() => {
    loadDJSets();
  }, [selectedYear]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      files,
    } = event.target;

    if (name === "image") {
      setForm((previous) => ({
        ...previous,
        image:
          files && files.length > 0
            ? files[0]
            : null,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openAddModal = () => {
    setForm({
      djName: "",
      city: "",
      mobile: "",
      totalAmount: "",
      advanceAmount: "",
      festivalYear: selectedYear,
      image: null,
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
  };

  // =====================================================
  // ADD DJ SET
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.djName.trim()) {
      alert("DJ name is required");
      return;
    }

    if (!form.city.trim()) {
      alert("City is required");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      alert(
        "Enter a valid 10-digit mobile number"
      );
      return;
    }

    if (
      form.totalAmount === "" ||
      Number(form.totalAmount) < 0
    ) {
      alert(
        "Enter a valid total amount"
      );
      return;
    }

    if (
      form.advanceAmount === "" ||
      Number(form.advanceAmount) < 0
    ) {
      alert(
        "Enter a valid advance amount"
      );
      return;
    }

    if (
      Number(form.advanceAmount) >
      Number(form.totalAmount)
    ) {
      alert(
        "Advance amount cannot be greater than total amount"
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "djName",
        form.djName.trim()
      );

      formData.append(
        "city",
        form.city.trim()
      );

      formData.append(
        "mobile",
        form.mobile.trim()
      );

      formData.append(
        "totalAmount",
        form.totalAmount
      );

      formData.append(
        "advanceAmount",
        form.advanceAmount
      );

      formData.append(
        "festivalYear",
        selectedYear
      );

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      const response = await post(
        "/dj-sets",
        formData
      );

      console.log(
        "ADD DJ RESPONSE:",
        response
      );

      if (response?.success) {
        alert(
          "DJ set added successfully."
        );

        setShowModal(false);

        // Immediately reload from MongoDB
        await loadDJSets();

      } else {
        alert(
          response?.message ||
            "Failed to add DJ set."
        );
      }

    } catch (error) {
      console.error(
        "ADD DJ SET ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to add DJ set."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE DJ SET
  // =====================================================

  const handleDelete = async (id) => {
    if (!id) {
      alert("DJ set ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this DJ set?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await del(
        `/dj-sets/${id}`
      );

      console.log(
        "DELETE DJ RESPONSE:",
        response
      );

      if (response?.success) {
        alert(
          "DJ set deleted successfully."
        );

        // Remove immediately from screen
        setDjSets((previous) =>
          previous.filter(
            (item) =>
              item._id !== id
          )
        );

      } else {
        alert(
          response?.message ||
            "Failed to delete DJ set."
        );
      }

    } catch (error) {
      console.error(
        "DELETE DJ SET ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete DJ set."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDJSets = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    if (!text) {
      return djSets;
    }

    return djSets.filter((dj) => {
      return (
        String(dj.djName || "")
          .toLowerCase()
          .includes(text) ||

        String(dj.city || "")
          .toLowerCase()
          .includes(text) ||

        String(dj.mobile || "")
          .toLowerCase()
          .includes(text)
      );
    });
  }, [djSets, search]);

  // =====================================================
  // TOTALS
  // =====================================================

  const totalAmount = useMemo(() => {
    return filteredDJSets.reduce(
      (sum, dj) =>
        sum +
        Number(dj.totalAmount || 0),
      0
    );
  }, [filteredDJSets]);

  const totalAdvance = useMemo(() => {
    return filteredDJSets.reduce(
      (sum, dj) =>
        sum +
        Number(dj.advanceAmount || 0),
      0
    );
  }, [filteredDJSets]);

  const totalBalance =
    totalAmount - totalAdvance;

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_BASE_URL}${image}`;
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="dj-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dj-header">

        <div>
          <div className="dj-eyebrow">
            GANESH UTSAVAM {selectedYear}
          </div>

          <h1>DJ Set</h1>

          <p>
            Manage DJ bookings and payment
            details.
          </p>
        </div>

        <button
          className="dj-add-btn"
          onClick={openAddModal}
        >
          <span>＋</span>
          Add DJ Set
        </button>

      </div>

      {/* =================================================
          YEAR
      ================================================= */}

      <div className="dj-year-box">

        <span>FESTIVAL YEAR</span>

        <select
          value={selectedYear}
          onChange={(event) =>
            setSelectedYear(
              Number(event.target.value)
            )
          }
        >
          <option value={2026}>
            2026
          </option>

          <option value={2027}>
            2027
          </option>

          <option value={2028}>
            2028
          </option>

          <option value={2029}>
            2029
          </option>
        </select>

      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="dj-stats">

        <div className="dj-stat-card">

          <div className="dj-stat-icon">
            🎧
          </div>

          <div>
            <small>DJ SETS</small>

            <strong>
              {filteredDJSets.length}
            </strong>

            <span>
              {selectedYear} bookings
            </span>
          </div>

        </div>

        <div className="dj-stat-card">

          <div className="dj-stat-icon">
            ₹
          </div>

          <div>
            <small>TOTAL AMOUNT</small>

            <strong>
              {money(totalAmount)}
            </strong>

            <span>
              Total booking amount
            </span>
          </div>

        </div>

        <div className="dj-stat-card">

          <div className="dj-stat-icon">
            ✓
          </div>

          <div>
            <small>ADVANCE PAID</small>

            <strong>
              {money(totalAdvance)}
            </strong>

            <span>
              Amount paid
            </span>
          </div>

        </div>

        <div className="dj-stat-card">

          <div className="dj-stat-icon">
            ◇
          </div>

          <div>
            <small>BALANCE</small>

            <strong>
              {money(totalBalance)}
            </strong>

            <span>
              Amount remaining
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="dj-search-row">

        <div className="dj-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search DJ name, city or mobile..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <span className="dj-count">
          {filteredDJSets.length} DJ sets
        </span>

      </div>

      {/* =================================================
          RECORD SECTION
      ================================================= */}

      <section className="dj-record-section">

        <div className="dj-record-header">

          <div>
            <div className="dj-eyebrow">
              {selectedYear} BOOKINGS
            </div>

            <h2>
              DJ Set Records
            </h2>

            <p>
              All DJ bookings for the
              selected festival year.
            </p>
          </div>

          <div className="dj-record-total">
            {money(totalAmount)}
          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="dj-empty">
            <div className="dj-loading">
              Loading DJ sets...
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredDJSets.length === 0 && (
            <div className="dj-empty">

              <div className="dj-empty-icon">
                🎧
              </div>

              <h3>
                No DJ sets found
              </h3>

              <p>
                {search
                  ? "Try a different search."
                  : `No DJ bookings for ${selectedYear} yet.`}
              </p>

              {!search && (
                <button
                  className="dj-add-btn"
                  onClick={
                    openAddModal
                  }
                >
                  ＋ Add DJ Set
                </button>
              )}

            </div>
          )}

        {/* =================================================
            DJ CARDS
        ================================================= */}

        {!loading &&
          filteredDJSets.length > 0 && (

            <div className="dj-grid">

              {filteredDJSets.map(
                (dj) => {

                  const balance =
                    Number(
                      dj.totalAmount || 0
                    ) -
                    Number(
                      dj.advanceAmount || 0
                    );

                  return (
                    <article
                      className="dj-card"
                      key={dj._id}
                    >

                      {/* IMAGE */}

                    <div
                      className="dj-image-wrapper"
                      onClick={() => {
                        if (dj.image) {
                          setSelectedImage(
                            getImageUrl(dj.image)
                          );
                        }
                      }}
                      title={
                        dj.image
                          ? "Click to view full image"
                          : ""
                      }
                    >
                      {dj.image ? (
                        <img
                          src={getImageUrl(dj.image)}
                          alt={dj.djName}
                          className="dj-image"
                        />
                      ) : (
                        <div className="dj-image-placeholder">
                          🎧
                        </div>
                      )}

                      {dj.image && (
                        <div className="dj-image-overlay">
                          <span>🔍</span>
                          <span>View Photo</span>
                        </div>
                      )}
                    </div>

                      {/* CONTENT */}

                      <div className="dj-card-content">

                        <div className="dj-card-top">

                          <div>

                            <h3>
                              {dj.djName}
                            </h3>

                            <div className="dj-location">
                              📍 {dj.city}
                            </div>

                            <div className="dj-mobile">
                              📱 {dj.mobile}
                            </div>

                          </div>

                          <span className="dj-year-tag">
                            {dj.festivalYear}
                          </span>

                        </div>

                        {/* MONEY */}

                        <div className="dj-money">

                          <div>
                            <small>
                              TOTAL
                            </small>

                            <strong>
                              {money(
                                dj.totalAmount
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              ADVANCE
                            </small>

                            <strong>
                              {money(
                                dj.advanceAmount
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              BALANCE
                            </small>

                            <strong
                              className={
                                balance > 0
                                  ? "balance-due"
                                  : "balance-clear"
                              }
                            >
                              {money(
                                balance
                              )}
                            </strong>
                          </div>

                        </div>

                        {/* FOOTER */}

                        <div className="dj-card-footer">

                          <span>
                            Added{" "}
                            {formatDate(
                              dj.createdAt
                            )}
                          </span>

                          <div className="dj-actions">

                            <button
                              className="dj-edit-btn"
                              onClick={() =>
                                alert(
                                  "Edit feature can be added next."
                                )
                              }
                            >
                              ✏ Edit
                            </button>

                            <button
                              className="dj-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  dj._id
                                )
                              }
                            >
                              🗑 Delete
                            </button>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

      {/* =================================================
          ADD DJ MODAL
      ================================================= */}

      {showModal && (

        <div
          className="dj-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="dj-modal">

            <div className="dj-modal-header">

              <div>
                <div className="dj-eyebrow">
                  {selectedYear} BOOKINGS
                </div>

                <h2>
                  Add DJ Set
                </h2>

                <p>
                  Enter the DJ booking details.
                </p>
              </div>

              <button
                className="dj-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              <div className="dj-form-grid">

                <div className="dj-field">

                  <label>
                    DJ Name *
                  </label>

                  <input
                    name="djName"
                    value={
                      form.djName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter DJ name"
                  />

                </div>

                <div className="dj-field">

                  <label>
                    City *
                  </label>

                  <input
                    name="city"
                    value={
                      form.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter city"
                  />

                </div>

                <div className="dj-field">

                  <label>
                    Mobile Number *
                  </label>

                  <input
                    name="mobile"
                    value={
                      form.mobile
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={10}
                    placeholder="10-digit mobile"
                  />

                </div>

                <div className="dj-field">

                  <label>
                    Total Amount *
                  </label>

                  <input
                    type="number"
                    name="totalAmount"
                    value={
                      form.totalAmount
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    placeholder="₹ Total amount"
                  />

                </div>

                <div className="dj-field">

                  <label>
                    Advance Amount *
                  </label>

                  <input
                    type="number"
                    name="advanceAmount"
                    value={
                      form.advanceAmount
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    placeholder="₹ Advance"
                  />

                </div>

                <div className="dj-field">

                  <label>
                    DJ Photo
                  </label>

                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              {/* PREVIEW */}

              <div className="dj-form-summary">

                <div>
                  <span>
                    Festival Year
                  </span>

                  <strong>
                    {selectedYear}
                  </strong>
                </div>

                <div>
                  <span>
                    Balance
                  </span>

                  <strong>
                    {money(
                      Number(
                        form.totalAmount || 0
                      ) -
                        Number(
                          form.advanceAmount || 0
                        )
                    )}
                  </strong>
                </div>

              </div>

              <div className="dj-modal-actions">

                <button
                  type="button"
                  className="dj-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dj-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save DJ Set"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
    IMAGE PREVIEW MODAL
================================================= */}

{selectedImage && (
  <div
    className="dj-photo-overlay"
    onClick={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setSelectedImage(null);
      }
    }}
  >

    <div className="dj-photo-viewer">

      <button
        className="dj-photo-close"
        onClick={() =>
          setSelectedImage(null)
        }
      >
        ×
      </button>

      <img
        src={selectedImage}
        alt="DJ Full Preview"
        className="dj-full-image"
      />

      <div className="dj-photo-actions">

        <a
          href={selectedImage}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="dj-download-btn"
        >
          ⬇ Download Photo
        </a>

        <a
          href={selectedImage}
          target="_blank"
          rel="noopener noreferrer"
          className="dj-open-btn"
        >
          ↗ Open Original
        </a>

      </div>

    </div>

  </div>
)}

      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
   PHOTO CLICK / PREVIEW
===================================================== */

            .dj-image-wrapper {
              position: relative;
              width: 180px;
              height: 100%;
              min-height: 260px;
              background: #19131d;
              overflow: hidden;
              cursor: pointer;
            }

            .dj-image {
              width: 100%;
              height: 100%;
              min-height: 260px;
              object-fit: cover;
              display: block;
              transition: transform 0.3s ease;
            }

            .dj-image-wrapper:hover .dj-image {
              transform: scale(1.04);
            }

            .dj-image-overlay {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 5px;
              background: rgba(0, 0, 0, 0.48);
              color: white;
              opacity: 0;
              transition: opacity 0.25s ease;
              font-size: 12px;
              font-weight: 700;
            }

            .dj-image-wrapper:hover .dj-image-overlay {
              opacity: 1;
            }

            .dj-image-overlay span:first-child {
              font-size: 28px;
            }

            /* =====================================================
              FULL SCREEN PHOTO VIEWER
            ===================================================== */

            .dj-photo-overlay {
              position: fixed;
              inset: 0;
              z-index: 10000;

              display: flex;
              align-items: center;
              justify-content: center;

              padding: 30px;

              background: rgba(
                0,
                0,
                0,
                0.88
              );

              backdrop-filter: blur(10px);
            }

            .dj-photo-viewer {
              position: relative;

              width: min(
                900px,
                95vw
              );

              max-height: 92vh;

              display: flex;
              flex-direction: column;
              align-items: center;

              padding: 20px;

              border: 1px solid #3b303f;
              border-radius: 18px;

              background: #110c15;

              box-shadow:
                0 30px 100px
                rgba(0, 0, 0, 0.7);
            }

            .dj-full-image {
              display: block;

              max-width: 100%;
              max-height: 72vh;

              object-fit: contain;

              border-radius: 10px;
            }

            .dj-photo-close {
              position: absolute;

              top: 12px;
              right: 12px;

              z-index: 2;

              width: 40px;
              height: 40px;

              border: 1px solid #514451;
              border-radius: 10px;

              background: rgba(
                20,
                15,
                25,
                0.9
              );

              color: white;

              font-size: 27px;

              cursor: pointer;
            }

            .dj-photo-close:hover {
              background: #2a1c20;
              color: #ff7777;
            }

            .dj-photo-actions {
              display: flex;

              gap: 10px;

              margin-top: 18px;
            }

            .dj-download-btn,
            .dj-open-btn {
              display: inline-flex;

              align-items: center;
              justify-content: center;

              padding: 11px 18px;

              border-radius: 10px;

              text-decoration: none;

              font-size: 13px;
              font-weight: 800;

              cursor: pointer;
            }

            .dj-download-btn {
              background: linear-gradient(
                135deg,
                #ffd45b,
                #e8aa22
              );

              color: #171009;
            }

            .dj-open-btn {
              border: 1px solid #3c323f;

              background: #19121e;

              color: #c8bfce;
            }

            .dj-download-btn:hover {
              transform: translateY(-1px);
            }

            .dj-open-btn:hover {
              border-color: #80662c;
              color: #f4bd38;
            }

        .dj-page {
          width: 100%;
          min-height: 100%;
          padding: 34px 40px 70px;
          color: #f8f5ff;
        }

        /* HEADER */

        .dj-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-bottom: 28px;
        }

        .dj-eyebrow {
          color: #f4bd38;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .dj-header h1 {
          margin: 0;
          font-size: 46px;
          line-height: 1.1;
          font-weight: 800;
        }

        .dj-header p {
          margin: 10px 0 0;
          color: #a59caf;
          font-size: 16px;
        }

        .dj-add-btn {
          border: none;
          background: linear-gradient(
            135deg,
            #ffd45b,
            #e8aa22
          );
          color: #18100a;
          padding: 14px 22px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 12px 30px
            rgba(236, 178, 42, 0.18);
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .dj-add-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 15px 35px
            rgba(236, 178, 42, 0.28);
        }

        .dj-add-btn span {
          font-size: 18px;
        }

        /* YEAR */

        .dj-year-box {
          display: flex;
          align-items: center;
          gap: 14px;
          width: fit-content;
          margin-left: auto;
          margin-bottom: 26px;
          padding: 10px 14px;
          border: 1px solid #2d2634;
          border-radius: 14px;
          background: #100c15;
        }

        .dj-year-box span {
          color: #7d7387;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .dj-year-box select {
          border: 1px solid #3a3040;
          background: #17111c;
          color: white;
          border-radius: 9px;
          padding: 9px 35px 9px 12px;
          outline: none;
          font-weight: 700;
        }

        /* STATS */

        .dj-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .dj-stat-card {
          min-width: 0;
          padding: 22px;
          border: 1px solid #2c2533;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              #151019,
              #0f0b13
            );
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dj-stat-icon {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #2b2117;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f7bd37;
          font-size: 23px;
          font-weight: 800;
        }

        .dj-stat-card small {
          display: block;
          color: #8b7e95;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
          margin-bottom: 6px;
        }

        .dj-stat-card strong {
          display: block;
          font-size: 27px;
          line-height: 1.1;
        }

        .dj-stat-card span {
          display: block;
          margin-top: 6px;
          color: #756b7e;
          font-size: 12px;
        }

        /* SEARCH */

        .dj-search-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .dj-search {
          flex: 1;
          height: 54px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border: 1px solid #2d2634;
          border-radius: 14px;
          background: #100c15;
        }

        .dj-search span {
          font-size: 18px;
        }

        .dj-search input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 14px;
        }

        .dj-search input::placeholder {
          color: #71677a;
        }

        .dj-search button {
          border: none;
          background: transparent;
          color: #8e8297;
          font-size: 22px;
          cursor: pointer;
        }

        .dj-count {
          color: #8c8095;
          white-space: nowrap;
          font-size: 13px;
        }

        /* RECORD */

        .dj-record-section {
          border: 1px solid #2c2533;
          border-radius: 20px;
          overflow: hidden;
          background: #0e0a12;
        }

        .dj-record-header {
          padding: 25px 28px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #28222e;
        }

        .dj-record-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .dj-record-header p {
          margin: 8px 0 0;
          color: #776d81;
          font-size: 13px;
        }

        .dj-record-total {
          color: #f5bd3c;
          font-size: 20px;
          font-weight: 800;
        }

        /* GRID */

        .dj-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 20px;
        }

        /* CARD */

        .dj-card {
          min-width: 0;
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          overflow: hidden;
          border: 1px solid #2d2634;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              #151019,
              #0f0b13
            );
          transition: 0.2s ease;
        }

        .dj-card:hover {
          border-color: #72551e;
          transform: translateY(-2px);
        }

        .dj-image-wrapper {
          width: 180px;
          height: 100%;
          min-height: 260px;
          background: #19131d;
          overflow: hidden;
        }

        .dj-image {
          width: 100%;
          height: 100%;
          min-height: 260px;
          object-fit: cover;
          display: block;
        }

        .dj-image-placeholder {
          width: 100%;
          height: 100%;
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 45px;
          color: #806b37;
        }

        .dj-card-content {
          min-width: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .dj-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .dj-card-top h3 {
          margin: 0;
          font-size: 23px;
          font-weight: 800;
          word-break: break-word;
        }

        .dj-location,
        .dj-mobile {
          margin-top: 8px;
          color: #a097aa;
          font-size: 13px;
          word-break: break-word;
        }

        .dj-year-tag {
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 8px;
          background: #2b2117;
          color: #eab33a;
          font-size: 11px;
          font-weight: 800;
        }

        /* MONEY */

        .dj-money {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: auto;
          padding-top: 22px;
        }

        .dj-money > div {
          min-width: 0;
          padding: 10px;
          border-radius: 10px;
          background: #0a0710;
          border: 1px solid #211b27;
        }

        .dj-money small {
          display: block;
          color: #746a7d;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .dj-money strong {
          display: block;
          font-size: 14px;
          white-space: nowrap;
        }

        .balance-due {
          color: #f4bd38;
        }

        .balance-clear {
          color: #6bd58b;
        }

        /* FOOTER */

        .dj-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #29232e;
        }

        .dj-card-footer > span {
          color: #6f6678;
          font-size: 11px;
          white-space: nowrap;
        }

        .dj-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .dj-actions button {
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .dj-edit-btn {
          border: 1px solid #3a303f;
          background: #17111c;
          color: #c8bfce;
        }

        .dj-edit-btn:hover {
          border-color: #80662c;
          color: #f4bd38;
        }

        .dj-delete-btn {
          border: 1px solid #5a2727;
          background: #241113;
          color: #ff7777;
        }

        .dj-delete-btn:hover {
          background: #48191b;
          border-color: #c74747;
        }

        /* EMPTY */

        .dj-empty {
          min-height: 300px;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .dj-empty-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #241c15;
          font-size: 28px;
          margin-bottom: 15px;
        }

        .dj-empty h3 {
          margin: 0;
          font-size: 20px;
        }

        .dj-empty p {
          color: #776d81;
          margin: 8px 0 20px;
        }

        .dj-loading {
          color: #a99eae;
        }

        /* MODAL */

        .dj-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            0,
            0,
            0,
            0.76
          );
          backdrop-filter: blur(7px);
        }

        .dj-modal {
          width: min(
            760px,
            100%
          );
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #3b303f;
          border-radius: 22px;
          background: #110c15;
          box-shadow:
            0 30px 100px
            rgba(0, 0, 0, 0.6);
        }

        .dj-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px;
          border-bottom: 1px solid #2c2532;
        }

        .dj-modal-header h2 {
          margin: 0;
          font-size: 27px;
        }

        .dj-modal-header p {
          margin: 7px 0 0;
          color: #7e7485;
          font-size: 13px;
        }

        .dj-modal-close {
          width: 38px;
          height: 38px;
          border: 1px solid #3a303f;
          border-radius: 10px;
          background: #18121d;
          color: #aaa0ad;
          font-size: 25px;
          cursor: pointer;
        }

        .dj-modal form {
          padding: 25px;
        }

        .dj-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .dj-field {
          min-width: 0;
        }

        .dj-field label {
          display: block;
          margin-bottom: 7px;
          color: #9b91a0;
          font-size: 12px;
          font-weight: 700;
        }

        .dj-field input {
          width: 100%;
          height: 46px;
          border: 1px solid #332b39;
          border-radius: 10px;
          background: #18121d;
          color: white;
          padding: 0 13px;
          outline: none;
        }

        .dj-field input:focus {
          border-color: #b4862b;
        }

        .dj-form-summary {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .dj-form-summary > div {
          padding: 15px;
          border: 1px solid #2b2431;
          border-radius: 12px;
          background: #0c0910;
        }

        .dj-form-summary span {
          display: block;
          color: #726879;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .dj-form-summary strong {
          color: #f5bd3c;
          font-size: 20px;
        }

        .dj-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .dj-cancel-btn,
        .dj-save-btn {
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .dj-cancel-btn {
          border: 1px solid #3b313f;
          background: #17111c;
          color: #b5abb9;
        }

        .dj-save-btn {
          border: none;
          background: linear-gradient(
            135deg,
            #ffd45b,
            #e8aa22
          );
          color: #171009;
        }

        .dj-save-btn:disabled,
        .dj-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {

          .dj-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dj-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 700px) {


        .dj-image-wrapper {
          width: 100%;
          height: 240px;
          min-height: 0;
        }

        .dj-image {
          min-height: 0;
        }

        .dj-photo-overlay {
          padding: 10px;
        }

        .dj-photo-viewer {
          width: 100%;
          padding: 12px;
        }

        .dj-full-image {
          max-height: 75vh;
        }

        .dj-photo-actions {
          width: 100%;
          flex-direction: column;
        }

        .dj-download-btn,
        .dj-open-btn {
          width: 100%;
        }
          .dj-page {
            padding: 25px 16px 50px;
          }

          .dj-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .dj-header h1 {
            font-size: 34px;
          }

          .dj-year-box {
            margin-left: 0;
          }

          .dj-stats {
            grid-template-columns: 1fr;
          }

          .dj-search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .dj-count {
            text-align: right;
          }

          .dj-record-header {
            padding: 20px;
          }

          .dj-grid {
            padding: 12px;
          }

          .dj-card {
            grid-template-columns: 1fr;
          }

          .dj-image-wrapper {
            width: 100%;
            height: 240px;
            min-height: 0;
          }

          .dj-image {
            min-height: 0;
          }

          .dj-image-placeholder {
            min-height: 0;
          }

          .dj-form-grid {
            grid-template-columns: 1fr;
          }

          .dj-modal-overlay {
            padding: 12px;
          }

          .dj-modal {
            max-height: 95vh;
          }

          .dj-card-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .dj-actions {
            width: 100%;
          }

          .dj-actions button {
            flex: 1;
          }

        }

      `}</style>

    </div>
  );
};

export default DJSets;