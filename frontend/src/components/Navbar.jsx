import { useAuth } from "../context/AuthContext";

function Navbar({ setIsOpen }) {

  const {
    user,
  } = useAuth();


  // ==========================================
  // USER NAME
  // ==========================================

  const userName =
    user?.name || "User";


  // ==========================================
  // USER ROLE
  // ==========================================

  const userRole =
    user?.role || "viewer";


  const roleText =
    userRole === "admin"
      ? "Admin"
      : userRole === "editor"
      ? "Editor"
      : "Viewer";


  // ==========================================
  // AVATAR
  // ==========================================

  const avatar =
    userName
      .charAt(0)
      .toUpperCase();


  return (

    <header className="navbar">


      {/* =====================================
          LEFT
      ====================================== */}

      <div className="navbar-left">

        <button
          className="mobile-menu"
          onClick={() =>
            setIsOpen(true)
          }
        >
          ☰
        </button>


        <div>

          <p className="navbar-kicker">
            GANESH UTSAVAM
          </p>

          <h1>
            Festival Dashboard
          </h1>

        </div>

      </div>


      {/* =====================================
          RIGHT
      ====================================== */}

      <div className="navbar-right">


        <button className="navbar-icon">
          ☼
        </button>


        <button className="notification-button">
          ♢
          <span></span>
        </button>


        {/* =================================
            PROFILE
        ================================== */}

        <div className="profile">

          <div className="profile-avatar">
            {avatar}
          </div>


          <div className="profile-info">

            <strong>
              {userName}
            </strong>

            <small>
              {roleText}
            </small>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;