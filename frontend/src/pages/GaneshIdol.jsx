import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFestival } from "../context/FestivalContext";
import { apiFetch } from "../utils/api";

const SERVER_URL = "http://localhost:5000";

function GaneshIdol() {
  const { currentYear } = useFestival();

  // =====================================================
  // USER / ROLE
  // =====================================================

  const getUserRole = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      return user?.role || "viewer";
    } catch {
      return "viewer";
    }
  };

  const userRole = getUserRole();

  const canEdit =
    userRole === "admin" ||
    userRole === "editor";

  // =====================================================
  // STATE
  // =====================================================

  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    donorName: "",
    mobile: "",
    feet: "",
    totalAmount: "",
    image: null,
  });

  // =====================================================
  // FETCH GANESH IDOLS
  // =====================================================

  const fetchIdols = async () => {
    try {
      setLoading(true);

      const data = await apiFetch(
        `/api/ganesh-idols?year=${currentYear}`
      );

      setIdols(
        Array.isArray(data.idols)
          ? data.idols
          : []
      );
    } catch (error) {
      console.error(
        "FETCH IDOLS ERROR:",
        error
      );

      setIdols([]);

      alert(
        error.message ||
          "Unable to load Ganesh idols."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdols();
  }, [currentYear]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please select JPG, PNG, WEBP or GIF image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be less than 5 MB."
      );

      event.target.value = "";

      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));
  };

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openModal = () => {
    if (!canEdit) {
      alert(
        "Viewer access: You cannot add Ganesh idols."
      );

      return;
    }

    setForm({
      donorName: "",
      mobile: "",
      feet: "",
      totalAmount: "",
      image: null,
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setForm({
      donorName: "",
      mobile: "",
      feet: "",
      totalAmount: "",
      image: null,
    });
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEdit) {
      alert(
        "Viewer access: You cannot add Ganesh idols."
      );

      return;
    }

    if (!form.donorName.trim()) {
      alert(
        "Please enter donor name."
      );

      return;
    }

    if (!form.mobile.trim()) {
      alert(
        "Please enter mobile number."
      );

      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        form.mobile.trim()
      )
    ) {
      alert(
        "Enter a valid 10-digit mobile number."
      );

      return;
    }

    if (
      !form.feet ||
      Number(form.feet) <= 0
    ) {
      alert(
        "Please enter idol height in feet."
      );

      return;
    }

    if (
      form.totalAmount === "" ||
      Number(form.totalAmount) < 0
    ) {
      alert(
        "Please enter total amount."
      );

      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "donorName",
        form.donorName.trim()
      );

      formData.append(
        "mobile",
        form.mobile.trim()
      );

      formData.append(
        "feet",
        Number(form.feet)
      );

      formData.append(
        "totalAmount",
        Number(form.totalAmount)
      );

      formData.append(
        "festivalYear",
        Number(currentYear)
      );

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      const data = await apiFetch(
        "/api/ganesh-idols",
        {
          method: "POST",
          body: formData,
        }
      );

      alert(
        data.message ||
          "Ganesh idol added successfully."
      );

      closeModal();

      await fetchIdols();
    } catch (error) {
      console.error(
        "ADD IDOL ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to add Ganesh idol."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    if (!canEdit) {
      alert(
        "Viewer access: You cannot delete Ganesh idols."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this Ganesh idol record?"
      );

    if (!confirmed) return;

    try {
      const data = await apiFetch(
        `/api/ganesh-idols/${id}`,
        {
          method: "DELETE",
        }
      );

      alert(
        data.message ||
          "Ganesh idol deleted successfully."
      );

      await fetchIdols();
    } catch (error) {
      console.error(
        "DELETE IDOL ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete Ganesh idol."
      );
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${SERVER_URL}${image}`;
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredIdols =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {
        return idols;
      }

      return idols.filter(
        (idol) =>
          idol.donorName
            ?.toLowerCase()
            .includes(text) ||
          idol.mobile
            ?.includes(text)
      );
    }, [idols, search]);

  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  const totalAmount =
    idols.reduce(
      (sum, idol) =>
        sum +
        Number(
          idol.totalAmount || 0
        ),
      0
    );

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

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
    <div className="idol-page">

      {/* =================================================
          VIEWER MESSAGE
      ================================================= */}

      {!canEdit && (
        <div
          className="idol-viewer-message"
        >
          👁️ You are viewing this page as a{" "}
          <strong>Viewer</strong>. You can view
          Ganesh idols but cannot add or delete
          them.
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="idol-header">

        <div>
          <div className="idol-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>

          <h1>
            Ganesh Idols
          </h1>

          <p>
            Manage idol details, donors
            and payments.
          </p>
        </div>

        {canEdit && (
          <button
            className="idol-primary-button"
            onClick={openModal}
          >
            + Add Ganesh Idol
          </button>
        )}

      </section>

      {/* =================================================
          STATS
          ONLY TWO CARDS
      ================================================= */}

      <section className="idol-stats">

        {/* TOTAL IDOLS */}

        <div className="idol-stat-card">

          <div className="idol-stat-icon">
            ◉
          </div>

          <div className="idol-stat-info">

            <span>
              Total Idols
            </span>

            <strong>
              {idols.length}
            </strong>

            <small>
              {currentYear}
            </small>

          </div>

        </div>

        {/* TOTAL AMOUNT */}

        <div className="idol-stat-card">

          <div className="idol-stat-icon">
            ₹
          </div>

          <div className="idol-stat-info">

            <span>
              Total Amount
            </span>

            <strong>
              {formatMoney(totalAmount)}
            </strong>

            <small>
              Idol collection
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="idol-search-row">

        <div className="idol-search">

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
            placeholder="Search donor name or mobile..."
          />

        </div>

        <span className="idol-count">
          {filteredIdols.length}{" "}
          {filteredIdols.length === 1
            ? "idol"
            : "idols"}
        </span>

      </div>

      {/* =================================================
          RECORDS
      ================================================= */}

      <section className="idol-records">

        <div className="idol-records-header">

          <div>

            <div className="idol-eyebrow">
              {currentYear} IDOL RECORDS
            </div>

            <h2>
              Ganesh Idol List
            </h2>

          </div>

          <strong>
            {formatMoney(totalAmount)}
          </strong>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="idol-empty">

            <div className="idol-empty-icon">
              ⏳
            </div>

            <h3>
              Loading idols...
            </h3>

          </div>

        ) : filteredIdols.length === 0 ? (

          /* EMPTY */

          <div className="idol-empty">

            <div className="idol-empty-icon">
              ◉
            </div>

            <h3>
              No Ganesh Idols Found
            </h3>

            <p>
              No idol records found for{" "}
              {currentYear}.
            </p>

            {canEdit && (
              <button
                className="idol-primary-button"
                onClick={openModal}
              >
                + Add Ganesh Idol
              </button>
            )}

          </div>

        ) : (

          /* LIST */

          <div className="idol-list">

            {filteredIdols.map(
              (idol) => {

                const imageUrl =
                  getImageUrl(
                    idol.image
                  );

                return (
                  <article
                    className="idol-card"
                    key={idol._id}
                  >

                    {/* IMAGE */}

                    <div
                      className="idol-card-image"
                      onClick={() => {
                        if (imageUrl) {
                          setSelectedImage(
                            imageUrl
                          );
                        }
                      }}
                    >

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            idol.donorName
                          }
                        />

                      ) : (

                        <div className="idol-no-image">
                          ◉
                        </div>

                      )}

                      {imageUrl && (
                        <div className="idol-image-overlay">
                          Click to enlarge
                        </div>
                      )}

                    </div>

                    {/* DETAILS */}

                    <div className="idol-card-content">

                      <div className="idol-card-top">

                        <div>

                          <div className="idol-card-label">
                            GANESH IDOL
                          </div>

                          <h3>
                            {idol.donorName}
                          </h3>

                        </div>

                        {canEdit && (
                          <button
                            className="idol-delete"
                            onClick={() =>
                              handleDelete(
                                idol._id
                              )
                            }
                            title="Delete Ganesh idol"
                          >
                            🗑
                          </button>
                        )}

                      </div>

                      <div className="idol-details-grid">

                        <div>

                          <span>
                            MOBILE
                          </span>

                          <strong>
                            {idol.mobile}
                          </strong>

                        </div>

                        <div>

                          <span>
                            HEIGHT
                          </span>

                          <strong>
                            {idol.feet} feet
                          </strong>

                        </div>

                        <div>

                          <span>
                            TOTAL AMOUNT
                          </span>

                          <strong className="idol-money">
                            {formatMoney(
                              idol.totalAmount
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              idol.createdAt
                            )}
                          </strong>

                        </div>

                      </div>

                      <div className="idol-card-bottom">

                        <span>
                          DONOR
                        </span>

                        <strong>
                          {idol.donorName}
                        </strong>

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
          ADD MODAL
      ================================================= */}

      {showModal && canEdit && (

        <div
          className="idol-modal-overlay"
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

          <div className="idol-modal">

            <div className="idol-modal-header">

              <div>

                <div className="idol-eyebrow">
                  {currentYear} IDOL
                </div>

                <h2>
                  Add Ganesh Idol
                </h2>

              </div>

              <button
                className="idol-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="idol-form"
              onSubmit={handleSubmit}
            >

              {/* DONOR */}

              <div className="idol-form-group">

                <label>
                  Donor Name *
                </label>

                <input
                  type="text"
                  name="donorName"
                  value={
                    form.donorName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter donor name"
                  required
                />

              </div>

              {/* MOBILE */}

              <div className="idol-form-group">

                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={
                    form.mobile
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  required
                />

              </div>

              {/* HEIGHT */}

              <div className="idol-form-group">

                <label>
                  Height in Feet *
                </label>

                <input
                  type="number"
                  name="feet"
                  value={
                    form.feet
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 5"
                  min="0.1"
                  step="0.1"
                  required
                />

              </div>

              {/* AMOUNT */}

              <div className="idol-form-group">

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
                  placeholder="Enter total amount"
                  min="0"
                  required
                />

              </div>

              {/* IMAGE */}

              <div className="idol-form-group idol-full">

                <label>
                  Ganesh Idol Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={
                    handleImageChange
                  }
                />

                {form.image && (
                  <small className="idol-file-name">
                    {form.image.name}
                  </small>
                )}

              </div>

              {/* DATE */}

              <div className="idol-auto-date">

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
                  Date is automatically
                  recorded.
                </small>

              </div>

              {/* ACTIONS */}

              <div className="idol-modal-actions">

                <button
                  type="button"
                  className="idol-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="idol-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Uploading..."
                    : "Save Ganesh Idol"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          IMAGE VIEWER
      ================================================= */}

      {selectedImage && (

        <div
          className="idol-image-modal"
          onClick={() =>
            setSelectedImage(null)
          }
        >

          <button
            className="idol-image-close"
            onClick={() =>
              setSelectedImage(null)
            }
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Ganesh Idol"
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          <a
            className="idol-download"
            href={selectedImage}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            ↓ Download Image
          </a>

        </div>

      )}

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .idol-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }

        /* ================================
           VIEWER MESSAGE
        ================================= */

        .idol-viewer-message {
          background:
            rgba(245, 189, 69, 0.08);
          border:
            1px solid
            rgba(245, 189, 69, 0.3);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 24px;
          color: #d9c7a0;
          font-size: 14px;
        }

        /* ================================
           HEADER
        ================================= */

        .idol-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 32px;
        }

        .idol-eyebrow {
          color: #f5bd45;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }

        .idol-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 42px;
          font-weight: 800;
        }

        .idol-header p {
          color: #8d8297;
          margin: 10px 0 0;
        }

        /* ================================
           BUTTON
        ================================= */

        .idol-primary-button {
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

        .idol-primary-button:hover {
          transform: translateY(-2px);
        }

        .idol-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ================================
           STATS
           
           TWO CARDS
        ================================= */

        .idol-stats {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .idol-stat-card {
          min-height: 135px;
          padding: 23px;
          display: flex;
          align-items: center;
          gap: 17px;
          background: #120d17;
          border:
            1px solid
            rgba(255,255,255,0.08);
          border-radius: 18px;
        }

        .idol-stat-icon {
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

        .idol-stat-info {
          min-width: 0;
        }

        .idol-stat-card span {
          display: block;
          color: #8d8297;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .idol-stat-card strong {
          display: block;
          color: #f4eff8;
          font-size: 24px;
        }

        .idol-stat-card small {
          color: #6f6577;
          font-size: 11px;
        }

        /* ================================
           SEARCH
        ================================= */

        .idol-search-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .idol-search {
          width: min(650px, 100%);
          height: 51px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          background: #130e18;
          border:
            1px solid
            rgba(255,255,255,0.08);
          border-radius: 12px;
        }

        .idol-search span {
          color: #7d7286;
          font-size: 20px;
        }

        .idol-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #f4eff8;
          font-size: 14px;
        }

        .idol-search input::placeholder {
          color: #62596a;
        }

        .idol-count {
          color: #807589;
          font-size: 13px;
        }

        /* ================================
           RECORDS
        ================================= */

        .idol-records {
          background: #120d17;
          border:
            1px solid
            rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }

        .idol-records-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 25px 30px;
          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }

        .idol-records-header h2 {
          margin: 0;
          color: #f6f1f8;
          font-size: 27px;
        }

        .idol-records-header > strong {
          color: #f5bd45;
          font-size: 20px;
        }

        /* ================================
           IDOL LIST
        ================================= */

        .idol-list {
          display: flex;
          flex-direction: column;
        }

        .idol-card {
          display: grid;
          grid-template-columns: 230px 1fr;
          min-height: 240px;
          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }

        .idol-card:last-child {
          border-bottom: none;
        }

        .idol-card-image {
          position: relative;
          min-height: 240px;
          background: #0d0911;
          overflow: hidden;
          cursor: pointer;
        }

        .idol-card-image img {
          width: 100%;
          height: 100%;
          min-height: 240px;
          object-fit: cover;
          display: block;
        }

        .idol-no-image {
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5bd45;
          font-size: 50px;
          background: #160f1c;
        }

        .idol-image-overlay {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          padding: 8px;
          text-align: center;
          background:
            rgba(0,0,0,0.65);
          color: white;
          border-radius: 8px;
          font-size: 11px;
        }

        .idol-card-content {
          padding: 28px;
        }

        .idol-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .idol-card-label {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }

        .idol-card-top h3 {
          margin: 0;
          color: #f5f0f7;
          font-size: 24px;
        }

        .idol-delete {
          border: none;
          background:
            rgba(255,80,80,0.08);
          color: #ff7676;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
        }

        .idol-details-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 18px;
        }

        .idol-details-grid span,
        .idol-card-bottom span {
          display: block;
          color: #716778;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 7px;
        }

        .idol-details-grid strong,
        .idol-card-bottom strong {
          color: #e8e0ec;
          font-size: 14px;
        }

        .idol-money {
          color: #f5bd45 !important;
        }

        .idol-card-bottom {
          margin-top: 25px;
          padding-top: 18px;
          border-top:
            1px solid
            rgba(255,255,255,0.07);
        }

        /* ================================
           EMPTY
        ================================= */

        .idol-empty {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .idol-empty-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background:
            rgba(245,189,69,0.08);
          color: #f5bd45;
          font-size: 27px;
          margin-bottom: 15px;
        }

        .idol-empty h3 {
          color: #e8e0ec;
          margin: 0 0 8px;
        }

        .idol-empty p {
          color: #776c80;
          margin: 0 0 18px;
        }

        /* ================================
           MODAL
        ================================= */

        .idol-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(0,0,0,0.78);
        }

        .idol-modal {
          width: min(620px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #17111c;
          border:
            1px solid
            rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 28px;
        }

        .idol-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .idol-modal-header h2 {
          margin: 0;
          color: #f5f0f7;
          font-size: 28px;
        }

        .idol-modal-close {
          border: none;
          background:
            rgba(255,255,255,0.06);
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          font-size: 25px;
          cursor: pointer;
        }

        .idol-form {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 18px;
        }

        .idol-form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .idol-form-group.idol-full {
          grid-column: 1 / -1;
        }

        .idol-form-group label {
          color: #cfc4d5;
          font-size: 13px;
          font-weight: 700;
        }

        .idol-form-group input {
          width: 100%;
          padding: 13px 14px;
          border-radius: 10px;
          border:
            1px solid
            rgba(255,255,255,0.1);
          outline: none;
          background: #0f0b13;
          color: #f5f0f7;
        }

        .idol-form-group input:focus {
          border-color: #f5bd45;
        }

        .idol-file-name {
          color: #f5bd45;
          font-size: 11px;
        }

        .idol-auto-date {
          grid-column: 1 / -1;
          padding: 15px;
          border-radius: 12px;
          background:
            rgba(245,189,69,0.06);
          border:
            1px solid
            rgba(245,189,69,0.12);
        }

        .idol-auto-date > div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .idol-auto-date span {
          color: #807589;
          font-size: 10px;
          font-weight: 800;
        }

        .idol-auto-date strong {
          color: #f5bd45;
        }

        .idol-auto-date small {
          display: block;
          margin-top: 6px;
          color: #74697b;
        }

        .idol-modal-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 5px;
        }

        .idol-secondary-button {
          border: none;
          border-radius: 11px;
          padding: 13px 20px;
          background: #2a2230;
          color: #ddd4e1;
          font-weight: 700;
          cursor: pointer;
        }

        /* ================================
           IMAGE MODAL
        ================================= */

        .idol-image-modal {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 15px;
          padding: 40px;
          background:
            rgba(0,0,0,0.9);
        }

        .idol-image-modal img {
          max-width: 90vw;
          max-height: 75vh;
          object-fit: contain;
          border-radius: 12px;
        }

        .idol-image-close {
          position: absolute;
          top: 20px;
          right: 25px;
          border: none;
          background:
            rgba(255,255,255,0.1);
          color: white;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          font-size: 25px;
          cursor: pointer;
        }

        .idol-download {
          color: #f5bd45;
          text-decoration: none;
          font-weight: 700;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 900px) {

          .idol-page {
            padding: 25px 18px 45px;
          }

          .idol-header {
            align-items: flex-start;
            flex-direction: column;
          }

          /*
             KEEP TWO STAT CARDS
             SIDE BY SIDE
          */

          .idol-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .idol-stat-card {
            min-width: 0;
            padding: 18px;
            gap: 12px;
          }

          .idol-stat-icon {
            width: 42px;
            height: 42px;
            font-size: 18px;
          }

          .idol-stat-card span {
            font-size: 11px;
          }

          .idol-stat-card strong {
            font-size: 21px;
          }

          .idol-card {
            grid-template-columns: 1fr;
          }

          .idol-card-image {
            min-height: 220px;
          }

          .idol-card-image img,
          .idol-no-image {
            min-height: 220px;
          }

          .idol-details-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {

          .idol-page {
            width: 100%;
            padding: 20px 14px 40px;
          }

          .idol-header {
            gap: 15px;
            margin-bottom: 20px;
          }

          .idol-header h1 {
            font-size: 30px;
          }

          .idol-header p {
            font-size: 13px;
          }

          .idol-primary-button {
            padding: 11px 16px;
            font-size: 13px;
          }

          /*
             TWO STAT CARDS IN ONE ROW
          */

          .idol-stats {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 18px;
          }

          .idol-stat-card {
            min-height: 125px;
            padding: 14px;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
            border-radius: 15px;
          }

          .idol-stat-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            font-size: 16px;
          }

          .idol-stat-info {
            width: 100%;
          }

          .idol-stat-card span {
            font-size: 9px;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
          }

          .idol-stat-card strong {
            font-size: 19px;
            line-height: 1.2;
          }

          .idol-stat-card small {
            font-size: 9px;
          }

          /* SEARCH */

          .idol-search-row {
            align-items: stretch;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 18px;
          }

          .idol-search {
            width: 100%;
            height: 46px;
          }

          .idol-search input {
            font-size: 13px;
          }

          .idol-count {
            text-align: right;
            font-size: 11px;
          }

          /* RECORDS */

          .idol-records {
            border-radius: 16px;
          }

          .idol-records-header {
            padding: 18px;
          }

          .idol-records-header h2 {
            font-size: 21px;
          }

          .idol-records-header > strong {
            font-size: 16px;
          }

          .idol-card-content {
            padding: 18px;
          }

          .idol-card-top {
            margin-bottom: 20px;
          }

          .idol-card-top h3 {
            font-size: 20px;
          }

          .idol-details-grid {
            grid-template-columns:
              repeat(2, 1fr);
            gap: 15px;
          }

          .idol-details-grid span,
          .idol-card-bottom span {
            font-size: 9px;
          }

          .idol-details-grid strong,
          .idol-card-bottom strong {
            font-size: 12px;
          }

          .idol-card-bottom {
            margin-top: 20px;
            padding-top: 15px;
          }

          /* MODAL */

          .idol-form {
            grid-template-columns: 1fr;
          }

          .idol-form-group.idol-full,
          .idol-auto-date,
          .idol-modal-actions {
            grid-column: auto;
          }

          .idol-modal {
            padding: 20px;
            border-radius: 16px;
          }

          .idol-modal-header h2 {
            font-size: 22px;
          }

          .idol-modal-actions {
            flex-direction: column-reverse;
          }

          .idol-modal-actions button {
            width: 100%;
          }

          .idol-image-modal {
            padding: 20px;
          }

        }

        /* =================================================
           VERY SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .idol-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .idol-stats {
            gap: 8px;
          }

          .idol-stat-card {
            padding: 11px;
            min-height: 115px;
          }

          .idol-stat-card strong {
            font-size: 17px;
          }

          .idol-stat-card span {
            font-size: 8px;
          }

          .idol-stat-card small {
            font-size: 8px;
          }

        }

      `}</style>

    </div>
  );
}

export default GaneshIdol;