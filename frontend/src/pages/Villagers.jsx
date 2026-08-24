import React, {
  useEffect,
  useState,
} from "react";

const API_URL =
  "http://localhost:5000/api/villagers";

function Villagers() {

  const [villagers, setVillagers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    gender: "Male",
  });


  // ==========================================
  // FETCH VILLAGERS
  // ==========================================

  const fetchVillagers = async () => {
    try {

      setLoading(true);

      const response =
        await fetch(API_URL);

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch villagers"
        );
      }

      setVillagers(
        Array.isArray(data.villagers)
          ? data.villagers
          : []
      );

    } catch (error) {

      console.error(
        "FETCH VILLAGERS ERROR:",
        error
      );

      alert(
        "Unable to load villagers. Make sure backend is running."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchVillagers();
  }, []);


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  // ==========================================
  // ADD MODAL
  // ==========================================

  const openAddModal = () => {

    setEditingId(null);

    setForm({
      name: "",
      mobile: "",
      gender: "Male",
    });

    setShowModal(true);
  };


  // ==========================================
  // EDIT MODAL
  // ==========================================

  const openEditModal = (
    villager
  ) => {

    setEditingId(
      villager._id
    );

    setForm({
      name: villager.name || "",
      mobile: villager.mobile || "",
      gender: villager.gender || "Male",
    });

    setShowModal(true);
  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingId(null);

    setForm({
      name: "",
      mobile: "",
      gender: "Male",
    });
  };


  // ==========================================
  // ADD / UPDATE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter name.");
      return;
    }

    if (!form.mobile.trim()) {
      alert(
        "Please enter mobile number."
      );
      return;
    }

    if (!form.gender) {
      alert("Please select gender.");
      return;
    }


    try {

      setSaving(true);

      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        gender: form.gender,
      };

      let response;


      // UPDATE

      if (editingId) {

        response =
          await fetch(
            `${API_URL}/${editingId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(payload),
            }
          );

      }

      // ADD

      else {

        response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(payload),
            }
          );
      }


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to save villager"
        );
      }


      alert(
        editingId
          ? "Villager updated successfully."
          : "Villager added successfully."
      );


      closeModal();

      await fetchVillagers();


    } catch (error) {

      console.error(
        "SAVE VILLAGER ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to save villager."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this villager?"
      );

    if (!confirmed) return;


    try {

      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to delete villager"
        );
      }


      await fetchVillagers();


    } catch (error) {

      console.error(
        "DELETE VILLAGER ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to delete villager."
      );
    }
  };


  // ==========================================
  // GENDER CLASS
  // ==========================================

  const genderClass = (gender) => {

    if (gender === "Female") {
      return "female";
    }

    if (gender === "Other") {
      return "other";
    }

    return "male";
  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="villagers-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="villagers-header">

        <div>

          <div className="villagers-eyebrow">
            GANESH UTSAVAM
          </div>

          <h1>
            Village Members
          </h1>

          <p>
            Manage village member details.
          </p>

        </div>


        <button
          className="villagers-add-button"
          onClick={openAddModal}
        >
          + Add Villager
        </button>

      </div>


      {/* =====================================
          COUNT
      ====================================== */}

      <div className="villagers-count-card">

        <div className="villagers-count-icon">
          ♟
        </div>

        <div>

          <span>
            TOTAL VILLAGERS
          </span>

          <strong>
            {villagers.length}
          </strong>

        </div>

      </div>


      {/* =====================================
          LIST
      ====================================== */}

      <section className="villagers-section">

        <div className="villagers-section-header">

          <div>

            <div className="villagers-eyebrow">
              VILLAGE MEMBERS
            </div>

            <h2>
              Villagers List
            </h2>

          </div>

          <span>
            {villagers.length}{" "}
            {villagers.length === 1
              ? "villager"
              : "villagers"}
          </span>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="villagers-empty">

            <div className="villagers-empty-icon">
              ⏳
            </div>

            <h3>
              Loading villagers...
            </h3>

          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          villagers.length === 0 && (

            <div className="villagers-empty">

              <div className="villagers-empty-icon">
                ♟
              </div>

              <h3>
                No Villagers
              </h3>

              <p>
                Add your first villager.
              </p>

              <button
                className="villagers-add-button"
                onClick={openAddModal}
              >
                + Add Villager
              </button>

            </div>
          )}


        {/* LIST */}

        {!loading &&
          villagers.length > 0 && (

            <div className="villagers-list">

              {villagers.map(
                (villager, index) => (

                  <div
                    className="villager-row"
                    key={villager._id}
                  >


                    {/* NUMBER */}

                    <div className="villager-number">
                      {index + 1}
                    </div>


                    {/* ICON */}

                    <div className="villager-icon">

                      {villager.name
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>


                    {/* NAME */}

                    <div className="villager-info">

                      <strong>
                        {villager.name}
                      </strong>

                      <span>
                        Village Member
                      </span>

                    </div>


                    {/* MOBILE */}

                    <div className="villager-mobile">

                      <span>
                        MOBILE
                      </span>

                      <strong>
                        {villager.mobile}
                      </strong>

                    </div>


                    {/* GENDER */}

                    <div
                      className={`villager-gender ${genderClass(
                        villager.gender
                      )}`}
                    >
                      {villager.gender}
                    </div>


                    {/* ACTIONS */}

                    <div className="villager-actions">

                      <button
                        className="villager-edit"
                        onClick={() =>
                          openEditModal(
                            villager
                          )
                        }
                        title="Edit"
                      >
                        ✏️
                      </button>


                      <button
                        className="villager-delete"
                        onClick={() =>
                          handleDelete(
                            villager._id
                          )
                        }
                        title="Delete"
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

      </section>


      {/* =====================================
          MODAL
      ====================================== */}

      {showModal && (

        <div
          className="villagers-modal-overlay"
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

          <div className="villagers-modal">


            {/* MODAL HEADER */}

            <div className="villagers-modal-header">

              <div>

                <div className="villagers-eyebrow">
                  VILLAGE MEMBER
                </div>

                <h2>
                  {editingId
                    ? "Edit Villager"
                    : "Add Villager"}
                </h2>

              </div>


              <button
                className="villagers-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="villagers-form"
              onSubmit={handleSubmit}
            >


              {/* NAME */}

              <div className="villagers-form-group">

                <label>
                  Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter villager name"
                  required
                />

              </div>


              {/* MOBILE */}

              <div className="villagers-form-group">

                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  maxLength="15"
                  required
                />

              </div>


              {/* GENDER */}

              <div className="villagers-form-group">

                <label>
                  Gender *
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* ACTIONS */}

              <div className="villagers-modal-actions">

                <button
                  type="button"
                  className="villagers-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="villagers-save"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Villager"
                    : "Save Villager"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================
          CSS
      ====================================== */}

      <style>{`

        .villagers-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        .villagers-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
        }


        .villagers-eyebrow {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }


        .villagers-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 40px;
          font-weight: 800;
        }


        .villagers-header p {
          color: #8d8297;
          margin: 9px 0 0;
        }


        .villagers-add-button {
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
          transition: 0.2s;
        }


        .villagers-add-button:hover {
          transform: translateY(-2px);
        }


        /* COUNT */

        .villagers-count-card {
          width: 250px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          box-sizing: border-box;
        }


        .villagers-count-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
        }


        .villagers-count-card span {
          display: block;
          color: #776d7f;
          font-size: 9px;
          letter-spacing: 1.3px;
          margin-bottom: 5px;
        }


        .villagers-count-card strong {
          color: #f4eff8;
          font-size: 22px;
        }


        /* SECTION */

        .villagers-section {
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }


        .villagers-section-header {
          min-height: 100px;
          padding: 23px 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }


        .villagers-section-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 23px;
        }


        .villagers-section-header > span {
          color: #807589;
          font-size: 12px;
        }


        /* LIST */

        .villagers-list {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }


        .villager-row {
          min-height: 70px;
          padding: 11px 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          background: #18121e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          box-sizing: border-box;
        }


        .villager-number {
          width: 25px;
          color: #625969;
          font-size: 11px;
          text-align: center;
        }


        .villager-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
          font-weight: 800;
        }


        .villager-info {
          flex: 1;
          min-width: 0;
        }


        .villager-info strong {
          display: block;
          color: #eee8f1;
          font-size: 14px;
        }


        .villager-info span {
          display: block;
          color: #6e6475;
          font-size: 10px;
          margin-top: 4px;
        }


        .villager-mobile {
          min-width: 150px;
        }


        .villager-mobile span {
          display: block;
          color: #6e6475;
          font-size: 8px;
          letter-spacing: 1.2px;
          margin-bottom: 4px;
        }


        .villager-mobile strong {
          color: #c8c0cc;
          font-size: 12px;
        }


        .villager-gender {
          min-width: 70px;
          padding: 7px 10px;
          text-align: center;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }


        .villager-gender.male {
          color: #75bce7;
          background: rgba(70,160,220,0.09);
        }


        .villager-gender.female {
          color: #e79db7;
          background: rgba(220,100,150,0.09);
        }


        .villager-gender.other {
          color: #bba5e8;
          background: rgba(150,100,220,0.09);
        }


        .villager-actions {
          display: flex;
          gap: 7px;
        }


        .villager-edit,
        .villager-delete {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
        }


        .villager-edit {
          background: rgba(245,189,69,0.05);
        }


        .villager-delete {
          background: rgba(255,80,80,0.04);
        }


        /* EMPTY */

        .villagers-empty {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #756a7d;
        }


        .villagers-empty-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          border-radius: 15px;
          background: rgba(245,189,69,0.07);
          color: #f5bd45;
          font-size: 22px;
        }


        .villagers-empty h3 {
          margin: 0;
          color: #eae4ee;
        }


        .villagers-empty p {
          margin: 8px 0 20px;
          font-size: 12px;
        }


        /* MODAL */

        .villagers-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(7px);
        }


        .villagers-modal {
          width: min(540px, 100%);
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 19px;
        }


        .villagers-modal-header {
          padding: 23px 25px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }


        .villagers-modal-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 24px;
        }


        .villagers-close {
          width: 37px;
          height: 37px;
          border: none;
          border-radius: 9px;
          background: rgba(255,255,255,0.04);
          color: #aaa0ae;
          font-size: 22px;
          cursor: pointer;
        }


        .villagers-form {
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 17px;
        }


        .villagers-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }


        .villagers-form-group label {
          color: #93879d;
          font-size: 12px;
          font-weight: 600;
        }


        .villagers-form-group input,
        .villagers-form-group select {
          width: 100%;
          height: 48px;
          padding: 0 13px;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          background: #19131f;
          color: #eee8f0;
          outline: none;
        }


        .villagers-form-group input:focus,
        .villagers-form-group select:focus {
          border-color: rgba(245,189,69,0.5);
        }


        .villagers-form-group select {
          cursor: pointer;
        }


        .villagers-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 5px;
        }


        .villagers-cancel {
          padding: 12px 19px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 9px;
          background: rgba(255,255,255,0.03);
          color: #bdb4c3;
          cursor: pointer;
        }


        .villagers-save {
          padding: 12px 19px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(
            135deg,
            #ffd76c,
            #efb43b
          );
          color: #241909;
          font-weight: 800;
          cursor: pointer;
        }


        /* ==========================================
   MOBILE VILLAGERS - COMPACT SINGLE LINE
   ========================================== */

@media (max-width: 700px) {

  .villagers-page {
    padding: 25px 12px 45px;
  }

  .villagers-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .villagers-header h1 {
    font-size: 34px;
  }

  .villagers-count-card {
    width: 100%;
  }


  /* ========================================
     VILLAGER CARD
     ======================================== */

  .villager-row {
    min-height: 0 !important;

    width: 100% !important;

    display: grid !important;

    grid-template-columns:
      minmax(0, 1fr)
      auto
      10px
      auto !important;

    align-items: center !important;

    gap: 7px !important;

    padding: 10px 11px !important;

    box-sizing: border-box !important;

    flex-wrap: nowrap !important;
  }


  /* ========================================
     REMOVE SERIAL NUMBER
     ======================================== */

  .villager-number {
    display: none !important;
  }


  /* ========================================
     REMOVE AVATAR
     ======================================== */

  .villager-icon {
    display: none !important;
  }


  /* ========================================
     NAME
     ======================================== */

  .villager-info {
    min-width: 0 !important;

    width: auto !important;

    flex: none !important;

    overflow: hidden !important;
  }

  .villager-info strong {
    display: block !important;

    margin: 0 !important;

    color: #eee8f1 !important;

    font-size: 11px !important;

    font-weight: 700 !important;

    line-height: 1.2 !important;

    white-space: nowrap !important;

    overflow: hidden !important;

    text-overflow: ellipsis !important;
  }


  /* REMOVE VILLAGE MEMBER TEXT */

  .villager-info span {
    display: none !important;
  }


  /* ========================================
     MOBILE NUMBER
     ======================================== */

  .villager-mobile {
    min-width: 0 !important;

    width: auto !important;

    margin: 0 !important;

    white-space: nowrap !important;
  }


  /* Hide MOBILE label */

  .villager-mobile span {
    display: none !important;
  }


  .villager-mobile strong {
    color: #c8c0cc !important;

    font-size: 9px !important;

    font-weight: 600 !important;

    white-space: nowrap !important;
  }


  /* ========================================
     GENDER DOT
     ======================================== */

  .villager-gender {
    min-width: 9px !important;

    width: 9px !important;

    height: 9px !important;

    padding: 0 !important;

    margin: 0 !important;

    border-radius: 50% !important;

    font-size: 0 !important;

    line-height: 0 !important;

    text-indent: -9999px !important;
  }


  /* MALE = GREEN */

  .villager-gender.male {
    background: #39e875 !important;

    box-shadow:
      0 0 4px #39e875,
      0 0 8px rgba(57, 232, 117, 0.8) !important;
  }


  /* FEMALE = ORANGE */

  .villager-gender.female {
    background: #ff9d32 !important;

    box-shadow:
      0 0 4px #ff9d32,
      0 0 8px rgba(255, 157, 50, 0.8) !important;
  }


  /* OTHER = PURPLE */

  .villager-gender.other {
    background: #b58cff !important;

    box-shadow:
      0 0 4px #b58cff,
      0 0 8px rgba(181, 140, 255, 0.8) !important;
  }


  /* ========================================
     EDIT + DELETE
     ======================================== */

  .villager-actions {
    display: flex !important;

    align-items: center !important;

    justify-content: center !important;

    gap: 4px !important;

    margin: 0 !important;

    flex-shrink: 0 !important;
  }


  .villager-edit,
  .villager-delete {
    width: 27px !important;

    height: 27px !important;

    min-width: 27px !important;

    padding: 0 !important;

    margin: 0 !important;

    border-radius: 7px !important;

    display: flex !important;

    align-items: center !important;

    justify-content: center !important;

    font-size: 10px !important;
  }

}

      `}</style>

    </div>
  );
}

export default Villagers;