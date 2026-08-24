import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MobileMenu() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: "⌂",
    },
    {
      label: "Committee",
      path: "/committee",
      icon: "♟",
    },
    {
      label: "Villagers",
      path: "/villagers",
      icon: "♟",
    },
    {
      label: "Donations",
      path: "/donations",
      icon: "₹",
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: "◇",
    },
    {
      label: "DJ Sets",
      path: "/dj-sets",
      icon: "♫",
    },
    {
      label: "Pujari",
      path: "/pujari",
      icon: "ॐ",
    },
    {
      label: "Ganesh Idols",
      path: "/ganesh-idols",
      icon: "◉",
    },
    {
      label: "Photos",
      path: "/photos",
      icon: "▣",
    },
    {
      label: "Nimarganam",
      path: "/nimarganam",
      icon: "▶",
    },
  ];

  if (isAdmin) {
    menuItems.push({
      label: "Admin",
      path: "/admin",
      icon: "⚙",
    });
  }

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* =========================================
          MOBILE TOP BAR
      ========================================= */}

      <div className="mobile-topbar">

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="mobile-brand">

          <div className="mobile-brand-logo">
            ॐ
          </div>

          <div>
            <div className="mobile-brand-name">
              Velivolu
            </div>

            <div className="mobile-brand-subtitle">
              GANESH UTSAVAM
            </div>
          </div>

        </div>

      </div>


      {/* =========================================
          DARK OVERLAY
      ========================================= */}

      {open && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setOpen(false)}
        />
      )}


      {/* =========================================
          MOBILE DRAWER
      ========================================= */}

      <aside
        className={`mobile-drawer ${
          open ? "mobile-drawer-open" : ""
        }`}
      >

        {/* HEADER */}

        <div className="mobile-drawer-header">

          <div className="mobile-drawer-brand">

            <div className="mobile-drawer-logo">
              ॐ
            </div>

            <div>

              <div className="mobile-drawer-name">
                Velivolu
              </div>

              <div className="mobile-drawer-subtitle">
                GANESH UTSAVAM
              </div>

            </div>

          </div>

          <button
            type="button"
            className="mobile-close-button"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

        </div>


        {/* MENU TITLE */}

        <div className="mobile-menu-title">
          FESTIVAL
        </div>


        {/* MENU ITEMS */}

        <nav className="mobile-navigation">

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `mobile-nav-item ${
                  isActive
                    ? "mobile-nav-item-active"
                    : ""
                }`
              }
            >

              <span className="mobile-nav-icon">
                {item.icon}
              </span>

              <span className="mobile-nav-label">
                {item.label}
              </span>

              <span className="mobile-nav-arrow">
                ›
              </span>

            </NavLink>

          ))}

        </nav>


        {/* BOTTOM */}

        <div className="mobile-drawer-bottom">

          <div className="mobile-festival-card">

            <div className="mobile-festival-icon">
              🪔
            </div>

            <div>

              <div className="mobile-festival-name">
                Ganesh Utsavam
              </div>

              <div className="mobile-festival-text">
                Celebrating together
              </div>

            </div>

          </div>


          <button
            type="button"
            className="mobile-logout"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* =========================================
          MOBILE CSS
      ========================================= */}

      <style>{`

        /* =========================================
           DEFAULT - HIDDEN ON DESKTOP
        ========================================= */

        .mobile-topbar,
        .mobile-drawer,
        .mobile-menu-overlay {
          display: none;
        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 767px) {

          .mobile-topbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;

            display: flex;
            align-items: center;

            padding: 0 14px;

            box-sizing: border-box;

            background: rgba(
              13,
              9,
              16,
              0.96
            );

            border-bottom:
              1px solid
              rgba(255,255,255,0.08);

            backdrop-filter: blur(15px);

            z-index: 9000;
          }


          /* MENU BUTTON */

          .mobile-menu-button {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 1px solid
              rgba(255,255,255,0.08);

            border-radius: 11px;

            background: #19131f;

            color: #f5bd45;

            font-size: 22px;

            cursor: pointer;
          }


          .mobile-menu-button:active {
            transform: scale(0.96);
          }


          /* BRAND */

          .mobile-brand {
            display: flex;
            align-items: center;

            gap: 10px;

            margin-left: 12px;
          }


          .mobile-brand-logo {
            width: 38px;
            height: 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background:
              linear-gradient(
                135deg,
                #ffd76c,
                #efb43b
              );

            color: #241909;

            font-size: 20px;
            font-weight: 900;

            box-shadow:
              0 5px 18px
              rgba(245,189,69,0.18);
          }


          .mobile-brand-name {
            color: #f5bd45;

            font-size: 17px;
            font-weight: 900;

            line-height: 1;
          }


          .mobile-brand-subtitle {
            margin-top: 4px;

            color: #8f8298;

            font-size: 7px;
            font-weight: 800;

            letter-spacing: 1.5px;
          }


          /* =========================================
             OVERLAY
          ========================================= */

          .mobile-menu-overlay {
            display: block;

            position: fixed;

            inset: 0;

            background:
              rgba(0,0,0,0.65);

            z-index: 9998;

            animation:
              mobileFadeIn
              0.2s ease;
          }


          @keyframes mobileFadeIn {

            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }

          }


          /* =========================================
             DRAWER
          ========================================= */

          .mobile-drawer {
            display: flex;

            flex-direction: column;

            position: fixed;

            top: 0;
            bottom: 0;
            left: 0;

            width: min(
              300px,
              82vw
            );

            box-sizing: border-box;

            padding: 18px 14px;

            background:
              linear-gradient(
                180deg,
                #160f1c 0%,
                #0c0810 100%
              );

            border-right:
              1px solid
              rgba(255,255,255,0.08);

            box-shadow:
              15px 0 50px
              rgba(0,0,0,0.5);

            z-index: 9999;

            transform:
              translateX(-105%);

            transition:
              transform
              0.25s
              ease;

            overflow-y: auto;
          }


          .mobile-drawer-open {
            transform:
              translateX(0);
          }


          /* =========================================
             DRAWER HEADER
          ========================================= */

          .mobile-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding-bottom: 20px;

            border-bottom:
              1px solid
              rgba(255,255,255,0.07);
          }


          .mobile-drawer-brand {
            display: flex;
            align-items: center;

            gap: 10px;
          }


          .mobile-drawer-logo {
            width: 44px;
            height: 44px;

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


          .mobile-drawer-name {
            color: #f5bd45;

            font-size: 19px;
            font-weight: 900;
          }


          .mobile-drawer-subtitle {
            margin-top: 3px;

            color: #85788d;

            font-size: 7px;
            font-weight: 800;

            letter-spacing: 1.5px;
          }


          .mobile-close-button {
            width: 38px;
            height: 38px;

            border: 1px solid
              rgba(255,255,255,0.08);

            border-radius: 10px;

            background: #19131f;

            color: #eee8f0;

            font-size: 25px;

            line-height: 1;

            cursor: pointer;
          }


          /* =========================================
             TITLE
          ========================================= */

          .mobile-menu-title {
            margin:
              23px
              10px
              10px;

            color: #776b80;

            font-size: 9px;

            font-weight: 800;

            letter-spacing: 2px;
          }


          /* =========================================
             NAVIGATION
          ========================================= */

          .mobile-navigation {
            display: flex;

            flex-direction: column;

            gap: 5px;
          }


          .mobile-nav-item {
            min-height: 48px;

            display: flex;
            align-items: center;

            padding: 0 10px;

            box-sizing: border-box;

            border-radius: 11px;

            color: #95899d;

            text-decoration: none;

            transition:
              background 0.15s ease,
              color 0.15s ease;
          }


          .mobile-nav-item:active {
            transform: scale(0.99);
          }


          .mobile-nav-item-active {
            color: #f5bd45;

            background:
              linear-gradient(
                90deg,
                rgba(245,189,69,0.13),
                rgba(245,189,69,0.04)
              );

            border-left:
              3px solid
              #f5bd45;
          }


          .mobile-nav-icon {
            width: 34px;
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-right: 10px;

            border-radius: 9px;

            background:
              rgba(255,255,255,0.045);

            font-size: 16px;
          }


          .mobile-nav-item-active
          .mobile-nav-icon {
            background:
              rgba(245,189,69,0.12);
          }


          .mobile-nav-label {
            flex: 1;

            font-size: 13px;

            font-weight: 650;
          }


          .mobile-nav-arrow {
            color: #65596b;

            font-size: 20px;
          }


          /* =========================================
             BOTTOM
          ========================================= */

          .mobile-drawer-bottom {
            margin-top: auto;

            padding-top: 18px;
          }


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

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background:
              rgba(245,189,69,0.1);
          }


          .mobile-festival-name {
            color: #e7dfe9;

            font-size: 11px;

            font-weight: 800;
          }


          .mobile-festival-text {
            margin-top: 3px;

            color: #766b7d;

            font-size: 9px;
          }


          .mobile-logout {
            width: 100%;

            height: 44px;

            margin-top: 10px;

            border: none;

            border-radius: 10px;

            background:
              rgba(220,70,70,0.06);

            color: #c98282;

            font-size: 12px;

            font-weight: 700;

            text-align: left;

            padding: 0 14px;

            cursor: pointer;
          }


          .mobile-logout:active {
            background:
              rgba(220,70,70,0.12);
          }

        }

      `}</style>
    </>
  );
}

export default MobileMenu;