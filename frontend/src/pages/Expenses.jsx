import React, { useEffect, useMemo, useState } from "react";
import { useFestival } from "../context/FestivalContext";

const API_URL = "http://localhost:5000/api/expenses";

function Expenses() {
  const { currentYear } = useFestival();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  /*
   * Category is kept internally because your backend may expect it.
   * It is NOT displayed in the mobile/desktop form or table.
   */
  const [form, setForm] = useState({
    title: "",
    amount: "",
    paymentMethod: "Cash",
    description: "",
  });

  // =========================================================
  // AUTH
  // =========================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // =========================================================
  // LOAD EXPENSES
  // =========================================================

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}?year=${currentYear}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load expenses"
        );
      }

      setExpenses(
        Array.isArray(data.expenses)
          ? data.expenses
          : []
      );
    } catch (error) {
      console.error("GET EXPENSES ERROR:", error);

      setExpenses([]);

      alert(
        error.message ||
          "Unable to load expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentYear]);

  // =========================================================
  // FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      paymentMethod: "Cash",
      description: "",
    });

    setEditingExpense(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setForm({
      title: expense.title || "",
      amount: expense.amount || "",
      paymentMethod:
        expense.paymentMethod || "Cash",
      description:
        expense.description || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter expense title.");
      return;
    }

    if (
      form.amount === "" ||
      Number(form.amount) <= 0
    ) {
      alert(
        "Please enter a valid expense amount."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * Category is automatically sent as "Other"
       * because it is no longer shown in the UI.
       */
      const expenseData = {
        title: form.title.trim(),

        category: "Other",

        amount: Number(form.amount),

        paymentMethod:
          form.paymentMethod,

        description:
          form.description.trim(),

        festivalYear:
          Number(currentYear),
      };

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingExpense) {
        const response = await fetch(
          `${API_URL}/${editingExpense._id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(
              expenseData
            ),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update expense"
          );
        }

        alert(
          "Expense updated successfully."
        );
      }

      // =====================================================
      // ADD
      // =====================================================

      else {
        const response = await fetch(
          API_URL,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(
              expenseData
            ),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to add expense"
          );
        }

        alert(
          "Expense added successfully."
        );
      }

      /*
       * Close modal first.
       * Then reload records.
       */
      setShowModal(false);
      resetForm();

      await fetchExpenses();
    } catch (error) {
      console.error(
        "SAVE EXPENSE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to save expense"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this expense?"
      );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete expense"
        );
      }

      alert(
        "Expense deleted successfully."
      );

      await fetchExpenses();
    } catch (error) {
      console.error(
        "DELETE EXPENSE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete expense"
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredExpenses = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    if (!text) return expenses;

    return expenses.filter((expense) => {
      return (
        expense.title
          ?.toLowerCase()
          .includes(text) ||

        expense.paymentMethod
          ?.toLowerCase()
          .includes(text) ||

        expense.description
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [expenses, search]);

  // =========================================================
  // TOTAL
  // =========================================================

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .expenses-page {
          padding: 32px;
          color: #f5f1e8;
          min-height: 100%;
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 30px;
        }

        .expenses-eyebrow {
          color: #d5a62a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .expenses-header h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .expenses-header p {
          margin: 10px 0 0;
          color: #8d8692;
          font-size: 15px;
        }

        .expenses-add-btn {
          border: 0;
          background: linear-gradient(
            135deg,
            #e8bd45,
            #b78319
          );
          color: #1d1608;
          padding: 14px 22px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          box-shadow:
            0 10px 30px
            rgba(212, 166, 42, 0.18);
          transition: 0.2s;
          white-space: nowrap;
        }

        .expenses-add-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 35px
            rgba(212, 166, 42, 0.28);
        }

        /* =====================================================
           STATS
           ONLY TOTAL EXPENSES
        ===================================================== */

        .expenses-stats {
          display: block;
          margin-bottom: 24px;
        }

        .expense-stat {
          width: 100%;
          box-sizing: border-box;
          padding: 22px;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.045),
              rgba(255,255,255,0.018)
            );
          border: 1px solid
            rgba(255,255,255,0.07);
          box-shadow:
            0 12px 40px
            rgba(0,0,0,0.16);
        }

        .expense-stat-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .expense-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(215,166,42,0.1);
          color: #e0b437;
          font-size: 20px;
        }

        .expense-stat-label {
          color: #88818c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .expense-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #f5f0e5;
        }

        .expense-stat-small {
          margin-top: 5px;
          color: #6f6873;
          font-size: 12px;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .expenses-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .expense-search {
          flex: 1;
          max-width: 520px;
          position: relative;
        }

        .expense-search span {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #77717b;
          font-size: 18px;
        }

        .expense-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 18px 14px 45px;
          border-radius: 12px;
          border: 1px solid
            rgba(255,255,255,0.07);
          background:
            rgba(255,255,255,0.025);
          color: #eee7dc;
          outline: none;
          font-size: 14px;
        }

        .expense-search input::placeholder {
          color: #77717c;
        }

        .expense-search input:focus {
          border-color:
            rgba(220,175,53,0.45);
          background:
            rgba(255,255,255,0.04);
        }

        .expense-count {
          color: #77717b;
          font-size: 12px;
        }

        /* =====================================================
           RECORDS PANEL
        ===================================================== */

        .expenses-panel {
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          background:
            rgba(255,255,255,0.018);
          border: 1px solid
            rgba(255,255,255,0.07);
          box-sizing: border-box;
        }

        .expenses-panel-header {
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid
            rgba(255,255,255,0.06);
        }

        .expenses-panel-header span {
          color: #d5a62a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .expenses-panel-header h2 {
          margin: 5px 0 0;
          font-size: 21px;
        }

        .expense-total {
          color: #e3b83f;
          font-size: 15px;
          font-weight: 800;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .expense-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .expense-table {
          width: 100%;
          min-width: 650px;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .expense-table th {
          padding: 14px 20px;
          text-align: left;
          background:
            rgba(255,255,255,0.025);
          color: #716b75;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .expense-table td {
          padding: 17px 20px;
          border-top: 1px solid
            rgba(255,255,255,0.045);
          color: #aaa3ad;
          font-size: 13px;
        }

        .expense-table tbody tr {
          transition: 0.2s;
        }

        .expense-table tbody tr:hover {
          background:
            rgba(230,185,55,0.035);
        }

        /* =====================================================
           EXPENSE TITLE
        ===================================================== */

        .expense-title {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .expense-title-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(214,166,40,0.1);
          color: #dcb13b;
          font-weight: 800;
        }

        .expense-title strong {
          color: #eee7dc;
          font-size: 14px;
        }

        .expense-description {
          color: #77717c;
          font-size: 11px;
          margin-top: 3px;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .expense-amount {
          color: #e4b83e;
          font-weight: 800;
        }

        .expense-method {
          color: #aaa2ad;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .expense-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .expense-action {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid
            rgba(255,255,255,0.07);
          background:
            rgba(255,255,255,0.025);
          color: #aaa2ad;
          cursor: pointer;
          transition: 0.2s;
        }

        .expense-action:hover {
          background:
            rgba(255,255,255,0.07);
          color: #f4eadb;
        }

        .expense-delete:hover {
          color: #ef8b72;
          border-color:
            rgba(239,139,114,0.3);
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .expense-empty {
          padding: 70px 20px;
          text-align: center;
        }

        .expense-empty-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 15px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(214,166,40,0.08);
          color: #d9ac34;
          font-size: 25px;
        }

        .expense-empty h3 {
          margin: 0;
          font-size: 19px;
        }

        .expense-empty p {
          color: #77717c;
          font-size: 13px;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .expense-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background:
            rgba(0,0,0,0.72);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .expense-modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              #17131a,
              #100e13
            );
          border: 1px solid
            rgba(255,255,255,0.08);
          box-shadow:
            0 30px 100px
            rgba(0,0,0,0.6);
        }

        .expense-modal-header {
          padding: 24px 25px;
          border-bottom: 1px solid
            rgba(255,255,255,0.07);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .expense-modal-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .expense-modal-header p {
          margin: 5px 0 0;
          color: #77717c;
          font-size: 12px;
        }

        .expense-close {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background:
            rgba(255,255,255,0.05);
          color: #aaa2ad;
          cursor: pointer;
          font-size: 18px;
        }

        .expense-form {
          padding: 25px;
        }

        .expense-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .expense-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .expense-field.full {
          grid-column: 1 / -1;
        }

        .expense-field label {
          color: #99919d;
          font-size: 11px;
          font-weight: 700;
        }

        .expense-field input,
        .expense-field select,
        .expense-field textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 11px;
          border: 1px solid
            rgba(255,255,255,0.08);
          background:
            rgba(255,255,255,0.035);
          color: #eee7dc;
          padding: 12px 13px;
          outline: none;
          font-size: 13px;
          font-family: inherit;
        }

        .expense-field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .expense-field input:focus,
        .expense-field select:focus,
        .expense-field textarea:focus {
          border-color:
            rgba(220,175,53,0.45);
        }

        .expense-field option {
          background: #17131a;
          color: white;
        }

        .expense-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .expense-cancel {
          padding: 12px 18px;
          border-radius: 10px;
          border: 1px solid
            rgba(255,255,255,0.08);
          background:
            rgba(255,255,255,0.03);
          color: #aaa2ad;
          cursor: pointer;
        }

        .expense-save {
          padding: 12px 20px;
          border: 0;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #e8bd45,
              #b78319
            );
          color: #1c1508;
          font-weight: 800;
          cursor: pointer;
        }

        .expense-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .expenses-page {
            padding: 20px;
          }

          .expenses-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .expenses-stats {
            width: 100%;
          }

          .expense-stat {
            width: 100%;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .expenses-page {
            padding: 14px 10px;
            width: 100%;
            box-sizing: border-box;
          }

          /* ===============================================
             HEADER
          =============================================== */

          .expenses-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
          }

          /* Hide desktop title on mobile */

          .expenses-header > div {
            display: none;
          }

          /* Add Expense */

          .expenses-header .expenses-add-btn {
            display: block;
            width: auto;
            min-width: 140px;
            padding: 11px 18px;
            font-size: 12px;
            margin: 0 auto;
          }

          /* ===============================================
             TOTAL EXPENSES
             FULL WIDTH
          =============================================== */

          .expenses-stats {
            display: block;
            width: 100%;
            margin-bottom: 12px;
          }

          .expense-stat {
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 14px;
            border-radius: 15px;
            margin: 0;
          }

          .expense-stat-top {
            gap: 8px;
            margin-bottom: 8px;
          }

          .expense-stat-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            font-size: 15px;
          }

          .expense-stat-label {
            font-size: 9px;
          }

          .expense-stat-value {
            font-size: 24px;
          }

          .expense-stat-small {
            font-size: 9px;
            margin-top: 3px;
          }

          /* ===============================================
             SEARCH
          =============================================== */

          .expenses-toolbar {
            display: block;
            width: 100%;
            margin-bottom: 10px;
          }

          .expense-search {
            width: 100%;
            max-width: none;
          }

          .expense-search input {
            width: 100%;
            padding: 11px 10px 11px 36px;
            font-size: 11px;
            border-radius: 10px;
          }

          .expense-search span {
            left: 11px;
            font-size: 15px;
          }

          .expense-count {
            display: none;
          }

          /* ===============================================
             RECORD PANEL
          =============================================== */

          .expenses-panel {
            width: 100%;
            border-radius: 14px;
          }

          .expenses-panel-header {
            padding: 12px 10px;
          }

          .expenses-panel-header span {
            font-size: 7px;
            letter-spacing: 1px;
          }

          .expenses-panel-header h2 {
            font-size: 16px;
            margin-top: 3px;
          }

          .expense-total {
            font-size: 12px;
          }

          /* ===============================================
             TABLE
             
             EXPENSE | AMOUNT | PAYMENT | ACTION
          =============================================== */

          .expense-table-wrapper {
            width: 100%;
            overflow-x: hidden;
          }

          .expense-table {
            width: 100%;
            min-width: 0;
            table-layout: fixed;
            border-collapse: collapse;
          }

          /* -----------------------------------------------
             COLUMN WIDTHS
          ----------------------------------------------- */

          .expense-table th:nth-child(1),
          .expense-table td:nth-child(1) {
            width: 38%;
          }

          .expense-table th:nth-child(2),
          .expense-table td:nth-child(2) {
            width: 21%;
          }

          .expense-table th:nth-child(3),
          .expense-table td:nth-child(3) {
            width: 18%;
          }

          .expense-table th:nth-child(4),
          .expense-table td:nth-child(4) {
            width: 23%;
          }

          /* -----------------------------------------------
             TABLE HEADER
          ----------------------------------------------- */

          .expense-table th {
            padding: 8px 3px;
            font-size: 7px;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }

          /* -----------------------------------------------
             TABLE ROW
          ----------------------------------------------- */

          .expense-table td {
            padding: 10px 3px;
            font-size: 8px;
            vertical-align: middle;
            white-space: nowrap;
          }

          /* -----------------------------------------------
             REMOVE EXPENSE ICON
          ----------------------------------------------- */

          .expense-title-icon {
            display: none;
          }

          .expense-title {
            display: block;
            min-width: 0;
          }

          .expense-title strong {
            display: block;
            font-size: 9px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* -----------------------------------------------
             HIDE DESCRIPTION
          ----------------------------------------------- */

          .expense-description {
            display: none;
          }

          /* -----------------------------------------------
             AMOUNT
          ----------------------------------------------- */

          .expense-amount {
            font-size: 9px;
            white-space: nowrap;
          }

          /* -----------------------------------------------
             PAYMENT
          ----------------------------------------------- */

          .expense-method {
            display: inline-block;
            font-size: 8px;
            white-space: nowrap;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* -----------------------------------------------
             ACTION BUTTONS
          ----------------------------------------------- */

          .expense-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            width: 100%;
          }

          .expense-action {
            width: 25px;
            height: 25px;
            min-width: 25px;
            padding: 0;
            border-radius: 6px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* ===============================================
             MODAL MOBILE
          =============================================== */

          .expense-modal-overlay {
            padding: 8px;
          }

          .expense-modal {
            width: 100%;
            max-width: none;
            max-height: 94vh;
            border-radius: 16px;
          }

          .expense-modal-header {
            padding: 16px;
          }

          .expense-modal-header h2 {
            font-size: 19px;
          }

          .expense-modal-header p {
            font-size: 10px;
          }

          .expense-form {
            padding: 16px;
          }

          .expense-form-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .expense-field.full {
            grid-column: auto;
          }

          .expense-field label {
            font-size: 10px;
          }

          .expense-field input,
          .expense-field select,
          .expense-field textarea {
            font-size: 12px;
            padding: 11px;
          }

          .expense-field textarea {
            min-height: 75px;
          }

          .expense-modal-actions {
            flex-direction: column;
            gap: 7px;
            margin-top: 18px;
          }

          .expense-cancel,
          .expense-save {
            width: 100%;
          }

        }

      `}</style>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <section className="expenses-page">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="expenses-header">

          <div>

            <div className="expenses-eyebrow">
              GANESH UTSAVAM {currentYear}
            </div>

            <h1>
              Expenses
            </h1>

            <p>
              Track and manage festival
              expenditure.
            </p>

          </div>

          <button
            className="expenses-add-btn"
            onClick={openAddModal}
          >
            + Add Expense
          </button>

        </div>

        {/* ===================================================
            TOTAL EXPENSES
        =================================================== */}

        <div className="expenses-stats">

          <div className="expense-stat">

            <div className="expense-stat-top">

              <div className="expense-stat-icon">
                ₹
              </div>

              <div className="expense-stat-label">
                TOTAL EXPENSES
              </div>

            </div>

            <div className="expense-stat-value">
              {formatMoney(totalExpenses)}
            </div>

            <div className="expense-stat-small">
              Festival year {currentYear}
            </div>

          </div>

        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="expenses-toolbar">

          <div className="expense-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search expense or payment..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="expense-count">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1
              ? "expense"
              : "expenses"}
          </div>

        </div>

        {/* ===================================================
            EXPENSE RECORDS
        =================================================== */}

        <div className="expenses-panel">

          <div className="expenses-panel-header">

            <div>

              <span>
                {currentYear} EXPENDITURE
              </span>

              <h2>
                Expense Records
              </h2>

            </div>

            <div className="expense-total">
              {formatMoney(totalExpenses)}
            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="expense-empty">

              <div className="expense-empty-icon">
                ◷
              </div>

              <h3>
                Loading expenses...
              </h3>

              <p>
                Fetching records from
                the server.
              </p>

            </div>

          ) : filteredExpenses.length === 0 ? (

            /* ===============================================
               NO DATA
            =============================================== */

            <div className="expense-empty">

              <div className="expense-empty-icon">
                ₹
              </div>

              <h3>
                No expenses found
              </h3>

              <p>
                Add the first expense
                for {currentYear}.
              </p>

              <button
                className="expenses-add-btn"
                onClick={openAddModal}
              >
                + Add Expense
              </button>

            </div>

          ) : (

            /* ===============================================
               TABLE
            =============================================== */

            <div className="expense-table-wrapper">

              <table className="expense-table">

                <thead>

                  <tr>

                    <th>
                      EXPENSE
                    </th>

                    <th>
                      AMOUNT
                    </th>

                    <th>
                      PAYMENT
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredExpenses.map(
                    (expense) => (

                      <tr
                        key={expense._id}
                      >

                        {/* EXPENSE */}

                        <td>

                          <div className="expense-title">

                            <div className="expense-title-icon">
                              ₹
                            </div>

                            <div>

                              <strong>
                                {expense.title}
                              </strong>

                              {expense.description && (

                                <div className="expense-description">

                                  {
                                    expense.description
                                  }

                                </div>

                              )}

                            </div>

                          </div>

                        </td>

                        {/* AMOUNT */}

                        <td>

                          <span className="expense-amount">

                            {
                              formatMoney(
                                expense.amount
                              )
                            }

                          </span>

                        </td>

                        {/* PAYMENT */}

                        <td>

                          <span className="expense-method">

                            {
                              expense.paymentMethod ||
                              "Cash"
                            }

                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="expense-actions">

                            <button
                              type="button"
                              className="expense-action"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  expense
                                )
                              }
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="expense-action expense-delete"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  expense._id
                                )
                              }
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="expense-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="expense-modal">

            {/* MODAL HEADER */}

            <div className="expense-modal-header">

              <div>

                <h2>

                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}

                </h2>

                <p>

                  {editingExpense
                    ? "Update the expense details."
                    : `Add an expense for ${currentYear}.`}

                </p>

              </div>

              <button
                type="button"
                className="expense-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              className="expense-form"
              onSubmit={handleSubmit}
            >

              <div className="expense-form-grid">

                {/* =================================================
                    TITLE
                ================================================= */}

                <div className="expense-field full">

                  <label>
                    Expense Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: Decoration materials"
                    required
                  />

                </div>

                {/* =================================================
                    AMOUNT
                ================================================= */}

                <div className="expense-field">

                  <label>
                    Amount (₹) *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="1"
                    step="1"
                    required
                  />

                </div>

                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div className="expense-field">

                  <label>
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={
                      form.paymentMethod
                    }
                    onChange={handleChange}
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <div className="expense-field full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={handleChange}
                    placeholder="Optional notes about this expense..."
                  />

                </div>

              </div>

              {/* =================================================
                  FORM BUTTONS
              ================================================= */}

              <div className="expense-modal-actions">

                <button
                  type="button"
                  className="expense-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="expense-save"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Add Expense"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}

export default Expenses;