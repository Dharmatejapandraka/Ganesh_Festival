import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../utils/api";

const API_URL =
  "http://localhost:5000/api";

function Admin() {
  const navigate = useNavigate();

  const {
    user,
    isAdmin,
  } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  // ==========================================
  // PASSWORD RESET STATE
  // ==========================================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  // ==========================================
  // CHECK ADMIN
  // ==========================================

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [
    user,
    isAdmin,
    navigate,
  ]);


  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch users"
        );
      }

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : []
      );

    } catch (error) {
      console.error(
        "FETCH USERS ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to load users."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);


  // ==========================================
  // CHANGE ROLE
  // ==========================================

  const changeRole = async (
    userId,
    newRole
  ) => {

    const confirmed =
      window.confirm(
        `Change this user to ${newRole}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(userId);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${userId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to change role"
        );
      }

      setUsers(
        (previous) =>
          previous.map(
            (item) =>
              item._id === userId
                ? {
                    ...item,
                    role: newRole,
                  }
                : item
          )
      );

    } catch (error) {
      console.error(
        "CHANGE ROLE ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to change role."
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // DELETE USER
  // ==========================================

  const deleteUser = async (
    userId,
    userName
  ) => {

    const confirmed =
      window.confirm(
        `Delete ${userName}? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(userId);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${userId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to delete user"
        );
      }

      setUsers(
        (previous) =>
          previous.filter(
            (item) =>
              item._id !== userId
          )
      );

    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to delete user."
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // OPEN PASSWORD MODAL
  // ==========================================

  const openPasswordModal = (
    member
  ) => {
    setSelectedUser(member);

    setNewPassword("");

    setConfirmPassword("");

    setShowPasswordModal(true);
  };


  // ==========================================
  // CLOSE PASSWORD MODAL
  // ==========================================

  const closePasswordModal = () => {

    if (passwordLoading) {
      return;
    }

    setShowPasswordModal(false);

    setSelectedUser(null);

    setNewPassword("");

    setConfirmPassword("");
  };


  // ==========================================
  // RESET USER PASSWORD
  // ==========================================

  const resetUserPassword = async (
    e
  ) => {

    e.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!newPassword) {
      alert(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "Passwords do not match."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Change password for ${selectedUser.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setPasswordLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${selectedUser._id}/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            password:
              newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to reset password."
        );
      }

      alert(
        `Password changed successfully for ${selectedUser.name}.`
      );

      setShowPasswordModal(false);

      setSelectedUser(null);

      setNewPassword("");

      setConfirmPassword("");

    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to reset password."
      );

    } finally {
      setPasswordLoading(false);
    }
  };


  // ==========================================
  // ROLE TEXT
  // ==========================================

  const roleLabel = (
    role
  ) => {
    if (role === "editor") {
      return "Editor";
    }

    return "Viewer";
  };


  // ==========================================
  // DATE
  // ==========================================

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
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user || !isAdmin) {
    return null;
  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="admin-header">

        <div>

          <div className="admin-eyebrow">
            ADMINISTRATION
          </div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage registered members
            and their access permissions.
          </p>

        </div>


        <div className="admin-badge">

          <span>
            ADMIN
          </span>

          <strong>
            {user.name}
          </strong>

        </div>

      </div>


      {/* =====================================
          STATS
      ====================================== */}

      <div className="admin-stats">

        {/* REGISTERED MEMBERS */}

        <div className="admin-stat">

          <div className="admin-stat-icon">
            ♟
          </div>

          <div>

            <span>
              REGISTERED MEMBERS
            </span>

            <strong>
              {users.length}
            </strong>

          </div>

        </div>


        {/* VIEWERS */}

        <div className="admin-stat">

          <div className="admin-stat-icon viewer">
            👁
          </div>

          <div>

            <span>
              VIEWERS
            </span>

            <strong>
              {
                users.filter(
                  (item) =>
                    item.role ===
                    "viewer"
                ).length
              }
            </strong>

          </div>

        </div>


        {/* EDITORS */}

        <div className="admin-stat">

          <div className="admin-stat-icon editor">
            ✏
          </div>

          <div>

            <span>
              EDITORS
            </span>

            <strong>
              {
                users.filter(
                  (item) =>
                    item.role ===
                    "editor"
                ).length
              }
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================
          USER LIST
      ====================================== */}

      <section className="admin-section">

        <div className="admin-section-header">

          <div>

            <div className="admin-eyebrow">
              ACCESS MANAGEMENT
            </div>

            <h2>
              Registered Members
            </h2>

          </div>

          <span>
            {users.length} users
          </span>

        </div>


        {loading ? (

          <div className="admin-empty">
            Loading registered members...
          </div>

        ) : users.length === 0 ? (

          <div className="admin-empty">

            <div className="admin-empty-icon">
              ♟
            </div>

            <h3>
              No registered members
            </h3>

            <p>
              Registered users will appear here.
            </p>

          </div>

        ) : (

          <div className="admin-user-list">

            {users.map(
              (member, index) => (

                <div
                  className="admin-user-row"
                  key={member._id}
                >

                  {/* NUMBER */}

                  <div className="admin-number">
                    {index + 1}
                  </div>


                  {/* AVATAR */}

                  <div className="admin-avatar">

                    {member.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>


                  {/* USER INFO */}

                  <div className="admin-user-info">

                    <strong>
                      {member.name}
                    </strong>

                    <span>
                      {member.mobile}
                    </span>

                  </div>


                  {/* REGISTERED DATE */}

                  <div className="admin-date">

                    <span>
                      REGISTERED
                    </span>

                    <strong>
                      {formatDate(
                        member.createdAt
                      )}
                    </strong>

                  </div>


                  {/* ROLE */}

                  <div
                    className={`admin-role ${member.role}`}
                  >
                    {roleLabel(
                      member.role
                    )}
                  </div>


                  {/* PERMISSION */}

                  <div className="admin-permission">

                    <select
                      value={
                        member.role
                      }
                      disabled={
                        updatingId ===
                        member._id
                      }
                      onChange={(e) =>
                        changeRole(
                          member._id,
                          e.target.value
                        )
                      }
                    >

                      <option value="viewer">
                        Viewer
                      </option>

                      <option value="editor">
                        Editor
                      </option>

                    </select>

                  </div>


                  {/* RESET PASSWORD */}

                  <button
                    type="button"
                    className="admin-password"
                    disabled={
                      updatingId ===
                      member._id ||
                      passwordLoading
                    }
                    onClick={() =>
                      openPasswordModal(
                        member
                      )
                    }
                    title="Change password"
                  >
                    🔑
                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="admin-delete"
                    disabled={
                      updatingId ===
                      member._id ||
                      passwordLoading
                    }
                    onClick={() =>
                      deleteUser(
                        member._id,
                        member.name
                      )
                    }
                    title="Delete user"
                  >
                    🗑️
                  </button>

                </div>
              )
            )}

          </div>

        )}

      </section>


      {/* =====================================
          INFORMATION
      ====================================== */}

      <div className="admin-info-box">

        <div className="admin-info-icon">
          ℹ
        </div>

        <div>

          <strong>
            Access levels
          </strong>

          <p>
            <b>Viewer</b> can view festival
            information.{" "}

            <b>Editor</b> can add, edit and
            delete festival records.

            Only the admin can change
            user permissions or passwords.
          </p>

        </div>

      </div>


      {/* =====================================
          RESET PASSWORD MODAL
      ====================================== */}

      {showPasswordModal &&
        selectedUser && (

          <div
            className="admin-modal-overlay"
            onMouseDown={(e) => {

              if (
                e.target ===
                  e.currentTarget &&
                !passwordLoading
              ) {
                closePasswordModal();
              }

            }}
          >

            <div className="admin-password-modal">

              {/* MODAL HEADER */}

              <div className="admin-modal-header">

                <div>

                  <div className="admin-eyebrow">
                    ADMINISTRATION
                  </div>

                  <h2>
                    Change Password
                  </h2>

                  <p>
                    Update account password
                  </p>

                </div>


                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={
                    closePasswordModal
                  }
                  disabled={
                    passwordLoading
                  }
                  aria-label="Close"
                >
                  ×
                </button>

              </div>


              {/* MODAL FORM */}

              <form
                className="admin-password-form"
                onSubmit={
                  resetUserPassword
                }
              >

                {/* SELECTED USER */}

                <div className="admin-password-user">

                  <strong>
                    {selectedUser.name}
                  </strong>

                  <span>
                    {selectedUser.mobile}
                  </span>

                </div>


                {/* NEW PASSWORD */}

                <div className="admin-form-group">

                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    minLength={6}
                    autoComplete="new-password"
                    disabled={
                      passwordLoading
                    }
                    required
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="admin-form-group">

                  <label>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Re-enter new password"
                    minLength={6}
                    autoComplete="new-password"
                    disabled={
                      passwordLoading
                    }
                    required
                  />

                </div>


                <div className="admin-password-note">

                  Password must be at least
                  6 characters.

                </div>


                {/* ACTIONS */}

                <div className="admin-modal-actions">

                  <button
                    type="button"
                    className="admin-cancel-button"
                    onClick={
                      closePasswordModal
                    }
                    disabled={
                      passwordLoading
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="admin-save-password"
                    disabled={
                      passwordLoading
                    }
                  >
                    {passwordLoading
                      ? "Updating..."
                      : "Update Password"}
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

        .admin-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 42px 60px;
          box-sizing: border-box;
        }


        .admin-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
        }


        .admin-eyebrow {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }


        .admin-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 40px;
          font-weight: 800;
        }


        .admin-header p {
          margin: 9px 0 0;
          color: #8d8297;
        }


        .admin-badge {
          min-width: 150px;
          padding: 14px 18px;
          background: #120d17;
          border: 1px solid rgba(245,189,69,0.15);
          border-radius: 13px;
        }


        .admin-badge span {
          display: block;
          color: #f5bd45;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 5px;
        }


        .admin-badge strong {
          color: #ddd5e1;
          font-size: 13px;
        }


        /* STATS */

        .admin-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }


        .admin-stat {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 17px;
        }


        .admin-stat-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
        }


        .admin-stat-icon.viewer {
          background: rgba(100,170,220,0.08);
        }


        .admin-stat-icon.editor {
          background: rgba(120,200,140,0.08);
        }


        .admin-stat span {
          display: block;
          color: #776d7f;
          font-size: 8px;
          letter-spacing: 1.3px;
          margin-bottom: 5px;
        }


        .admin-stat strong {
          color: #f4eff8;
          font-size: 23px;
        }


        /* SECTION */

        .admin-section {
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }


        .admin-section-header {
          min-height: 100px;
          padding: 23px 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }


        .admin-section-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 23px;
        }


        .admin-section-header > span {
          color: #807589;
          font-size: 12px;
        }


        /* USER LIST */

        .admin-user-list {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }


        .admin-user-row {
          min-height: 72px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: #18121e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          box-sizing: border-box;
        }


        .admin-number {
          width: 25px;
          color: #625969;
          font-size: 11px;
          text-align: center;
        }


        .admin-avatar {
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


        .admin-user-info {
          flex: 1;
          min-width: 150px;
        }


        .admin-user-info strong {
          display: block;
          color: #eee8f1;
          font-size: 14px;
        }


        .admin-user-info span {
          display: block;
          color: #6e6475;
          font-size: 10px;
          margin-top: 4px;
        }


        .admin-date {
          width: 120px;
        }


        .admin-date span {
          display: block;
          color: #625969;
          font-size: 7px;
          letter-spacing: 1.1px;
          margin-bottom: 4px;
        }


        .admin-date strong {
          color: #9b91a1;
          font-size: 10px;
        }


        .admin-role {
          width: 65px;
          padding: 7px 8px;
          text-align: center;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }


        .admin-role.viewer {
          color: #79b8dd;
          background: rgba(80,160,220,0.08);
        }


        .admin-role.editor {
          color: #79c98d;
          background: rgba(80,190,110,0.08);
        }


        .admin-permission select {
          height: 36px;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: #211a28;
          color: #c9c1cc;
          outline: none;
          cursor: pointer;
          font-size: 10px;
        }


        /* RESET PASSWORD BUTTON */

        .admin-password {
          width: 36px;
          height: 36px;
          padding: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid
            rgba(245,189,69,0.12);

          border-radius: 8px;

          background:
            rgba(245,189,69,0.05);

          color: #f5bd45;

          cursor: pointer;

          font-size: 14px;

          flex-shrink: 0;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }


        .admin-password:hover {
          background:
            rgba(245,189,69,0.13);

          transform: translateY(-1px);
        }


        .admin-password:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }


        /* DELETE */

        .admin-delete {
          width: 36px;
          height: 36px;
          padding: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid
            rgba(255,80,80,0.08);

          border-radius: 8px;

          background:
            rgba(255,80,80,0.04);

          cursor: pointer;

          flex-shrink: 0;
        }


        .admin-delete:hover {
          background:
            rgba(255,80,80,0.10);
        }


        .admin-delete:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }


        /* EMPTY */

        .admin-empty {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #756a7d;
        }


        .admin-empty-icon {
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


        .admin-empty h3 {
          margin: 0;
          color: #eae4ee;
        }


        .admin-empty p {
          font-size: 12px;
        }


        /* INFO */

        .admin-info-box {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: 18px;
          padding: 17px 20px;
          background: rgba(245,189,69,0.035);
          border: 1px solid rgba(245,189,69,0.08);
          border-radius: 13px;
        }


        .admin-info-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
        }


        .admin-info-box strong {
          color: #d8d0dc;
          font-size: 12px;
        }


        .admin-info-box p {
          margin: 5px 0 0;
          color: #766c7d;
          font-size: 10px;
          line-height: 1.6;
        }


        /* =====================================
           PASSWORD MODAL
        ====================================== */

        .admin-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(0,0,0,0.78);

          backdrop-filter:
            blur(7px);

          box-sizing: border-box;
        }


        .admin-password-modal {
          width: min(
            450px,
            100%
          );

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.10);

          border-radius: 18px;

          overflow: hidden;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.5);

          animation:
            adminModalIn
            0.2s ease;
        }


        @keyframes adminModalIn {

          from {
            opacity: 0;
            transform:
              translateY(10px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }


        .admin-modal-header {
          padding: 22px;

          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 15px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.07);
        }


        .admin-modal-header h2 {
          margin: 0;

          color: #f4eff8;

          font-size: 22px;
        }


        .admin-modal-header p {
          margin: 6px 0 0;

          color: #766b7e;

          font-size: 12px;
        }


        .admin-modal-close {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 8px;

          background:
            rgba(255,255,255,0.05);

          color: #aaa0ae;

          font-size: 21px;

          line-height: 1;

          cursor: pointer;
        }


        .admin-modal-close:hover {
          background:
            rgba(255,255,255,0.10);

          color: #fff;
        }


        .admin-modal-close:disabled {
          opacity: 0.4;

          cursor: not-allowed;
        }


        /* PASSWORD FORM */

        .admin-password-form {
          padding: 22px;

          display: flex;

          flex-direction: column;

          gap: 16px;

          box-sizing: border-box;
        }


        .admin-password-user {
          padding: 13px 15px;

          display: flex;

          flex-direction: column;

          gap: 4px;

          border-radius: 10px;

          background:
            rgba(245,189,69,0.05);

          border:
            1px solid
            rgba(245,189,69,0.10);
        }


        .admin-password-user strong {
          color: #eee8f1;

          font-size: 14px;
        }


        .admin-password-user span {
          color: #746a7c;

          font-size: 11px;
        }


        .admin-form-group {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .admin-form-group label {
          color: #a99eae;

          font-size: 12px;

          font-weight: 700;
        }


        .admin-form-group input {
          width: 100%;

          height: 46px;

          padding: 0 13px;

          box-sizing: border-box;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 9px;

          outline: none;

          background: #19131f;

          color: #eee8f0;

          font-size: 13px;
        }


        .admin-form-group input:focus {
          border-color:
            rgba(245,189,69,0.50);

          box-shadow:
            0 0 0 3px
            rgba(245,189,69,0.06);
        }


        .admin-form-group input::placeholder {
          color: #62596a;
        }


        .admin-form-group input:disabled {
          opacity: 0.55;

          cursor: not-allowed;
        }


        .admin-password-note {
          padding: 10px 12px;

          border-radius: 8px;

          background:
            rgba(255,255,255,0.025);

          color: #706678;

          font-size: 10px;

          line-height: 1.5;
        }


        /* MODAL ACTIONS */

        .admin-modal-actions {
          display: flex;

          justify-content: flex-end;

          gap: 10px;

          margin-top: 4px;
        }


        .admin-cancel-button {
          padding: 11px 17px;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.03);

          color: #bdb4c3;

          font-weight: 700;

          cursor: pointer;
        }


        .admin-cancel-button:hover {
          background:
            rgba(255,255,255,0.07);
        }


        .admin-save-password {
          padding: 11px 17px;

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


        .admin-save-password:hover {
          filter: brightness(1.05);
        }


        .admin-save-password:disabled,
        .admin-cancel-button:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }


        /* =====================================
           TABLET
        ====================================== */

        @media (max-width: 950px) {

          .admin-user-row {
            flex-wrap: wrap;
          }


          .admin-date {
            width: auto;
            margin-left: 40px;
          }

        }


        /* =====================================
           MOBILE
        ====================================== */

        @media (max-width: 700px) {

          .admin-page {
            padding:
              20px 12px 40px;
          }


          /* STATS */

          .admin-stats {
            display: grid;

            grid-template-columns:
              repeat(3, 1fr);

            gap: 7px;

            margin-bottom: 18px;
          }


          .admin-stat {
            min-width: 0;

            padding: 12px 8px;

            display: flex;

            flex-direction: column;

            align-items: flex-start;

            gap: 7px;

            border-radius: 12px;
          }


          .admin-stat-icon {
            width: 30px;
            height: 30px;

            border-radius: 8px;

            font-size: 12px;
          }


          .admin-stat span {
            font-size: 6px;

            letter-spacing:
              0.7px;

            white-space: nowrap;
          }


          .admin-stat strong {
            font-size: 18px;
          }


          /* SECTION */

          .admin-section {
            border-radius: 15px;

            overflow: hidden;
          }


          .admin-section-header {
            min-height: 70px;

            padding: 16px 14px;
          }


          .admin-section-header h2 {
            font-size: 19px;
          }


          .admin-section-header > span {
            font-size: 9px;
          }


          /* MEMBER LIST */

          .admin-user-list {
            padding: 0;

            display: flex;

            flex-direction: column;

            gap: 0;

            overflow: hidden;
          }


          /* MEMBER ROW */

          .admin-user-row {
            width: 100%;

            min-width: 0;

            min-height: 64px;

            padding: 10px 12px;

            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              auto
              30px
              30px;

            align-items: center;

            gap: 6px;

            background:
              transparent;

            border: none;

            border-bottom:
              1px solid
              rgba(255,255,255,0.06);

            border-radius: 0;

            box-sizing: border-box;
          }


          .admin-user-row:last-child {
            border-bottom: none;
          }


          /* HIDE DETAILS */

          .admin-number {
            display: none;
          }


          .admin-avatar {
            display: none;
          }


          .admin-date {
            display: none;
          }


          .admin-role {
            display: none;
          }


          /* USER INFO */

          .admin-user-info {
            min-width: 0;

            width: 100%;
          }


          .admin-user-info strong {
            display: block;

            color: #eee8f1;

            font-size: 12px;

            font-weight: 700;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          .admin-user-info span {
            display: block;

            color: #766c7d;

            font-size: 9px;

            margin-top: 3px;

            white-space: nowrap;
          }


          /* PERMISSION */

          .admin-permission {
            width: auto;

            flex-shrink: 0;
          }


          .admin-permission select {
            width: 68px;

            height: 30px;

            padding: 0 5px;

            border:
              1px solid
              rgba(255,255,255,0.08);

            border-radius: 7px;

            background: #211a28;

            color: #c9c1cc;

            outline: none;

            font-size: 8px;
          }


          /* PASSWORD */

          .admin-password {
            width: 30px;
            height: 30px;

            padding: 0;

            border-radius: 7px;

            font-size: 11px;
          }


          /* DELETE */

          .admin-delete {
            width: 30px;
            height: 30px;

            padding: 0;

            border-radius: 7px;

            font-size: 10px;
          }


          /* HEADER */

          .admin-header {
            flex-direction: column;

            align-items: flex-start;

            gap: 12px;
          }


          .admin-header h1 {
            font-size: 30px;
          }


          /* INFO */

          .admin-info-box {
            padding: 14px;

            margin-top: 15px;
          }


          /* MODAL */

          .admin-modal-overlay {
            padding: 12px;
          }


          .admin-password-modal {
            width: 100%;

            max-width: 390px;

            border-radius: 15px;
          }


          .admin-modal-header {
            padding: 18px;
          }


          .admin-modal-header h2 {
            font-size: 20px;
          }


          .admin-password-form {
            padding: 18px;
          }


          .admin-modal-actions {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 8px;
          }


          .admin-cancel-button,
          .admin-save-password {
            width: 100%;

            padding: 11px 8px;

            font-size: 11px;
          }

        }

      `}</style>

    </div>
  );
}

export default Admin;