import React, {
  useEffect,
  useState,
} from "react";

import { useFestival } from "../context/FestivalContext";
import { apiFetch } from "../utils/api";


// =====================================================
// NIMARGANAM
// =====================================================

function Nimarganam() {

  const {
    currentYear,
  } = useFestival();


  // =====================================================
  // STATE
  // =====================================================

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [driveLink, setDriveLink] =
    useState("");


  // =====================================================
  // FETCH
  // =====================================================

  const fetchRecords = async () => {

    try {

      setLoading(true);


      const data =
        await apiFetch(
          `/api/nimarganam?year=${currentYear}`
        );


      console.log(
        "NIMARGANAM RESPONSE:",
        data
      );


      setRecords(
        Array.isArray(data?.records)
          ? data.records
          : []
      );


    } catch (error) {

      console.error(
        "FETCH NIMARGANAM ERROR:",
        error
      );


      setRecords([]);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD WHEN YEAR CHANGES
  // =====================================================

  useEffect(() => {

    fetchRecords();

  }, [currentYear]);


  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openModal = () => {

    setDriveLink("");

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

    setDriveLink("");

  };


  // =====================================================
  // ADD LINK
  // =====================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (!driveLink.trim()) {

      alert(
        "Please enter Google Drive link."
      );


      return;

    }


    try {

      setSaving(true);


      const data =
        await apiFetch(
          "/api/nimarganam",
          {
            method: "POST",

            body: JSON.stringify({
              driveLink:
                driveLink.trim(),

              festivalYear:
                Number(currentYear),
            }),
          }
        );


      console.log(
        "ADD NIMARGANAM RESPONSE:",
        data
      );


      if (
        data?.success === false
      ) {

        throw new Error(
          data?.message ||
          "Failed to add Drive link"
        );

      }


      alert(
        data?.message ||
        "Drive link added successfully."
      );


      closeModal();


      await fetchRecords();


    } catch (error) {

      console.error(
        "ADD LINK ERROR:",
        error
      );


      alert(
        error.message ||
        "Failed to add Drive link"
      );


    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this Drive link?"
      );


    if (!confirmed) {

      return;

    }


    try {

      const data =
        await apiFetch(
          `/api/nimarganam/${id}`,
          {
            method: "DELETE",
          }
        );


      console.log(
        "DELETE NIMARGANAM RESPONSE:",
        data
      );


      if (
        data?.success === false
      ) {

        throw new Error(
          data?.message ||
          "Failed to delete link"
        );

      }


      alert(
        data?.message ||
        "Drive link deleted successfully."
      );


      await fetchRecords();


    } catch (error) {

      console.error(
        "DELETE LINK ERROR:",
        error
      );


      alert(
        error.message ||
        "Failed to delete link"
      );

    }

  };


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    date
  ) => {

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
        month: "2-digit",
        year: "numeric",
      }
    );

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="nimarganam-page">


      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="nimarganam-header">

        <div>

          <div className="nimarganam-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>


          <h1>
            Nimarganam
          </h1>


          <p>
            Access and manage Nimarganam
            festival videos.
          </p>

        </div>


        <button
          className="nimarganam-primary-button"
          onClick={openModal}
        >
          + Add Drive Link
        </button>

      </section>


      {/* ==========================================
          STATS
      ========================================== */}

      <section className="nimarganam-stats">


        {/* DRIVE LINKS */}

        <div className="nimarganam-stat-card">

          <div className="nimarganam-stat-icon">
            ▶
          </div>


          <div>

            <span>
              Drive Links
            </span>


            <strong>
              {records.length}
            </strong>


            <small>
              {currentYear}
            </small>

          </div>

        </div>


        {/* STORAGE */}

        <div className="nimarganam-stat-card">

          <div className="nimarganam-stat-icon">
            📁
          </div>


          <div>

            <span>
              Storage
            </span>


            <strong>
              Google Drive
            </strong>


            <small>
              Festival videos
            </small>

          </div>

        </div>


        {/* FESTIVAL YEAR */}

        <div className="nimarganam-stat-card">

          <div className="nimarganam-stat-icon">
            ✓
          </div>


          <div>

            <span>
              Festival Year
            </span>


            <strong>
              {currentYear}
            </strong>


            <small>
              Current year
            </small>

          </div>

        </div>


      </section>


      {/* ==========================================
          CONTENT
      ========================================== */}

      <section className="nimarganam-section">


        <div className="nimarganam-section-header">

          <div>

            <div className="nimarganam-eyebrow">
              {currentYear} VIDEOS
            </div>


            <h2>
              Nimarganam Videos
            </h2>

          </div>


          <span>

            {records.length}{" "}

            {records.length === 1
              ? "link"
              : "links"}

          </span>

        </div>


        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (

          <div className="nimarganam-empty">

            <div className="nimarganam-empty-icon">
              ⏳
            </div>


            <h3>
              Loading...
            </h3>

          </div>

        )}


        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading &&
          records.length === 0 && (

            <div className="nimarganam-empty">

              <div className="nimarganam-empty-icon">
                ▶
              </div>


              <h3>
                No Drive Links
              </h3>


              <p>
                Add the Google Drive link
                containing your Nimarganam
                video.
              </p>


              <button
                className="nimarganam-primary-button"
                onClick={openModal}
              >
                + Add Drive Link
              </button>

            </div>

          )}


        {/* ==========================================
            LIST
        ========================================== */}

        {!loading &&
          records.length > 0 && (

            <div className="nimarganam-list">

              {records.map(
                (record) => (

                  <div
                    className="nimarganam-card"
                    key={record._id}
                  >


                    <div className="nimarganam-card-icon">
                      ▶
                    </div>


                    <div className="nimarganam-card-info">

                      <span className="nimarganam-label">
                        GOOGLE DRIVE
                      </span>


                      <h3>
                        Nimarganam Video
                      </h3>


                      <p>
                        Added on{" "}
                        {formatDate(
                          record.createdAt
                        )}
                      </p>

                    </div>


                    <div className="nimarganam-card-actions">

                      <a
                        href={
                          record.driveLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nimarganam-open-button"
                      >
                        Open Drive ↗
                      </a>


                      <button
                        className="nimarganam-delete-button"
                        onClick={() =>
                          handleDelete(
                            record._id
                          )
                        }
                        title="Delete Drive link"
                      >
                        🗑
                      </button>

                    </div>


                  </div>

                )
              )}

            </div>

          )}

      </section>


      {/* ==========================================
          ADD MODAL
      ========================================== */}

      {showModal && (

        <div
          className="nimarganam-modal-overlay"

          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {

              closeModal();

            }

          }}
        >


          <div className="nimarganam-modal">


            {/* HEADER */}

            <div className="nimarganam-modal-header">

              <div>

                <div className="nimarganam-eyebrow">
                  {currentYear} VIDEO
                </div>


                <h2>
                  Add Drive Link
                </h2>

              </div>


              <button
                className="nimarganam-close"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="nimarganam-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="nimarganam-form-group">

                <label>
                  Google Drive Link
                </label>


                <input
                  type="url"
                  value={driveLink}
                  onChange={(
                    event
                  ) =>
                    setDriveLink(
                      event.target.value
                    )
                  }
                  placeholder="https://drive.google.com/..."
                  required
                />


                <small>
                  Paste the Google Drive
                  sharing link here.
                </small>

              </div>


              {/* DATE */}

              <div className="nimarganam-date">

                <div>

                  <span>
                    DATE
                  </span>


                  <strong>
                    {new Date()
                      .toLocaleDateString(
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
                  Date is automatically
                  recorded.
                </small>

              </div>


              {/* ACTIONS */}

              <div className="nimarganam-modal-actions">

                <button
                  type="button"
                  className="nimarganam-secondary-button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="nimarganam-primary-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Drive Link"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==========================================
          CSS
      ========================================== */}

      <style>{`

        .nimarganam-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        .nimarganam-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 32px;
        }


        .nimarganam-eyebrow {
          color: #f5bd45;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }


        .nimarganam-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 42px;
          font-weight: 800;
        }


        .nimarganam-header p {
          color: #8d8297;
          margin: 10px 0 0;
        }


        .nimarganam-primary-button {
          border: none;
          border-radius: 11px;
          padding: 13px 20px;

          background:
            linear-gradient(
              135deg,
              #ffd76c,
              #efb43b
            );

          color: #241909;
          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .nimarganam-primary-button:hover {
          transform: translateY(-2px);
        }


        .nimarganam-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* STATS */

        .nimarganam-stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 20px;

          margin-bottom: 25px;
        }


        .nimarganam-stat-card {
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


        .nimarganam-stat-icon {
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

          font-size: 19px;
        }


        .nimarganam-stat-card span {
          display: block;

          color: #8d8297;

          font-size: 13px;

          margin-bottom: 5px;
        }


        .nimarganam-stat-card strong {
          display: block;

          color: #f4eff8;

          font-size: 22px;
        }


        .nimarganam-stat-card small {
          color: #6f6577;

          font-size: 11px;
        }


        /* SECTION */

        .nimarganam-section {
          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 20px;

          overflow: hidden;
        }


        .nimarganam-section-header {
          min-height: 105px;

          padding: 25px 28px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .nimarganam-section-header h2 {
          margin: 0;

          color: #f4eff8;

          font-size: 24px;
        }


        .nimarganam-section-header > span {
          color: #807589;

          font-size: 13px;
        }


        /* LIST */

        .nimarganam-list {
          padding: 22px;

          display: flex;

          flex-direction: column;

          gap: 15px;
        }


        .nimarganam-card {
          display: flex;

          align-items: center;

          gap: 20px;

          padding: 20px;

          background: #18121e;

          border:
            1px solid
            rgba(255,255,255,0.07);

          border-radius: 15px;
        }


        .nimarganam-card-icon {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 14px;

          background:
            rgba(245,189,69,0.08);

          color: #f5bd45;

          font-size: 21px;
        }


        .nimarganam-card-info {
          flex: 1;

          min-width: 0;
        }


        .nimarganam-label {
          display: block;

          color: #716779;

          font-size: 9px;

          letter-spacing: 1.7px;

          margin-bottom: 5px;
        }


        .nimarganam-card-info h3 {
          margin: 0;

          color: #eee8f1;

          font-size: 17px;
        }


        .nimarganam-card-info p {
          margin: 5px 0 0;

          color: #716779;

          font-size: 12px;
        }


        .nimarganam-card-actions {
          display: flex;

          align-items: center;

          gap: 10px;
        }


        .nimarganam-open-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 11px 16px;

          border-radius: 10px;

          background:
            rgba(245,189,69,0.1);

          border:
            1px solid
            rgba(245,189,69,0.18);

          color: #f5bd45;

          text-decoration: none;

          font-size: 12px;

          font-weight: 800;
        }


        .nimarganam-open-button:hover {
          background:
            rgba(245,189,69,0.16);
        }


        .nimarganam-delete-button {
          width: 39px;
          height: 39px;

          border-radius: 9px;

          border:
            1px solid
            rgba(255,80,80,0.13);

          background:
            rgba(255,80,80,0.04);

          color: #dc7474;

          cursor: pointer;
        }


        .nimarganam-delete-button:hover {
          background:
            rgba(255,80,80,0.1);
        }


        /* EMPTY */

        .nimarganam-empty {
          min-height: 320px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding: 40px;
        }


        .nimarganam-empty-icon {
          width: 65px;
          height: 65px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 17px;

          background:
            rgba(245,189,69,0.07);

          color: #f5bd45;

          font-size: 25px;

          margin-bottom: 16px;
        }


        .nimarganam-empty h3 {
          margin: 0;

          color: #eae4ee;
        }


        .nimarganam-empty p {
          color: #746a7d;

          margin: 8px 0 20px;

          font-size: 13px;
        }


        /* MODAL */

        .nimarganam-modal-overlay {
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


        .nimarganam-modal {
          width: min(600px, 100%);

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.1);

          border-radius: 20px;
        }


        .nimarganam-modal-header {
          padding: 24px 26px;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .nimarganam-modal-header h2 {
          margin: 0;

          color: #f4eff8;

          font-size: 25px;
        }


        .nimarganam-close {
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


        .nimarganam-form {
          padding: 26px;

          display: flex;

          flex-direction: column;

          gap: 20px;
        }


        .nimarganam-form-group {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }


        .nimarganam-form-group label {
          color: #93879d;

          font-size: 13px;

          font-weight: 600;
        }


        .nimarganam-form-group input {
          width: 100%;

          height: 50px;

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


        .nimarganam-form-group input:focus {
          border-color:
            rgba(245,189,69,0.5);
        }


        .nimarganam-form-group input::placeholder {
          color: #62596a;
        }


        .nimarganam-form-group small {
          color: #6f6577;

          font-size: 11px;
        }


        /* DATE */

        .nimarganam-date {
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


        .nimarganam-date div {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }


        .nimarganam-date span {
          color: #786d81;

          font-size: 10px;

          letter-spacing: 1.5px;
        }


        .nimarganam-date strong {
          color: #f5bd45;

          font-size: 16px;
        }


        .nimarganam-date small {
          color: #756a7c;

          font-size: 11px;
        }


        .nimarganam-modal-actions {
          display: flex;

          justify-content: flex-end;

          gap: 12px;
        }


        .nimarganam-secondary-button {
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


        /* RESPONSIVE */

        @media (max-width: 900px) {

          .nimarganam-page {
            padding: 30px 24px 50px;
          }


          .nimarganam-stats {
            grid-template-columns: 1fr;
          }

        }


        /* MOBILE */

        @media (max-width: 650px) {

          .nimarganam-page {
            padding: 24px 16px 40px;
          }


          .nimarganam-header {
            flex-direction: column;

            align-items: flex-start;
          }


          .nimarganam-header h1 {
            font-size: 34px;
          }


          /*
            MOBILE STATS

            Drive Links + Storage
            = 2 cards in one row

            Festival Year
            = hidden
          */

          .nimarganam-stats {
            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 12px;

            margin-bottom: 20px;
          }


          .nimarganam-stats
          .nimarganam-stat-card {

            min-height: 125px;

            padding: 16px;

            display: flex;

            flex-direction: column;

            align-items: flex-start;

            justify-content: center;

            gap: 10px;

            border-radius: 15px;

            min-width: 0;
          }


          .nimarganam-stats
          .nimarganam-stat-card:nth-child(3) {
            display: none;
          }


          .nimarganam-stat-icon {
            width: 42px;

            height: 42px;

            border-radius: 11px;

            font-size: 17px;
          }


          .nimarganam-stat-card span {
            font-size: 10px;

            margin-bottom: 3px;
          }


          .nimarganam-stat-card strong {
            font-size: 18px;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            max-width: 100%;
          }


          .nimarganam-stat-card small {
            font-size: 10px;
          }


          /* MOBILE VIDEO CARDS */

          .nimarganam-card {
            align-items: flex-start;

            flex-wrap: wrap;
          }


          .nimarganam-card-actions {
            width: 100%;
          }


          .nimarganam-open-button {
            flex: 1;
          }


          /* MOBILE DATE */

          .nimarganam-date {
            flex-direction: column;

            align-items: flex-start;
          }

        }

      `}</style>


    </div>

  );

}


export default Nimarganam;