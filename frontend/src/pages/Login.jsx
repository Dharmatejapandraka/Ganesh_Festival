import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";


// =====================================================
// LOGIN COMPONENT
// =====================================================

function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();


  // =====================================================
  // FORM STATE
  // =====================================================

  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });


  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));


    setError("");

  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    // ---------------------------------------------------
    // MOBILE VALIDATION
    // ---------------------------------------------------

    const mobile =
      form.mobile.trim();


    if (!mobile) {

      setError(
        "Please enter your mobile number."
      );

      return;

    }


    if (
      !/^[0-9]{10}$/.test(mobile)
    ) {

      setError(
        "Please enter a valid 10-digit mobile number."
      );

      return;

    }


    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (!form.password) {

      setError(
        "Please enter your password."
      );

      return;

    }


    try {

      setLoading(true);


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "================================="
      );

      console.log(
        "LOGIN REQUEST"
      );

      console.log(
        "MOBILE:",
        mobile
      );

      console.log(
        "================================="
      );


      // =================================================
      // LOGIN REQUEST
      // =================================================

      const data =
        await api.post(
          "/auth/login",
          {
            mobile,
            password:
              form.password,
          }
        );


      // =================================================
      // DEBUG RESPONSE
      // =================================================

      console.log(
        "LOGIN RESPONSE:",
        data
      );


      // =================================================
      // CHECK SUCCESS
      // =================================================

      if (
        data?.success === false
      ) {

        throw new Error(
          data?.message ||
          "Login failed."
        );

      }


      // =================================================
      // CHECK TOKEN
      // =================================================

      if (!data?.token) {

        console.error(
          "LOGIN RESPONSE DOES NOT CONTAIN TOKEN:",
          data
        );


        throw new Error(
          "Login successful but authentication token was not received."
        );

      }


      // =================================================
      // SAVE AUTH
      // =================================================

      console.log(
        "TOKEN RECEIVED"
      );


      console.log(
        "USER:",
        data.user
      );


      login(
        data.token,
        data.user
      );


      // =================================================
      // DASHBOARD
      // =================================================

      navigate(
        "/dashboard"
      );


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      // -------------------------------------------------
      // NETWORK / FETCH ERROR
      // -------------------------------------------------

      if (
        error?.name ===
        "TypeError"
      ) {

        setError(
          "Unable to connect to the server. Please try again."
        );

      } else {

        setError(
          error?.message ||
          "Login failed. Please try again."
        );

      }


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="login-page">


      {/* =================================================
          BRAND
      ================================================= */}

      <div className="login-brand">

        <div className="login-brand-logo">
          ॐ
        </div>


        <div>

          <div className="login-brand-name">
            Velivolu
          </div>


          <div className="login-brand-subtitle">
            GANESH UTSAVAM
          </div>

        </div>

      </div>


      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="login-card">


        <div className="login-eyebrow">
          GANESH UTSAVAM
        </div>


        <h1>
          Welcome Back
        </h1>


        <p className="login-description">
          Login to manage the festival.
        </p>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
        >


          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="login-group">

            <label>
              Mobile Number
            </label>


            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              disabled={loading}
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="login-group">

            <label>
              Password
            </label>


            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* =================================================
            REGISTER
        ================================================= */}

        <div className="register-section">

          <span>
            Don't have an account?
          </span>


          <button
            type="button"
            className="register-link"
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </button>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="login-footer">

          <div>
            Velivolu Ganesh Utsavam
          </div>

          <div>
            Celebrating together
          </div>

        </div>


      </div>


      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        .login-page {
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 30px 20px;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(245,189,69,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(180,100,40,0.10),
              transparent 30%
            ),
            #09070c;

          color: #f6f1f8;
        }


        /* ================================================
           BRAND
        ================================================ */

        .login-brand {
          display: flex;

          align-items: center;

          gap: 14px;

          margin-bottom: 25px;
        }


        .login-brand-logo {
          width: 62px;
          height: 62px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #ffd76c,
              #efb43b
            );

          color: #251a05;

          font-size: 30px;

          font-weight: 800;

          box-shadow:
            0 10px 35px
            rgba(245,189,69,0.18);
        }


        .login-brand-name {
          color: #f5bd45;

          font-size: 30px;

          line-height: 1;

          font-weight: 800;
        }


        .login-brand-subtitle {
          margin-top: 6px;

          color: #a294aa;

          font-size: 9px;

          letter-spacing: 3px;

          font-weight: 800;
        }


        /* ================================================
           CARD
        ================================================ */

        .login-card {
          width: min(430px, 100%);

          padding: 38px;

          background:
            rgba(20,14,26,0.95);

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 22px;

          box-shadow:
            0 30px 90px
            rgba(0,0,0,0.45);
        }


        .login-eyebrow {
          text-align: center;

          color: #f5bd45;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 3px;

          margin-bottom: 10px;
        }


        .login-card h1 {
          margin: 0;

          text-align: center;

          color: #f8f4f9;

          font-size: 34px;

          line-height: 1.2;
        }


        .login-description {
          margin:
            10px 0 28px;

          text-align: center;

          color: #8d8095;

          font-size: 14px;
        }


        /* ================================================
           ERROR
        ================================================ */

        .login-error {
          padding: 12px 14px;

          margin-bottom: 18px;

          border-radius: 10px;

          background:
            rgba(220,70,70,0.09);

          border:
            1px solid
            rgba(220,70,70,0.18);

          color: #f08b8b;

          font-size: 13px;

          line-height: 1.4;
        }


        /* ================================================
           INPUT
        ================================================ */

        .login-group {
          display: flex;

          flex-direction: column;

          gap: 8px;

          margin-bottom: 18px;
        }


        .login-group label {
          color: #eee8f0;

          font-size: 13px;

          font-weight: 700;
        }


        .login-group input {
          width: 100%;

          height: 54px;

          padding:
            0 16px;

          border:
            1px solid
            rgba(255,255,255,0.10);

          border-radius: 11px;

          outline: none;

          background: #1b1520;

          color: #f5f0f6;

          font-size: 14px;
        }


        .login-group input::placeholder {
          color: #6e6375;
        }


        .login-group input:focus {
          border-color:
            rgba(245,189,69,0.55);

          box-shadow:
            0 0 0 3px
            rgba(245,189,69,0.07);
        }


        /* ================================================
           LOGIN BUTTON
        ================================================ */

        .login-button {
          width: 100%;

          height: 55px;

          margin-top: 4px;

          border: none;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #ffd45e,
              #eeaf27
            );

          color: #241909;

          font-size: 15px;

          font-weight: 800;

          cursor: pointer;

          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }


        .login-button:hover {
          transform:
            translateY(-1px);
        }


        .login-button:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          transform: none;
        }


        /* ================================================
           REGISTER
        ================================================ */

        .register-section {
          display: flex;

          justify-content: center;

          align-items: center;

          gap: 6px;

          margin-top: 24px;

          font-size: 13px;
        }


        .register-section span {
          color: #776b80;
        }


        .register-link {
          padding: 0;

          border: none;

          background: transparent;

          color: #f5bd45;

          font-size: 13px;

          font-weight: 800;

          cursor: pointer;
        }


        .register-link:hover {
          text-decoration: underline;
        }


        /* ================================================
           FOOTER
        ================================================ */

        .login-footer {
          margin-top: 25px;

          text-align: center;

          color: #716676;

          font-size: 12px;

          line-height: 1.7;
        }


        /* ================================================
           MOBILE
        ================================================ */

        @media (max-width: 500px) {

          .login-page {
            padding:
              20px 15px;
          }


          .login-brand {
            margin-bottom: 20px;
          }


          .login-brand-logo {
            width: 54px;
            height: 54px;

            font-size: 26px;
          }


          .login-brand-name {
            font-size: 26px;
          }


          .login-card {
            padding:
              30px 22px;
          }


          .login-card h1 {
            font-size: 29px;
          }

        }

      `}</style>

    </div>

  );

}


export default Login;