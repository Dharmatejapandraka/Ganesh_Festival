import React, {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  useFestival,
} from "../context/FestivalContext";


// =====================================================
// LAYOUT
// =====================================================

function Layout({ children }) {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    currentYear,
    changeYear,
  } = useFestival();


  // ===================================================
  // MOBILE MENU
  // ===================================================

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);


  // ===================================================
  // USER / ROLE
  // ===================================================

  const { user } = useAuth();


  /*
   * IMPORTANT:
   *
   * First use AuthContext user.
   *
   * If AuthContext does not have the user yet,
   * read festivalUser directly from localStorage.
   *
   * Your localStorage currently contains:
   *
   * festivalUser -> role: "admin"
   */

  const getSavedUser = () => {

    try {

      const savedUser =
        localStorage.getItem("festivalUser");

      if (savedUser) {

        return JSON.parse(savedUser);

      }

    } catch (error) {

      console.error(
        "LAYOUT: Unable to read festivalUser",
        error
      );

    }

    return null;

  };


  const savedUser = getSavedUser();


  const currentUser =
    user || savedUser;


  const role = String(
    currentUser?.role || "viewer"
  )
    .toLowerCase()
    .trim();


  const isViewer =
    role === "viewer";


  const isEditor =
    role === "editor";


  const isAdmin =
    role === "admin";


  // DEBUG
  console.log(
    "LAYOUT USER:",
    currentUser
  );

  console.log(
    "LAYOUT ROLE:",
    role
  );

  console.log(
    "LAYOUT IS ADMIN:",
    isAdmin
  );


  // ===================================================
  // MENU ITEMS
  // ===================================================

  const menuItems = [

    {
      name: "Dashboard",
      path: "/",
      icon: "⌂",
    },

    {
      name: "Committee",
      path: "/committee",
      icon: "♟",
    },

    {
      name: "Villagers",
      path: "/villagers",
      icon: "♟",
    },

    {
      name: "Donations",
      path: "/donations",
      icon: "₹",
    },

    {
      name: "Expenses",
      path: "/expenses",
      icon: "◇",
    },

    {
      name: "DJ Sets",
      path: "/dj-sets",
      icon: "♫",
    },

    {
      name: "Pujari",
      path: "/pujari",
      icon: "ॐ",
    },

    {
      name: "Ganesh Idols",
      path: "/ganesh-idol",
      icon: "◉",
    },

    {
      name: "Photos",
      path: "/photos",
      icon: "▣",
    },

    {
      name: "Nimarganam",
      path: "/nimarganam",
      icon: "▶",
    },

  ];


  // ===================================================
  // LOCK BODY SCROLL WHEN MOBILE MENU IS OPEN
  // ===================================================

  useEffect(() => {

    if (mobileMenuOpen) {

      document.body.style.overflow = "hidden";

      document.documentElement.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow = "";

      document.documentElement.style.overflow =
        "";

    }


    return () => {

      document.body.style.overflow = "";

      document.documentElement.style.overflow =
        "";

    };

  }, [mobileMenuOpen]);


  // ===================================================
  // YEAR CHANGE
  // ===================================================

  const handleYearChange = (event) => {

    changeYear(
      Number(event.target.value)
    );

  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    const authKeys = [

      "token",

      "festivalToken",

      "authToken",

      "accessToken",

      "festivalAuthToken",

      "isLoggedIn",

      "user",

      "festivalUser",

      "role",

    ];


    authKeys.forEach((key) => {

      localStorage.removeItem(key);

    });


    setMobileMenuOpen(false);

    navigate("/login");

  };


  // ===================================================
  // CLOSE MOBILE MENU
  // ===================================================

  const closeMobileMenu = () => {

    setMobileMenuOpen(false);

  };


  // ===================================================
  // DASHBOARD
  // ===================================================

  const isDashboard =
    location.pathname === "/";


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="app-layout">


      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        {/* LOGO */}

        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">
            ॐ
          </div>

          <div className="sidebar-logo-text">

            <h2>
              Velivolu
            </h2>

            <span>
              GANESH UTSAVAM
            </span>

          </div>

        </div>


        <div className="sidebar-divider" />


        {/* MENU TITLE */}

        <div className="sidebar-title">
          FESTIVAL
        </div>


        {/* DESKTOP MENU */}

        <nav className="sidebar-nav">

          {menuItems.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
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

              <span className="sidebar-link-text">
                {item.name}
              </span>

              {item.name === "Dashboard" && (

                <span className="sidebar-arrow">
                  ›
                </span>

              )}

            </NavLink>

          ))}


          {/* ADMIN */}

          {isAdmin && (

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="sidebar-icon">
                ⚙
              </span>

              <span className="sidebar-link-text">
                Admin
              </span>

              <span className="sidebar-arrow">
                ›
              </span>

            </NavLink>

          )}

        </nav>


        {/* VIEWER INFORMATION */}

        {isViewer && (

          <div className="viewer-role-box">
            👁️ Viewer
          </div>

        )}


        {/* FESTIVAL CARD */}

        <div className="sidebar-festival-card">

          <div className="sidebar-festival-icon">
            🪔
          </div>

          <div className="sidebar-festival-text">

            <strong>
              Ganesh Utsavam
            </strong>

            <span>
              Celebrating together
            </span>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>

      </aside>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileMenuOpen && (

        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

      )}


      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <aside
        className={
          `mobile-sidebar ${
            mobileMenuOpen
              ? "mobile-sidebar-open"
              : ""
          }`
        }
        aria-hidden={!mobileMenuOpen}
      >


        {/* =================================================
            MOBILE HEADER
        ================================================= */}

        <div className="mobile-sidebar-header">

          <div className="mobile-logo-area">

            <div className="mobile-logo-icon">
              ॐ
            </div>

            <div>

              <div className="mobile-logo-name">
                Velivolu
              </div>

              <div className="mobile-logo-subtitle">
                GANESH UTSAVAM
              </div>

            </div>

          </div>


          <button
            type="button"
            className="mobile-close-button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ×
          </button>

        </div>


        {/* =================================================
            MOBILE MENU TITLE
        ================================================= */}

        <div className="mobile-menu-title">
          FESTIVAL
        </div>


        {/* =================================================
            SCROLLABLE MOBILE MENU

            IMPORTANT:
            ONLY THIS SECTION SCROLLS.

            Therefore:

            Dashboard
            Committee
            Villagers
            Donations
            Expenses
            DJ Sets
            Pujari
            Ganesh Idols
            Photos
            Nimarganam
            Admin

            can all be reached.
        ================================================= */}

        <div className="mobile-navigation-scroll">

          <nav className="mobile-navigation">

            {menuItems.map((item) => (

              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `mobile-nav-link ${
                    isActive
                      ? "mobile-nav-link-active"
                      : ""
                  }`
                }
              >

                <span className="mobile-nav-icon">
                  {item.icon}
                </span>

                <span className="mobile-nav-text">
                  {item.name}
                </span>

                <span className="mobile-nav-arrow">
                  ›
                </span>

              </NavLink>

            ))}


            {/* =================================================
                ADMIN
            ================================================= */}

            {isAdmin && (

              <NavLink
                to="/admin"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `mobile-nav-link ${
                    isActive
                      ? "mobile-nav-link-active"
                      : ""
                  }`
                }
              >

                <span className="mobile-nav-icon">
                  ⚙
                </span>

                <span className="mobile-nav-text">
                  Admin
                </span>

                <span className="mobile-nav-arrow">
                  ›
                </span>

              </NavLink>

            )}

          </nav>

        </div>


        {/* =================================================
            MOBILE BOTTOM
        ================================================= */}

        <div className="mobile-sidebar-bottom">


          {/* FESTIVAL CARD */}

          <div className="mobile-festival-card">

            <div className="mobile-festival-icon">
              🪔
            </div>

            <div>

              <strong>
                Ganesh Utsavam
              </strong>

              <span>
                Celebrating together
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="mobile-logout"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="main-area">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="top-header">


          {/* MOBILE HAMBURGER */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open menu"
          >
            ☰
          </button>


          {/* HEADER LEFT */}

          <div className="top-header-left">

            <span className="top-header-small">
              GANESH UTSAVAM
            </span>


            {isDashboard && (

              <h1>
                Festival Dashboard
              </h1>

            )}

          </div>


          {/* YEAR SELECTOR */}

          <div className="year-selector">

            <div className="year-label">

              <span>
                FESTIVAL YEAR
              </span>

              <strong>
                {currentYear}
              </strong>

            </div>


            <select
              value={currentYear}
              onChange={handleYearChange}
              className="year-select"
            >

              <option value="2026">
                2026
              </option>

              <option value="2027">
                2027
              </option>

              <option value="2028">
                2028
              </option>

              <option value="2029">
                2029
              </option>

              <option value="2030">
                2030
              </option>

            </select>


            {!isViewer && (

              <button
                type="button"
                className="year-add-button"
                onClick={() =>
                  navigate("/donations")
                }
                title="Add Donation"
              >
                +
              </button>

            )}

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className={
            `page-content ${
              isDashboard
                ? "dashboard-content"
                : "inner-page-content"
            }`
          }
        >


          {/* VIEWER MESSAGE */}

          {isViewer && !isDashboard && (

            <div className="viewer-message">

              👁️ You are viewing this page
              as a <strong>Viewer</strong>.
              You can view the data but
              cannot add or delete records.

            </div>

          )}


          {/* PAGE */}

          {children}

        </main>

      </div>


      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>{`

        /* =================================================
           DEFAULT
        ================================================= */

        .mobile-menu-button,
        .mobile-sidebar,
        .mobile-menu-overlay {
          display: none;
        }


        /* =================================================
           VIEWER
        ================================================= */

        .viewer-role-box {

          margin: 15px 20px;

          padding: 10px 12px;

          border:
            1px solid
            rgba(255, 193, 7, 0.3);

          border-radius: 10px;

          font-size: 12px;

          color: #f5bd45;

          background:
            rgba(255, 193, 7, 0.05);
        }


        .viewer-message {

          margin-bottom: 20px;

          padding: 16px 20px;

          border:
            1px solid
            rgba(255, 193, 7, 0.25);

          background:
            rgba(255, 193, 7, 0.08);

          border-radius: 12px;

          font-size: 15px;

          color: #eee8f0;
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767px) {


          html,
          body {

            width: 100%;

            max-width: 100%;

            overflow-x: hidden;
          }


          body {
            margin: 0;
          }


          /* -----------------------------------------------
             DESKTOP SIDEBAR
          ----------------------------------------------- */

          .sidebar {
            display: none !important;
          }


          /* -----------------------------------------------
             MAIN
          ----------------------------------------------- */

          .main-area {

            width: 100% !important;

            max-width: 100% !important;

            margin-left: 0 !important;

            padding-left: 0 !important;

            box-sizing: border-box;

            overflow-x: hidden;
          }


          /* =================================================
             HAMBURGER
          ================================================= */

          .mobile-menu-button {

            display: flex;

            align-items: center;

            justify-content: center;

            width: 42px;

            height: 42px;

            min-width: 42px;

            flex-shrink: 0;

            margin:
              0 8px 0 0;

            padding: 0;

            border:
              1px solid
              rgba(255,255,255,0.09);

            border-radius: 11px;

            background: #19131f;

            color: #f5bd45;

            font-size: 21px;

            line-height: 1;

            cursor: pointer;

            z-index: 100;
          }


          .mobile-menu-button:active {
            transform: scale(0.95);
          }


          /* =================================================
             HEADER
          ================================================= */

          .top-header {

            width: 100% !important;

            min-height: 72px;

            display: flex !important;

            align-items: center !important;

            gap: 7px;

            padding:
              12px 14px !important;

            box-sizing: border-box;

            position: relative;

            z-index: 100;

            overflow: hidden;
          }


          .top-header-left {

            flex: 1;

            min-width: 0;

            overflow: hidden;
          }


          .top-header-small {

            display: block;

            font-size: 8px !important;

            letter-spacing: 1.5px;

            white-space: nowrap;
          }


          .top-header h1 {

            margin:
              4px 0 0 !important;

            font-size:
              20px !important;

            line-height:
              1.15 !important;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          /* =================================================
             YEAR
          ================================================= */

          .year-selector {

            flex-shrink: 0;

            display: flex !important;

            align-items: center;

            gap: 6px;

            padding: 5px !important;

            border-radius: 10px !important;
          }


          .year-label {
            display: none !important;
          }


          .year-select {

            width:
              74px !important;

            height:
              38px !important;

            padding:
              0 7px !important;

            font-size:
              12px !important;

            border-radius:
              8px !important;

            box-sizing: border-box;
          }


          .year-add-button {

            width:
              38px !important;

            min-width:
              38px !important;

            height:
              38px !important;

            padding: 0 !important;

            font-size:
              21px !important;

            border-radius:
              9px !important;
          }


          /* =================================================
             PAGE
          ================================================= */

          .page-content {

            width:
              100% !important;

            max-width:
              100% !important;

            box-sizing:
              border-box !important;

            padding:
              18px 14px 30px !important;

            margin: 0 !important;

            overflow-x:
              hidden !important;
          }


          .dashboard-content,
          .inner-page-content {

            width:
              100% !important;

            max-width:
              100% !important;

            box-sizing:
              border-box !important;
          }


          /* =================================================
             OVERLAY
          ================================================= */

          .mobile-menu-overlay {

            display: block;

            position: fixed;

            inset: 0;

            width: 100vw;

            height: 100vh;

            height: 100dvh;

            background:
              rgba(0,0,0,0.72);

            backdrop-filter:
              blur(3px);

            -webkit-backdrop-filter:
              blur(3px);

            z-index: 9998;
          }


          /* =================================================
             MOBILE SIDEBAR
          ================================================= */

          .mobile-sidebar {

            display: flex !important;

            flex-direction: column;

            position: fixed;

            top: 0;

            left: 0;

            bottom: 0;

            width:
              min(320px, 86vw);

            height:
              100vh;

            height:
              100dvh;

            box-sizing:
              border-box;

            padding:
              17px 13px 14px;

            background:
              linear-gradient(
                180deg,
                #160f1c 0%,
                #0b080e 100%
              );

            border-right:
              1px solid
              rgba(255,255,255,0.08);

            box-shadow:
              15px 0 50px
              rgba(0,0,0,0.55);

            z-index: 9999;

            transform:
              translate3d(-110%, 0, 0);

            transition:
              transform 0.28s
              cubic-bezier(0.4, 0, 0.2, 1);

            overflow:
              hidden;

            overscroll-behavior:
              contain;
          }


          /* OPEN */

          .mobile-sidebar-open {

            transform:
              translate3d(0, 0, 0);
          }


          /* =================================================
             MOBILE HEADER
          ================================================= */

          .mobile-sidebar-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            flex-shrink: 0;

            padding:
              4px 2px 18px;

            border-bottom:
              1px solid
              rgba(255,255,255,0.07);

            background:
              #160f1c;

            position: relative;

            z-index: 10;
          }


          .mobile-logo-area {

            display: flex;

            align-items: center;

            gap: 10px;

            min-width: 0;
          }


          .mobile-logo-icon {

            width: 44px;

            height: 44px;

            min-width: 44px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 12px;

            background:
              linear-gradient(
                135deg,
                #ffd76c,
                #efb43b
              );

            color: #241909;

            font-size: 23px;

            font-weight: 900;
          }


          .mobile-logo-name {

            color: #f5bd45;

            font-size: 19px;

            font-weight: 900;

            line-height: 1;
          }


          .mobile-logo-subtitle {

            margin-top: 4px;

            color: #81748a;

            font-size: 7px;

            font-weight: 800;

            letter-spacing: 1.5px;
          }


          /* =================================================
             CLOSE
          ================================================= */

          .mobile-close-button {

            width: 40px;

            height: 40px;

            min-width: 40px;

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

            border:
              1px solid
              rgba(255,255,255,0.08);

            border-radius: 10px;

            background: #19131f;

            color: #eee8f0;

            font-size: 25px;

            line-height: 1;

            cursor: pointer;
          }


          .mobile-close-button:active {
            transform: scale(0.94);
          }


          /* =================================================
             TITLE
          ================================================= */

          .mobile-menu-title {

            flex-shrink: 0;

            margin:
              22px 9px 10px;

            color: #776b80;

            font-size: 9px;

            font-weight: 800;

            letter-spacing: 2px;
          }


          /* =================================================
             ⭐ SCROLLABLE MENU ⭐
          ================================================= */

          .mobile-navigation-scroll {

            flex:
              1 1 auto;

            min-height:
              0;

            overflow-y:
              auto;

            overflow-x:
              hidden;

            -webkit-overflow-scrolling:
              touch;

            overscroll-behavior-y:
              contain;

            touch-action:
              pan-y;

            scrollbar-width:
              thin;

            scrollbar-color:
              rgba(245,189,69,0.35)
              transparent;

            padding-right:
              2px;
          }


          /* Chrome / Edge scrollbar */

          .mobile-navigation-scroll::-webkit-scrollbar {

            width: 5px;
          }


          .mobile-navigation-scroll::-webkit-scrollbar-track {

            background:
              transparent;
          }


          .mobile-navigation-scroll::-webkit-scrollbar-thumb {

            background:
              rgba(245,189,69,0.35);

            border-radius:
              10px;
          }


          .mobile-navigation-scroll::-webkit-scrollbar-thumb:hover {

            background:
              rgba(245,189,69,0.55);
          }


          /* =================================================
             NAVIGATION
          ================================================= */

          .mobile-navigation {

            display: flex;

            flex-direction: column;

            gap: 5px;

            width: 100%;

            padding-bottom: 15px;
          }


          /* =================================================
             NAV LINK
          ================================================= */

          .mobile-nav-link {

            display: flex;

            align-items: center;

            width: 100%;

            min-height: 48px;

            box-sizing: border-box;

            padding:
              6px 9px;

            border-radius: 12px;

            text-decoration: none;

            color: #9b8fa4;

            background:
              transparent;

            transition:
              background 0.2s ease,
              color 0.2s ease;

            flex-shrink: 0;
          }


          .mobile-nav-link:active {

            transform:
              scale(0.98);
          }


          .mobile-nav-link:hover {

            background:
              rgba(255,255,255,0.04);

            color:
              #eee8f0;
          }


          /* ACTIVE */

          .mobile-nav-link-active {

            background:
              linear-gradient(
                90deg,
                rgba(245,189,69,0.13),
                rgba(245,189,69,0.04)
              );

            color:
              #f5bd45;

            box-shadow:
              inset 3px 0 0 #f5bd45;
          }


          /* =================================================
             ICON
          ================================================= */

          .mobile-nav-icon {

            width: 40px;

            height: 40px;

            min-width: 40px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            border-radius: 11px;

            background:
              rgba(255,255,255,0.045);

            color: #9d91a6;

            font-size: 17px;
          }


          .mobile-nav-link-active
          .mobile-nav-icon {

            background:
              rgba(245,189,69,0.10);

            color:
              #f5bd45;
          }


          /* =================================================
             TEXT
          ================================================= */

          .mobile-nav-text {

            flex: 1;

            min-width: 0;

            color:
              inherit;

            font-size: 14px;

            font-weight: 700;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          /* =================================================
             ARROW
          ================================================= */

          .mobile-nav-arrow {

            flex-shrink: 0;

            margin-left: 8px;

            color:
              #6d6175;

            font-size: 20px;

            line-height: 1;
          }


          .mobile-nav-link-active
          .mobile-nav-arrow {

            color:
              #f5bd45;
          }


          /* =================================================
             MOBILE BOTTOM
          ================================================= */

          .mobile-sidebar-bottom {

            flex-shrink: 0;

            padding:
              10px 0 2px;

            border-top:
              1px solid
              rgba(255,255,255,0.06);

            background:
              #0b080e;
          }


          /* =================================================
             FESTIVAL CARD
          ================================================= */

          .mobile-festival-card {

            display: flex;

            align-items: center;

            gap: 10px;

            padding: 12px;

            border:
              1px solid
              rgba(255,255,255,0.08);

            border-radius: 13px;

            background:
              rgba(255,255,255,0.025);
          }


          .mobile-festival-icon {

            width: 36px;

            height: 36px;

            min-width: 36px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 10px;

            background:
              rgba(245,189,69,0.1);
          }


          .mobile-festival-card strong {

            display: block;

            color:
              #e7dfe9;

            font-size: 11px;
          }


          .mobile-festival-card span {

            display: block;

            margin-top: 3px;

            color:
              #766b7d;

            font-size: 9px;
          }


          /* =================================================
             LOGOUT
          ================================================= */

          .mobile-logout {

            width: 100%;

            height: 46px;

            min-height: 46px;

            margin-top: 10px;

            border: none;

            border-radius: 10px;

            background:
              rgba(220,70,70,0.07);

            color:
              #c98282;

            font-size: 12px;

            font-weight: 700;

            text-align: left;

            padding:
              0 14px;

            cursor: pointer;
          }


          .mobile-logout:active {

            transform:
              scale(0.98);
          }


          /* =================================================
             TABLES
          ================================================= */

          table {
            max-width: 100%;
          }


          /* =================================================
             IMAGES
          ================================================= */

          img {
            max-width: 100%;
          }


          /* =================================================
             FORM ELEMENTS
          ================================================= */

          button,
          input,
          select,
          textarea {

            max-width: 100%;
          }

        }


        /* =================================================
           SMALL PHONES
        ================================================= */

        @media (max-width: 390px) {


          .top-header {

            padding:
              10px 10px !important;
          }


          .mobile-menu-button {

            width: 38px;

            min-width: 38px;

            height: 38px;

            font-size: 19px;

            margin-right: 5px;
          }


          .top-header h1 {

            font-size:
              18px !important;
          }


          .year-select {

            width:
              65px !important;

            font-size:
              11px !important;
          }


          .year-add-button {

            width:
              35px !important;

            min-width:
              35px !important;

            height:
              35px !important;
          }


          .page-content {

            padding:
              15px 10px 25px !important;
          }


          .mobile-sidebar {

            width:
              min(310px, 88vw);

            padding-left:
              11px;

            padding-right:
              11px;
          }


          .mobile-nav-link {

            min-height:
              46px;
          }


          .mobile-nav-icon {

            width:
              38px;

            min-width:
              38px;

            height:
              38px;
          }

        }

      `}</style>

    </div>

  );

}


export default Layout;