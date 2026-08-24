import React, {
  useEffect,
  useState,
} from "react";

import api from "../utils/api";

// =====================================================
// API ENDPOINT
// =====================================================

const API_URL = "/committee";


// =====================================================
// COMMITTEE
// =====================================================

function Committee() {

  const [members, setMembers] =
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
  });


  // ==========================================
  // FETCH MEMBERS
  // ==========================================

  const fetchMembers = async () => {

    try {

      setLoading(true);

      const response =
        await api.get(API_URL);

      const data =
        response?.data ?? response;

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
          "Failed to fetch committee"
        );
      }

      setMembers(
        Array.isArray(
          data?.committee
        )
          ? data.committee
          : []
      );

    } catch (error) {

      console.error(
        "FETCH COMMITTEE ERROR:",
        error
      );

      alert(
        error.message ||
        "Unable to load committee members."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    fetchMembers();

  }, []);


  // ==========================================
  // INPUT
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
  // OPEN ADD
  // ==========================================

  const openAddModal = () => {

    setEditingId(null);

    setForm({
      name: "",
      mobile: "",
    });

    setShowModal(true);

  };


  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEditModal = (
    member
  ) => {

    setEditingId(
      member._id
    );

    setForm({
      name: member.name || "",
      mobile: member.mobile || "",
    });

    setShowModal(true);

  };


  // ==========================================
  // CLOSE
  // ==========================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingId(null);

    setForm({
      name: "",
      mobile: "",
    });

  };


  // ==========================================
  // ADD / UPDATE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // ------------------------------------------
    // NAME VALIDATION
    // ------------------------------------------

    if (!form.name.trim()) {

      alert(
        "Please enter name."
      );

      return;
    }


    // ------------------------------------------
    // MOBILE VALIDATION
    // ------------------------------------------

    if (!form.mobile.trim()) {

      alert(
        "Please enter mobile number."
      );

      return;
    }


    try {

      setSaving(true);


      const payload = {

        name:
          form.name.trim(),

        mobile:
          form.mobile.trim(),

      };


      let response;


      // ========================================
      // UPDATE
      // ========================================

      if (editingId) {

        response =
          await api.put(
            `${API_URL}/${editingId}`,
            payload
          );

      }

      // ========================================
      // ADD
      // ========================================

      else {

        response =
          await api.post(
            API_URL,
            payload
          );

      }


      const data =
        response?.data ?? response;


      if (
        data?.success === false
      ) {

        throw new Error(
          data?.message ||
          "Failed to save member"
        );

      }


      alert(
        editingId
          ? "Committee member updated successfully."
          : "Committee member added successfully."
      );


      closeModal();

      await fetchMembers();


    } catch (error) {

      console.error(
        "SAVE COMMITTEE ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to save member."
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
        "Are you sure you want to delete this committee member?"
      );


    if (!confirmed) return;


    try {

      const response =
        await api.delete(
          `${API_URL}/${id}`
        );


      const data =
        response?.data ?? response;


      if (
        data?.success === false
      ) {

        throw new Error(
          data?.message ||
          "Failed to delete member"
        );

      }


      await fetchMembers();


    } catch (error) {

      console.error(
        "DELETE COMMITTEE ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to delete member."
      );

    }

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="committee-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="committee-header">

        <div>

          <div className="committee-eyebrow">
            GANESH UTSAVAM
          </div>


          <h1>
            Committee
          </h1>


          <p>
            Manage festival committee members.
          </p>

        </div>


        <button
          className="committee-add-button"
          onClick={openAddModal}
        >
          + Add Member
        </button>

      </div>


      {/* =====================================
          COUNT
      ====================================== */}

      <div className="committee-count-card">

        <div className="committee-count-icon">
          ♟
        </div>


        <div>

          <span>
            COMMITTEE MEMBERS
          </span>


          <strong>
            {members.length}
          </strong>

        </div>

      </div>


      {/* =====================================
          LIST
      ====================================== */}

      <section className="committee-section">


        <div className="committee-section-header">

          <div>

            <div className="committee-eyebrow">
              MEMBERS
            </div>


            <h2>
              Committee List
            </h2>

          </div>


          <span>

            {members.length}{" "}

            {members.length === 1
              ? "member"
              : "members"}

          </span>

        </div>


        {/* ===================================
            LOADING
        =================================== */}

        {loading ? (

          <div className="committee-empty">

            Loading committee members...

          </div>

        )


        /* ===================================
           EMPTY
        =================================== */

        : members.length === 0 ? (

          <div className="committee-empty">

            <div className="committee-empty-icon">
              ♟
            </div>


            <h3>
              No Committee Members
            </h3>


            <p>
              Add your first committee member.
            </p>


            <button
              className="committee-add-button"
              onClick={openAddModal}
            >
              + Add Member
            </button>

          </div>

        )


        /* ===================================
           MEMBERS
        =================================== */

        : (

          <div className="committee-list">

            {members.map(
              (
                member,
                index
              ) => (

                <div
                  className="committee-row"
                  key={member._id}
                >


                  {/* NUMBER */}

                  <div className="committee-number">

                    {index + 1}

                  </div>


                  {/* ICON */}

                  <div className="committee-member-icon">

                    {member.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>


                  {/* NAME */}

                  <div className="committee-member-info">

                    <strong>
                      {member.name}
                    </strong>


                    <span>
                      Committee Member
                    </span>

                  </div>


                  {/* MOBILE */}

                  <div className="committee-mobile">

                    <span>
                      MOBILE
                    </span>


                    <strong>
                      {member.mobile}
                    </strong>

                  </div>


                  {/* ACTIONS */}

                  <div className="committee-actions">


                    <button
                      className="committee-edit"
                      onClick={() =>
                        openEditModal(
                          member
                        )
                      }
                      title="Edit"
                    >
                      ✏️
                    </button>


                    <button
                      className="committee-delete"
                      onClick={() =>
                        handleDelete(
                          member._id
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
          className="committee-modal-overlay"
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


          <div className="committee-modal">


            {/* MODAL HEADER */}

            <div className="committee-modal-header">

              <div>

                <div className="committee-eyebrow">
                  COMMITTEE
                </div>


                <h2>

                  {editingId
                    ? "Edit Member"
                    : "Add Member"}

                </h2>

              </div>


              <button
                className="committee-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="committee-form"
              onSubmit={handleSubmit}
            >


              {/* NAME */}

              <div className="committee-form-group">

                <label>
                  Name *
                </label>


                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />

              </div>


              {/* MOBILE */}

              <div className="committee-form-group">

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


              {/* ACTIONS */}

              <div className="committee-modal-actions">


                <button
                  type="button"
                  className="committee-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="committee-save"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Member"
                    : "Save Member"}

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

        .committee-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        .committee-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
        }


        .committee-eyebrow {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }


        .committee-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 40px;
          font-weight: 800;
        }


        .committee-header p {
          color: #8d8297;
          margin: 9px 0 0;
        }


        .committee-add-button {
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
        }


        /* =====================================
           COUNT
        ====================================== */

        .committee-count-card {
          width: 260px;
          padding: 20px;

          display: flex;
          align-items: center;

          gap: 14px;
          margin-bottom: 24px;

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 16px;
        }


        .committee-count-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            rgba(245,189,69,0.08);

          color: #f5bd45;
        }


        .committee-count-card span {
          display: block;

          color: #776d7f;

          font-size: 9px;

          letter-spacing: 1.3px;

          margin-bottom: 5px;
        }


        .committee-count-card strong {
          color: #f4eff8;

          font-size: 22px;
        }


        /* =====================================
           SECTION
        ====================================== */

        .committee-section {
          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 20px;

          overflow: hidden;
        }


        .committee-section-header {
          min-height: 100px;

          padding: 23px 27px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .committee-section-header h2 {
          margin: 0;

          color: #f4eff8;

          font-size: 23px;
        }


        .committee-section-header > span {
          color: #807589;

          font-size: 12px;
        }


        /* =====================================
           LIST
        ====================================== */

        .committee-list {
          padding: 18px;

          display: flex;

          flex-direction: column;

          gap: 9px;
        }


        .committee-row {
          min-height: 70px;

          padding: 11px 15px;

          display: flex;

          align-items: center;

          gap: 15px;

          background: #18121e;

          border:
            1px solid
            rgba(255,255,255,0.06);

          border-radius: 12px;

          box-sizing: border-box;
        }


        .committee-number {
          width: 25px;

          color: #625969;

          font-size: 11px;

          text-align: center;
        }


        .committee-member-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background:
            rgba(245,189,69,0.08);

          color: #f5bd45;

          font-weight: 800;
        }


        .committee-member-info {
          flex: 1;

          min-width: 0;
        }


        .committee-member-info strong {
          display: block;

          color: #eee8f1;

          font-size: 14px;
        }


        .committee-member-info span {
          display: block;

          color: #6e6475;

          font-size: 10px;

          margin-top: 4px;
        }


        .committee-mobile {
          min-width: 150px;
        }


        .committee-mobile span {
          display: block;

          color: #6e6475;

          font-size: 8px;

          letter-spacing: 1.2px;

          margin-bottom: 4px;
        }


        .committee-mobile strong {
          color: #c8c0cc;

          font-size: 12px;
        }


        .committee-actions {
          display: flex;

          gap: 7px;
        }


        .committee-edit,
        .committee-delete {
          width: 36px;
          height: 36px;

          border-radius: 8px;

          cursor: pointer;

          border:
            1px solid
            rgba(255,255,255,0.07);
        }


        .committee-edit {
          background:
            rgba(245,189,69,0.05);
        }


        .committee-delete {
          background:
            rgba(255,80,80,0.04);
        }


        /* =====================================
           EMPTY
        ====================================== */

        .committee-empty {
          min-height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #756a7d;
        }


        .committee-empty-icon {
          width: 60px;
          height: 60px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 15px;

          border-radius: 15px;

          background:
            rgba(245,189,69,0.07);

          color: #f5bd45;

          font-size: 22px;
        }


        .committee-empty h3 {
          margin: 0;

          color: #eae4ee;
        }


        .committee-empty p {
          margin: 8px 0 20px;

          font-size: 12px;
        }


        /* =====================================
           MODAL
        ====================================== */

        .committee-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 20px;

          background:
            rgba(0,0,0,0.78);

          backdrop-filter: blur(7px);
        }


        .committee-modal {
          width: min(540px, 100%);

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.1);

          border-radius: 19px;
        }


        .committee-modal-header {
          padding: 23px 25px;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .committee-modal-header h2 {
          margin: 0;

          color: #f4eff8;

          font-size: 24px;
        }


        .committee-close {
          width: 37px;
          height: 37px;

          border: none;

          border-radius: 9px;

          background:
            rgba(255,255,255,0.04);

          color: #aaa0ae;

          font-size: 22px;

          cursor: pointer;
        }


        .committee-form {
          padding: 25px;

          display: flex;

          flex-direction: column;

          gap: 17px;
        }


        .committee-form-group {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }


        .committee-form-group label {
          color: #93879d;

          font-size: 12px;

          font-weight: 600;
        }


        .committee-form-group input {
          width: 100%;

          height: 48px;

          padding: 0 13px;

          box-sizing: border-box;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 10px;

          background: #19131f;

          color: #eee8f0;

          outline: none;
        }


        .committee-form-group input:focus {
          border-color:
            rgba(245,189,69,0.5);
        }


        .committee-modal-actions {
          display: flex;

          justify-content: flex-end;

          gap: 10px;

          margin-top: 5px;
        }


        .committee-cancel {
          padding: 12px 19px;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.03);

          color: #bdb4c3;

          cursor: pointer;
        }


        .committee-save {
          padding: 12px 19px;

          border: none;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #ffd76c,
              #efb43b
            );

          color: #241909;

          font-weight: 800;

          cursor: pointer;
        }


        /* =====================================
           MOBILE COMMITTEE DESIGN
        ====================================== */

        @media (max-width: 700px) {

          .committee-page {
            padding:
              25px 14px 45px;
          }


          .committee-header {
            flex-direction: column;

            align-items: flex-start;

            gap: 16px;
          }


          .committee-header h1 {
            font-size: 34px;
          }


          .committee-count-card {
            width: 100%;

            box-sizing: border-box;
          }


          /* MEMBER CARD */

          .committee-row {

            display: grid !important;

            grid-template-columns:
              minmax(0, 1fr)
              auto
              auto;

            align-items: center;

            column-gap: 8px;

            min-height: 0 !important;

            width: 100%;

            padding:
              10px 10px !important;

            box-sizing: border-box;

            border-radius: 10px;
          }


          /* REMOVE SERIAL */

          .committee-number {
            display: none !important;
          }


          /* REMOVE AVATAR */

          .committee-member-icon {
            display: none !important;
          }


          /* NAME */

          .committee-member-info {

            min-width: 0 !important;

            width: auto !important;

            margin: 0 !important;

            padding: 0 !important;

            flex: none !important;
          }


          .committee-member-info strong {

            display: block;

            margin: 0;

            color: #eee8f1;

            font-size: 11px;

            font-weight: 700;

            line-height: 1.2;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          /* REMOVE COMMITTEE MEMBER TEXT */

          .committee-member-info span {
            display: none !important;
          }


          /* MOBILE NUMBER */

          .committee-mobile {

            min-width: 0 !important;

            width: auto !important;

            margin: 0 !important;

            padding: 0 !important;

            white-space: nowrap;

            text-align: right;
          }


          /* REMOVE MOBILE LABEL */

          .committee-mobile span {
            display: none !important;
          }


          .committee-mobile strong {

            display: block;

            margin: 0;

            color: #c8c0cc;

            font-size: 9px;

            font-weight: 600;

            white-space: nowrap;
          }


          /* EDIT + DELETE */

          .committee-actions {

            display: flex !important;

            align-items: center;

            justify-content: center;

            gap: 4px;

            margin: 0 !important;

            padding: 0 !important;

            flex-shrink: 0;
          }


          .committee-edit,
          .committee-delete {

            width: 27px !important;

            height: 27px !important;

            min-width: 27px !important;

            padding: 0 !important;

            margin: 0 !important;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 7px;

            font-size: 10px;
          }

        }

      `}</style>

    </div>

  );

}


export default Committee;