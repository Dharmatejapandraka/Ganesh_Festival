import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";


// =====================================================
// REGISTER
// =====================================================

function Register() {

  const navigate =
    useNavigate();


  // =====================================================
  // FORM STATE
  // =====================================================

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });


  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
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

    setSuccess("");

  };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");


    // ---------------------------------------------------
    // NAME
    // ---------------------------------------------------

    const name =
      form.name.trim();


    if (!name) {

      setError(
        "Please enter your name."
      );

      return;

    }


    // ---------------------------------------------------
    // MOBILE
    // ---------------------------------------------------

    const mobile =
      form.mobile.trim();


    if (!mobile) {

      setError(
        "Please enter mobile number."
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
    // PASSWORD
    // ---------------------------------------------------

    if (!form.password) {

      setError(
        "Please enter password."
      );

      return;

    }


    if (
      form.password.length < 6
    ) {

      setError(
        "Password must be at least 6 characters."
      );

      return;

    }


    // ---------------------------------------------------
    // CONFIRM PASSWORD
    // ---------------------------------------------------

    if (!form.confirmPassword) {

      setError(
        "Please confirm your password."
      );

      return;

    }


    if (
      form.password !==
      form.confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    // ===================================================
    // API
    // ===================================================

    try {

      setLoading(true);


      console.log(
        "================================="
      );

      console.log(
        "REGISTERING USER"
      );

      console.log(
        "NAME:",
        name
      );

      console.log(
        "MOBILE:",
        mobile
      );

      console.log(
        "================================="
      );


      // =================================================
      // REGISTER REQUEST
      // =================================================

      const data =
        await api.post(
          "/auth/register",
          {
            name,
            mobile,
            password:
              form.password,

            // New users are viewers
            role: "viewer",
          }
        );


      console.log(
        "REGISTER RESPONSE:",
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
          "Registration failed."
        );

      }


      // Some backends may not explicitly
      // return success:true, but a successful
      // HTTP response is still valid.

      setSuccess(
        data?.message ||
        "Account created successfully. Please login."
      );


      // =================================================
      // CLEAR FORM
      // =================================================

      setForm({
        name: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });


      // =================================================
      // GO TO LOGIN
      // =================================================

      setTimeout(() => {

        navigate(
          "/login"
        );

      }, 1200);


    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );


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
          "Registration failed. Please try again."
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

    <div className="register-page">


      {/* =============================================
          LOGO
      ============================================== */}

      <div className="register-logo">
        ॐ
      </div>


      {/* =============================================
          EYEBROW
      ============================================== */}

      <div className="register-eyebrow">
        GANESH UTSAVAM
      </div>


      {/* =============================================
          TITLE
      ============================================== */}

      <h1>
        Create Account
      </h1>


      <p className="register-subtitle">
        Register to access the
        festival management system.
      </p>


      {/* =============================================
          CARD
      ============================================== */}

      <div className="register-card">


        {/* =============================================
            ERROR
        ============================================== */}

        {error && (

          <div className="register-error">
            {error}
          </div>

        )}


        {/* =============================================
            SUCCESS
        ============================================== */}

        {success && (

          <div className="register-success">
            {success}
          </div>

        )}


        {/* =============================================
            FORM
        ============================================== */}

        <form
          onSubmit={handleSubmit}
        >


          {/* NAME */}

          <div className="register-group">

            <label>
              Full Name
            </label>


            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              disabled={loading}
            />

          </div>


          {/* MOBILE */}

          <div className="register-group">

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


          {/* PASSWORD */}

          <div className="register-group">

            <label>
              Password
            </label>


            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              autoComplete="new-password"
              disabled={loading}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="register-group">

            <label>
              Confirm Password
            </label>


            <input
              type="password"
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={handleChange}
              placeholder="Confirm password"
              autoComplete="new-password"
              disabled={loading}
            />

          </div>


          {/* BUTTON */}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >

            {loading
              ? "Creating account..."
              : "Create Account"}

          </button>

        </form>


        {/* =============================================
            LOGIN
        ============================================== */}

        <div className="register-login">

          <span>
            Already have an account?
          </span>


          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            disabled={loading}
          >
            Login
          </button>

        </div>


      </div>


      {/* ===============================================
          STYLES
      ================================================ */}

      <style>{`

        .register-page {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 25px;

          box-sizing: border-box;

          background:
            radial-gradient(
              circle at top,
              rgba(245,189,69,0.08),
              transparent 35%
            ),
            #0b080e;

          color: #f6f1f8;
        }


        .register-card {

          width: min(450px, 100%);

          padding: 38px 40px;

          box-sizing: border-box;

          background: #120d17;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius: 22px;

          box-shadow:
            0 25px 80px
            rgba(0,0,0,0.45);

        }


        .register-logo {

          width: 58px;

          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin:
            0 auto 18px;

          border-radius: 15px;

          background:
            rgba(245,189,69,0.08);

          border:
            1px solid
            rgba(245,189,69,0.15);

          color: #f5bd45;

          font-size: 26px;

        }


        .register-eyebrow {

          color: #f5bd45;

          text-align: center;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 2px;

        }


        .register-page > h1 {

          margin:
            9px 0 0;

          color: #f6f1f8;

          text-align: center;

          font-size: 29px;

        }


        .register-subtitle {

          color: #807589;

          text-align: center;

          font-size: 12px;

          line-height: 1.5;

          margin:
            9px auto 25px;

          max-width: 380px;

        }


        .register-error {

          padding:
            11px 13px;

          margin-bottom: 17px;

          border-radius: 9px;

          color: #ef8b8b;

          background:
            rgba(220,70,70,0.08);

          border:
            1px solid
            rgba(220,70,70,0.15);

          font-size: 12px;

        }


        .register-success {

          padding:
            11px 13px;

          margin-bottom: 17px;

          border-radius: 9px;

          color: #7ee2a8;

          background:
            rgba(70,200,120,0.08);

          border:
            1px solid
            rgba(70,200,120,0.15);

          font-size: 12px;

        }


        .register-group {

          display: flex;

          flex-direction: column;

          gap: 7px;

          margin-bottom: 15px;

        }


        .register-group label {

          color: #93879d;

          font-size: 12px;

          font-weight: 600;

        }


        .register-group input {

          width: 100%;

          height: 47px;

          padding:
            0 14px;

          box-sizing: border-box;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius: 10px;

          outline: none;

          background: #19131f;

          color: #eee8f0;

          font-size: 14px;

        }


        .register-group input:focus {

          border-color:
            rgba(245,189,69,0.5);

          box-shadow:
            0 0 0 3px
            rgba(245,189,69,0.05);

        }


        .register-group input::placeholder {

          color: #62596a;

        }


        .register-group input:disabled {

          opacity: 0.6;

          cursor: not-allowed;

        }


        .register-button {

          width: 100%;

          height: 49px;

          margin-top: 5px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #ffd76c,
              #efb43b
            );

          color: #241909;

          font-weight: 800;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;

        }


        .register-button:hover:not(:disabled) {

          transform:
            translateY(-1px);

        }


        .register-button:disabled {

          opacity: 0.55;

          cursor: not-allowed;

        }


        .register-login {

          display: flex;

          justify-content: center;

          gap: 6px;

          margin-top: 21px;

          font-size: 12px;

        }


        .register-login span {

          color: #756a7d;

        }


        .register-login button {

          border: none;

          padding: 0;

          background: transparent;

          color: #f5bd45;

          font-weight: 700;

          cursor: pointer;

        }


        .register-login button:disabled {

          opacity: 0.5;

          cursor: not-allowed;

        }


        @media (max-width: 500px) {

          .register-page {

            padding: 15px;

          }


          .register-card {

            padding:
              30px 22px;

          }

        }

      `}</style>

    </div>

  );

}


export default Register;