import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFestival } from "../context/FestivalContext";

const API_URL =
  "http://localhost:5000/api/photos";

const SERVER_URL =
  "http://localhost:5000";


function Photos() {

  const { currentYear } = useFestival();

  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    image: null,
  });


  // ==========================================
  // GET PHOTOS
  // ==========================================

  const fetchPhotos = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}?year=${currentYear}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch photos"
        );
      }

      setPhotos(
        Array.isArray(data.photos)
          ? data.photos
          : []
      );

    } catch (error) {

      console.error(
        "FETCH PHOTOS ERROR:",
        error
      );

      setPhotos([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOAD WHEN YEAR CHANGES
  // ==========================================

  useEffect(() => {

    fetchPhotos();

  }, [currentYear]);


  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];


    if (!allowedTypes.includes(file.type)) {

      alert(
        "Only JPG, PNG, WEBP and GIF images are allowed."
      );

      e.target.value = "";

      return;
    }


    if (file.size > 5 * 1024 * 1024) {

      alert(
        "Image size must be less than 5 MB."
      );

      e.target.value = "";

      return;
    }


    setForm({
      image: file,
    });

  };


  // ==========================================
  // OPEN MODAL
  // ==========================================

  const openModal = () => {

    setForm({
      image: null,
    });

    setShowModal(true);

  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    setForm({
      image: null,
    });

  };


  // ==========================================
  // UPLOAD PHOTO
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!form.image) {

      alert(
        "Please select a photo."
      );

      return;
    }


    try {

      setSaving(true);


      const formData = new FormData();


      formData.append(
        "festivalYear",
        Number(currentYear)
      );


      formData.append(
        "image",
        form.image
      );


      const response = await fetch(
        API_URL,
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to upload photo"
        );

      }


      alert(
        "Photo uploaded successfully."
      );


      closeModal();

      await fetchPhotos();


    } catch (error) {

      console.error(
        "UPLOAD PHOTO ERROR:",
        error
      );


      alert(
        error.message ||
        "Failed to upload photo"
      );


    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // DELETE PHOTO
  // ==========================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to delete photo"
        );

      }


      await fetchPhotos();


    } catch (error) {

      console.error(
        "DELETE PHOTO ERROR:",
        error
      );


      alert(
        error.message ||
        "Failed to delete photo"
      );

    }

  };


  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (image) => {

    if (!image) {
      return "";
    }


    if (image.startsWith("http")) {
      return image;
    }


    return `${SERVER_URL}${image}`;

  };


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredPhotos = useMemo(() => {

    const text =
      search.trim().toLowerCase();


    if (!text) {
      return photos;
    }


    return photos.filter((photo) => {

      const date =
        formatDate(photo.createdAt)
          .toLowerCase();


      return date.includes(text);

    });

  }, [photos, search]);


  // ==========================================
  // DATE
  // ==========================================

  function formatDate(date) {

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

  }


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="photos-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <section className="photos-header">

        <div>

          <div className="photos-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>

          <h1>
            Photos
          </h1>

          <p>
            Store and manage festival memories.
          </p>

        </div>


        <button
          className="photos-primary-button"
          onClick={openModal}
        >
          + Upload Photo
        </button>

      </section>


      {/* =====================================
          STAT CARDS
      ====================================== */}

      <section className="photos-stats">


        <div className="photos-stat-card">

          <div className="photos-stat-icon">
            ▣
          </div>

          <div>

            <span>
              Total Photos
            </span>

            <strong>
              {photos.length}
            </strong>

            <small>
              {currentYear}
            </small>

          </div>

        </div>


        <div className="photos-stat-card">

          <div className="photos-stat-icon">
            📷
          </div>

          <div>

            <span>
              Gallery
            </span>

            <strong>
              {filteredPhotos.length}
            </strong>

            <small>
              Current results
            </small>

          </div>

        </div>


        <div className="photos-stat-card">

          <div className="photos-stat-icon">
            ★
          </div>

          <div>

            <span>
              Festival
            </span>

            <strong>
              {currentYear}
            </strong>

            <small>
              Ganesh Utsavam
            </small>

          </div>

        </div>


      </section>


      {/* =====================================
          SEARCH
      ====================================== */}

      <div className="photos-search-row">

        <div className="photos-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by date..."
          />

        </div>


        <span className="photos-count">

          {filteredPhotos.length}{" "}

          {filteredPhotos.length === 1
            ? "photo"
            : "photos"}

        </span>

      </div>


      {/* =====================================
          GALLERY
      ====================================== */}

      <section className="photos-gallery-section">


        <div className="photos-gallery-header">

          <div>

            <div className="photos-eyebrow">
              {currentYear} GALLERY
            </div>

            <h2>
              Festival Photos
            </h2>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="photos-empty">

            <div className="photos-empty-icon">
              ⏳
            </div>

            <h3>
              Loading photos...
            </h3>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          filteredPhotos.length === 0 && (

          <div className="photos-empty">

            <div className="photos-empty-icon">
              📷
            </div>

            <h3>
              No Photos Found
            </h3>

            <p>
              Upload your first festival photo.
            </p>

            <button
              className="photos-primary-button"
              onClick={openModal}
            >
              + Upload Photo
            </button>

          </div>

        )}


        {/* PHOTO GRID */}

        {!loading &&
          filteredPhotos.length > 0 && (

          <div className="photos-grid">

            {filteredPhotos.map(
              (photo) => {

                const imageUrl =
                  getImageUrl(
                    photo.image
                  );


                return (

                  <article
                    className="photo-card"
                    key={photo._id}
                  >


                    {/* IMAGE */}

                    <div
                      className="photo-card-image"
                      onClick={() => {

                        if (imageUrl) {

                          setSelectedImage(
                            imageUrl
                          );

                        }

                      }}
                    >

                      <img
                        src={imageUrl}
                        alt="Festival"
                      />


                      <div className="photo-hover">

                        <span>
                          View Full Size
                        </span>

                      </div>

                    </div>


                    {/* DATE + DELETE */}

                    <div className="photo-card-content">

                      <div>

                        <span className="photo-date-label">
                          UPLOADED
                        </span>

                        <strong>
                          {formatDate(
                            photo.createdAt
                          )}
                        </strong>

                      </div>


                      <button
                        className="photo-delete"
                        onClick={() =>
                          handleDelete(
                            photo._id
                          )
                        }
                        title="Delete photo"
                      >
                        🗑
                      </button>

                    </div>


                  </article>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =====================================
          UPLOAD MODAL
      ====================================== */}

      {showModal && (

        <div
          className="photos-modal-overlay"
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


          <div className="photos-modal">


            {/* MODAL HEADER */}

            <div className="photos-modal-header">

              <div>

                <div className="photos-eyebrow">
                  {currentYear} GALLERY
                </div>

                <h2>
                  Upload Photo
                </h2>

              </div>


              <button
                className="photos-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="photos-form"
              onSubmit={handleSubmit}
            >


              {/* IMAGE */}

              <div className="photos-form-group">

                <label>
                  Select Photo *
                </label>


                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  required
                />


                {form.image && (

                  <div className="selected-file">

                    <span>
                      ✓
                    </span>

                    <strong>
                      {form.image.name}
                    </strong>

                  </div>

                )}

              </div>


              {/* DATE */}

              <div className="photos-auto-date">

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

              <div className="photos-modal-actions">


                <button
                  type="button"
                  className="photos-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="photos-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Uploading..."
                    : "Upload Photo"}
                </button>


              </div>


            </form>


          </div>


        </div>

      )}


      {/* =====================================
          LARGE IMAGE MODAL
      ====================================== */}

      {selectedImage && (

        <div
          className="photos-image-modal"
          onClick={() =>
            setSelectedImage(null)
          }
        >


          <button
            className="photos-image-close"
            onClick={() =>
              setSelectedImage(null)
            }
          >
            ×
          </button>


          <img
            src={selectedImage}
            alt="Festival"
            onClick={(e) =>
              e.stopPropagation()
            }
          />


          <a
            className="photos-download"
            href={selectedImage}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            ↓ Download Image
          </a>


        </div>

      )}


      {/* =====================================
          CSS
      ====================================== */}

      <style>{`

        .photos-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        /* HEADER */

        .photos-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 32px;
        }


        .photos-eyebrow {
          color: #f5bd45;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }


        .photos-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 42px;
          font-weight: 800;
        }


        .photos-header p {
          color: #8d8297;
          margin: 10px 0 0;
        }


        .photos-primary-button {
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


        .photos-primary-button:hover {
          transform: translateY(-2px);
        }


        .photos-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* STATS */

        .photos-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 25px;
        }


        .photos-stat-card {
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


        .photos-stat-icon {
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
          font-size: 20px;
        }


        .photos-stat-card span {
          display: block;
          color: #8d8297;
          font-size: 13px;
          margin-bottom: 5px;
        }


        .photos-stat-card strong {
          display: block;
          color: #f4eff8;
          font-size: 24px;
        }


        .photos-stat-card small {
          color: #6f6577;
          font-size: 11px;
        }


        /* SEARCH */

        .photos-search-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }


        .photos-search {
          width: min(650px, 100%);
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


        .photos-search span {
          color: #7d7286;
          font-size: 20px;
        }


        .photos-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #f4eff8;
        }


        .photos-search input::placeholder {
          color: #62596a;
        }


        .photos-count {
          color: #807589;
          font-size: 13px;
        }


        /* GALLERY */

        .photos-gallery-section {
          background: #120d17;
          border:
            1px solid
            rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }


        .photos-gallery-header {
          min-height: 105px;
          padding: 25px 28px;
          display: flex;
          align-items: center;
          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .photos-gallery-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 24px;
        }


        /* GRID */

        .photos-grid {
          padding: 22px;
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 20px;
        }


        .photo-card {
          min-width: 0;
          background: #18121e;
          border:
            1px solid
            rgba(255,255,255,0.07);
          border-radius: 15px;
          overflow: hidden;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }


        .photo-card:hover {
          transform: translateY(-3px);
          border-color:
            rgba(245,189,69,0.2);
        }


        /* IMAGE */

        .photo-card-image {
          position: relative;
          width: 100%;
          height: 230px;
          background: #0c0910;
          cursor: pointer;
          overflow: hidden;
        }


        .photo-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition:
            transform 0.25s ease;
        }


        .photo-card:hover
        .photo-card-image img {
          transform: scale(1.04);
        }


        .photo-hover {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(0,0,0,0.42);
          opacity: 0;
          transition: 0.2s ease;
        }


        .photo-hover span {
          padding: 10px 15px;
          border-radius: 9px;
          background:
            rgba(0,0,0,0.65);
          color: white;
          font-size: 12px;
        }


        .photo-card-image:hover
        .photo-hover {
          opacity: 1;
        }


        /* CARD BOTTOM */

        .photo-card-content {
          min-height: 72px;
          padding: 15px 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }


        .photo-card-content div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }


        .photo-date-label {
          color: #6f6577;
          font-size: 9px;
          letter-spacing: 1.3px;
        }


        .photo-card-content strong {
          color: #c8bfcc;
          font-size: 13px;
        }


        .photo-delete {
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 9px;
          border:
            1px solid
            rgba(255,80,80,0.13);
          background:
            rgba(255,80,80,0.04);
          color: #dc7474;
          cursor: pointer;
        }


        .photo-delete:hover {
          background:
            rgba(255,80,80,0.1);
        }


        /* EMPTY */

        .photos-empty {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
        }


        .photos-empty-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background:
            rgba(245,189,69,0.07);
          color: #f5bd45;
          font-size: 26px;
          margin-bottom: 16px;
        }


        .photos-empty h3 {
          margin: 0;
          color: #eae4ee;
        }


        .photos-empty p {
          color: #746a7d;
          margin: 8px 0 20px;
          font-size: 13px;
        }


        /* UPLOAD MODAL */

        .photos-modal-overlay {
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


        .photos-modal {
          width: min(600px, 100%);
          background: #120d17;
          border:
            1px solid
            rgba(255,255,255,0.1);
          border-radius: 20px;
        }


        .photos-modal-header {
          padding: 24px 26px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .photos-modal-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 25px;
        }


        .photos-modal-close {
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


        .photos-form {
          padding: 26px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }


        .photos-form-group {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }


        .photos-form-group label {
          color: #93879d;
          font-size: 13px;
          font-weight: 600;
        }


        .photos-form-group input[type="file"] {
          width: 100%;
          min-height: 52px;
          padding: 12px;
          box-sizing: border-box;
          border:
            1px solid
            rgba(255,255,255,0.09);
          border-radius: 10px;
          background: #19131f;
          color: #eee8f0;
          outline: none;
          font-size: 13px;
          cursor: pointer;
        }


        .selected-file {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 13px;
          border-radius: 9px;
          background:
            rgba(245,189,69,0.06);
          border:
            1px solid
            rgba(245,189,69,0.12);
          color: #f5bd45;
          font-size: 12px;
          overflow: hidden;
        }


        .selected-file strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* DATE */

        .photos-auto-date {
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


        .photos-auto-date div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }


        .photos-auto-date span {
          color: #786d81;
          font-size: 10px;
          letter-spacing: 1.5px;
        }


        .photos-auto-date strong {
          color: #f5bd45;
          font-size: 16px;
        }


        .photos-auto-date small {
          color: #756a7c;
          font-size: 11px;
        }


        /* BUTTONS */

        .photos-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }


        .photos-secondary-button {
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


        /* LARGE IMAGE */

        .photos-image-modal {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 70px 30px 90px;
          box-sizing: border-box;
          background:
            rgba(0,0,0,0.92);
          backdrop-filter: blur(8px);
        }


        .photos-image-modal img {
          max-width: 90vw;
          max-height: 78vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow:
            0 25px 80px
            rgba(0,0,0,0.6);
        }


        .photos-image-close {
          position: absolute;
          top: 22px;
          right: 25px;
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 10px;
          background:
            rgba(255,255,255,0.1);
          color: white;
          font-size: 28px;
          cursor: pointer;
        }


        .photos-download {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 10px;
          background: #f5bd45;
          color: #211608;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }


        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .photos-page {
            padding: 30px 24px 50px;
          }

          .photos-stats {
            grid-template-columns: 1fr;
          }

          .photos-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }


        @media (max-width: 650px) {

          .photos-page {
            padding: 24px 16px 40px;
          }

          .photos-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .photos-header h1 {
            font-size: 34px;
          }

          .photos-search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .photos-search {
            width: 100%;
          }

          .photos-count {
            align-self: flex-end;
          }

          .photos-grid {
            grid-template-columns: 1fr;
            padding: 15px;
          }

          .photo-card-image {
            height: 250px;
          }

          .photos-auto-date {
            flex-direction: column;
            align-items: flex-start;
          }

        }

        /* ==========================================
   MOBILE - SHOW ONLY TOTAL PHOTOS
   ========================================== */

@media (max-width: 650px) {

  .photos-stats {
    display: block;
  }

  .photos-stats .photos-stat-card {
    display: none;
  }

  /* Show only the first card = Total Photos */
  .photos-stats .photos-stat-card:first-child {
    display: flex;
    width: 100%;
    min-height: 105px;
    margin-bottom: 18px;
  }

}

      `}</style>
      

    </div>
  );
}

export default Photos;