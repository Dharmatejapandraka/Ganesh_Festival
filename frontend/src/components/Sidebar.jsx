import React from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Sidebar({
  isOpen,
  setIsOpen,
}) {

  const navigate = useNavigate();

  const {
    user,
    logout,
    isAdmin,
  } = useAuth();


  // =====================================================
  // ADMIN MOBILE NUMBER
  // =====================================================

  const ADMIN_MOBILE = "9052551462";


  // =====================================================
  // GET USER MOBILE
  // =====================================================

  const userMobile =
    user?.mobile ||
    user?.mobileNumber ||
    user?.phone ||
    user?.phoneNumber ||
    "";


  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const mobileAdmin =
    String(userMobile)
      .replace(/\D/g, "")
      .slice(-10) === ADMIN_MOBILE;


  const roleAdmin =
    String(user?.role || "")
      .toLowerCase()
      .trim() === "admin";


  const finalIsAdmin =
    isAdmin ||
    roleAdmin ||
    mobileAdmin;


  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "========== SIDEBAR =========="
  );

  console.log(
    "SIDEBAR USER:",
    user
  );

  console.log(
    "SIDEBAR ROLE:",
    user?.role
  );

  console.log(
    "SIDEBAR MOBILE:",
    userMobile
  );

  console.log(
    "AUTH isAdmin:",
    isAdmin
  );

  console.log(
    "FINAL ADMIN:",
    finalIsAdmin
  );

  console.log(
    "=============================="
  );


  // =====================================================
  // CLOSE SIDEBAR
  // =====================================================

  const closeSidebar = () => {

    if (setIsOpen) {
      setIsOpen(false);
    }

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    logout();

    closeSidebar();

    navigate("/login");

  };


  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [

    {
      path: "/",
      icon: "⌂",
      label: "Dashboard",
    },

    {
      path: "/committee",
      icon: "♟",
      label: "Committee",
    },

    {
      path: "/villagers",
      icon: "♟",
      label: "Villagers",
    },

    {
      path: "/donations",
      icon: "₹",
      label: "Donations",
    },

    {
      path: "/expenses",
      icon: "◈",
      label: "Expenses",
    },

    {
      path: "/dj-sets",
      icon: "♫",
      label: "DJ Sets",
    },

    {
      path: "/pujari",
      icon: "ॐ",
      label: "Pujari",
    },

    {
      path: "/ganesh-idol",
      icon: "◉",
      label: "Ganesh Idols",
    },

    {
      path: "/photos",
      icon: "▣",
      label: "Photos",
    },

    {
      path: "/nimarganam",
      icon: "▶",
      label: "Nimarganam",
    },

  ];


  // =====================================================
  // RETURN
  // =====================================================

  return (
    <>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {isOpen && (

        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />

      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          isOpen
            ? "sidebar-open"
            : ""
        }`}
      >


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            ॐ
          </div>


          <div>

            <h2>
              Velivolu
            </h2>

            <span>
              GANESH UTSAVAM
            </span>

          </div>

        </div>


        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <div className="sidebar-section-title">
          FESTIVAL
        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">


          {/* =================================================
              NORMAL MENU
          ================================================= */}

          {menuItems.map(
            (item) => (

              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === "/"
                }
                onClick={
                  closeSidebar
                }
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>


                <span>
                  {item.label}
                </span>


                <span className="sidebar-arrow">
                  ›
                </span>

              </NavLink>

            )
          )}


          {/* =================================================
              ADMIN
          ================================================= */}

          {finalIsAdmin && (

            <NavLink
              to="/admin"
              onClick={
                closeSidebar
              }
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }

              style={{
                display: "flex",
                visibility: "visible",
                opacity: 1,
              }}
            >

              <span className="sidebar-icon">
                ⚙
              </span>


              <span>
                Admin
              </span>


              <span className="sidebar-arrow">
                ›
              </span>

            </NavLink>

          )}

        </nav>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">


          {/* =================================================
              FESTIVAL CARD
          ================================================= */}

          <div className="festival-mini-card">

            <div className="mini-diya">
              🪔
            </div>


            <div>

              <strong>
                Ganesh Utsavam
              </strong>


              <small>
                Celebrating together
              </small>

            </div>

          </div>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={
              handleLogout
            }
          >

            <span>
              ↪
            </span>

            Logout

          </button>


        </div>

      </aside>

    </>
  );
}


export default Sidebar;