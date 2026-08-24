import React, { useEffect, useState } from "react";
import { useFestival } from "../context/FestivalContext";
import api from "../utils/api";

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const {
    currentYear,
    currentFestivalData,
  } = useFestival();

  const [donations, setDonations] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [villagers, setVillagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // EXPENSES
  //
  // IMPORTANT:
  // Expenses page stores data inside:
  // currentFestivalData.expenses
  //
  // So Dashboard must use the SAME DATA.
  // =====================================================

  const expenses =
    currentFestivalData?.expenses || [];

  // =====================================================
  // GET ARRAY FROM API RESPONSE
  // =====================================================

  const getArray = (
    response,
    possibleKeys = []
  ) => {
    if (!response) {
      return [];
    }

    // Direct array
    if (Array.isArray(response)) {
      return response;
    }

    // Requested keys
    for (const key of possibleKeys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }

    // response.data
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    // response.data.data
    if (
      response?.data &&
      typeof response.data === "object"
    ) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }

      for (const key of possibleKeys) {
        if (
          Array.isArray(
            response.data?.[key]
          )
        ) {
          return response.data[key];
        }
      }

      if (
        Array.isArray(
          response.data?.result
        )
      ) {
        return response.data.result;
      }
    }

    // response.result
    if (Array.isArray(response?.result)) {
      return response.result;
    }

    // response.result.data
    if (
      response?.result &&
      typeof response.result === "object"
    ) {
      if (
        Array.isArray(
          response.result.data
        )
      ) {
        return response.result.data;
      }

      for (const key of possibleKeys) {
        if (
          Array.isArray(
            response.result?.[key]
          )
        ) {
          return response.result[key];
        }
      }
    }

    return [];
  };

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "================================="
      );

      console.log("DASHBOARD FETCH");

      console.log(
        "YEAR:",
        currentYear
      );

      console.log(
        "================================="
      );

      // -------------------------------------------------
      // FETCH DONATIONS / COMMITTEE / VILLAGERS
      //
      // Expenses are NOT fetched from API here.
      // Expenses come from currentFestivalData.
      // -------------------------------------------------

      const [
        donationResponse,
        committeeResponse,
        villagerResponse,
      ] = await Promise.all([
        api.get(
          `/donations?year=${currentYear}`
        ),

        api.get(`/committee`),

        api.get(
          `/villagers?year=${currentYear}`
        ),
      ]);

      // -------------------------------------------------
      // DEBUG
      // -------------------------------------------------

      console.log(
        "DONATION RESPONSE:",
        donationResponse
      );

      console.log(
        "COMMITTEE RESPONSE:",
        committeeResponse
      );

      console.log(
        "VILLAGER RESPONSE:",
        villagerResponse
      );

      // -------------------------------------------------
      // CONVERT API RESPONSES TO ARRAYS
      // -------------------------------------------------

      const donationList = getArray(
        donationResponse,
        [
          "donations",
          "records",
          "items",
          "data",
          "results",
        ]
      );

      const committeeList = getArray(
        committeeResponse,
        [
          "committee",
          "members",
          "committeeMembers",
          "records",
          "items",
          "data",
          "results",
        ]
      );

      const villagerList = getArray(
        villagerResponse,
        [
          "villagers",
          "users",
          "members",
          "records",
          "items",
          "data",
          "results",
        ]
      );

      // -------------------------------------------------
      // SET STATE
      // -------------------------------------------------

      setDonations(donationList);
      setCommittee(committeeList);
      setVillagers(villagerList);

      // -------------------------------------------------
      // EXPENSE DEBUG
      // -------------------------------------------------

      console.log(
        "================================="
      );

      console.log(
        "EXPENSES FROM FESTIVAL CONTEXT:",
        expenses
      );

      console.log(
        "EXPENSE COUNT:",
        expenses.length
      );

      console.log(
        "================================="
      );
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data"
      );

      setDonations([]);
      setCommittee([]);
      setVillagers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!currentYear) {
      return;
    }

    fetchDashboardData();
  }, [currentYear]);

  // =====================================================
  // NUMBER HELPER
  // =====================================================

  const getNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    // Number
    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : 0;
    }

    // String
    if (typeof value === "string") {
      const cleanedValue = value
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/\s/g, "")
        .trim();

      const number =
        Number(cleanedValue);

      return Number.isFinite(number)
        ? number
        : 0;
    }

    // Object
    if (typeof value === "object") {
      const possibleAmount =
        value?.amount ??
        value?.totalAmount ??
        value?.expenseAmount ??
        value?.paidAmount ??
        value?.cost ??
        value?.price ??
        value?.value;

      if (
        possibleAmount !==
          undefined &&
        possibleAmount !== null
      ) {
        return getNumber(
          possibleAmount
        );
      }
    }

    return 0;
  };

  // =====================================================
  // DONATION AMOUNT
  // =====================================================

  const getDonationAmount = (
    item
  ) => {
    if (!item) {
      return 0;
    }

    const amount =
      item?.amount ??
      item?.totalAmount ??
      item?.donationAmount ??
      item?.paidAmount ??
      item?.value ??
      0;

    return getNumber(amount);
  };

  // =====================================================
  // EXPENSE AMOUNT
  // =====================================================

  const getExpenseAmount = (
    item
  ) => {
    if (!item) {
      return 0;
    }

    /*
      Your Expenses page uses:

      expense.amount
    */

    return getNumber(
      item?.amount ??
        item?.expenseAmount ??
        item?.totalAmount ??
        item?.paidAmount ??
        item?.cost ??
        item?.price ??
        item?.value ??
        0
    );
  };

  // =====================================================
  // TOTAL DONATIONS
  // =====================================================

  const totalDonations =
    donations.reduce(
      (total, item) => {
        return (
          total +
          getDonationAmount(item)
        );
      },
      0
    );

  // =====================================================
  // RECEIVED DONATIONS
  // =====================================================

  const receivedDonations =
    donations.reduce(
      (total, item) => {
        const status = String(
          item?.status || ""
        )
          .toLowerCase()
          .trim();

        // No status = received
        if (!status) {
          return (
            total +
            getDonationAmount(item)
          );
        }

        if (
          status === "received" ||
          status === "paid" ||
          status === "completed" ||
          status === "complete" ||
          status === "success" ||
          status === "successful"
        ) {
          return (
            total +
            getDonationAmount(item)
          );
        }

        return total;
      },
      0
    );

  // =====================================================
  // PENDING DONATIONS
  // =====================================================

  const pendingDonations =
    donations.reduce(
      (total, item) => {
        const status = String(
          item?.status || ""
        )
          .toLowerCase()
          .trim();

        if (
          status === "pending" ||
          status === "unpaid" ||
          status === "due"
        ) {
          return (
            total +
            getDonationAmount(item)
          );
        }

        return total;
      },
      0
    );

  // =====================================================
  // TOTAL EXPENSES
  //
  // THIS IS THE IMPORTANT PART
  //
  // Same expenses used by Expenses.jsx
  // =====================================================

  const totalExpenses =
    expenses.reduce(
      (total, expense) => {
        return (
          total +
          getExpenseAmount(expense)
        );
      },
      0
    );

  // =====================================================
  // PAID EXPENSES
  // =====================================================

  const paidExpenses =
    expenses.reduce(
      (total, expense) => {
        const status = String(
          expense?.status || ""
        )
          .toLowerCase()
          .trim();

        if (
          status === "paid" ||
          status === "completed" ||
          status === "complete"
        ) {
          return (
            total +
            getExpenseAmount(expense)
          );
        }

        return total;
      },
      0
    );

  // =====================================================
  // PENDING EXPENSES
  // =====================================================

  const pendingExpenses =
    expenses.reduce(
      (total, expense) => {
        const status = String(
          expense?.status || ""
        )
          .toLowerCase()
          .trim();

        if (
          status === "pending" ||
          status === "unpaid" ||
          status === "due"
        ) {
          return (
            total +
            getExpenseAmount(expense)
          );
        }

        return total;
      },
      0
    );

  // =====================================================
  // REMAINING BALANCE
  // =====================================================

  const balance =
    receivedDonations -
    totalExpenses;

  // =====================================================
  // FINAL DEBUG
  // =====================================================

  console.log(
    "================================="
  );

  console.log(
    "CURRENT YEAR:",
    currentYear
  );

  console.log(
    "EXPENSES:",
    expenses
  );

  console.log(
    "EXPENSE COUNT:",
    expenses.length
  );

  console.log(
    "TOTAL EXPENSES:",
    totalExpenses
  );

  console.log(
    "PAID EXPENSES:",
    paidExpenses
  );

  console.log(
    "PENDING EXPENSES:",
    pendingExpenses
  );

  console.log(
    "RECEIVED DONATIONS:",
    receivedDonations
  );

  console.log(
    "REMAINING BALANCE:",
    balance
  );

  console.log(
    "================================="
  );

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const money = (value) => {
    return `₹${getNumber(
      value
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // RECENT DONATIONS
  // =====================================================

  const recentDonations = [
    ...donations,
  ]
    .sort(
      (a, b) =>
        new Date(
          b?.createdAt ||
            b?.date ||
            0
        ) -
        new Date(
          a?.createdAt ||
            a?.date ||
            0
        )
    )
    .slice(0, 5);

  // =====================================================
  // RECENT EXPENSES
  // =====================================================

  const recentExpenses = [
    ...expenses,
  ]
    .sort(
      (a, b) =>
        new Date(
          b?.createdAt ||
            b?.date ||
            0
        ) -
        new Date(
          a?.createdAt ||
            a?.date ||
            0
        )
    )
    .slice(0, 5);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-eyebrow">
            GANESH UTSAVAM {currentYear}
          </div>

          <h1>
            Festival Dashboard
          </h1>

          <p>
            Overview of the{" "}
            {currentYear} Ganesh Utsavam.
          </p>

        </div>

        <div className="dashboard-year">

          <span>
            FESTIVAL YEAR
          </span>

          <strong>
            {currentYear}
          </strong>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">

          <span>
            ⚠️ {error}
          </span>

          <button
            onClick={
              fetchDashboardData
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          MAIN CARDS
      ================================================= */}

      <div className="dashboard-cards">

        {/* DONATIONS */}

        <div className="dashboard-card">

          <div className="dashboard-card-top">

            <div className="dashboard-card-icon donation">
              ₹
            </div>

            <span>
              TOTAL RECEIVED
            </span>

          </div>

          <h2>
            {money(
              receivedDonations
            )}
          </h2>

          <p>
            {donations.length}{" "}
            donation
            {donations.length !== 1
              ? "s"
              : ""}
          </p>

        </div>


        {/* EXPENSES */}

        <div className="dashboard-card">

          <div className="dashboard-card-top">

            <div className="dashboard-card-icon expense">
              ◇
            </div>

            <span>
              TOTAL EXPENSES
            </span>

          </div>

          <h2>
            {money(
              totalExpenses
            )}
          </h2>

          <p>
            {expenses.length}{" "}
            expense
            {expenses.length !== 1
              ? "s"
              : ""}
          </p>

        </div>


        {/* BALANCE */}

        <div className="dashboard-card">

          <div className="dashboard-card-top">

            <div className="dashboard-card-icon balance">
              ✓
            </div>

            <span>
              REMAINING BALANCE
            </span>

          </div>

          <h2
            className={
              balance < 0
                ? "negative"
                : ""
            }
          >
            {money(balance)}
          </h2>

          <p>
            Received - Expenses
          </p>

        </div>


        {/* VILLAGERS */}

        <div className="dashboard-card">

          <div className="dashboard-card-top">

            <div className="dashboard-card-icon people">
              ♟
            </div>

            <span>
              VILLAGERS
            </span>

          </div>

          <h2>
            {villagers.length}
          </h2>

          <p>
            Registered villagers
          </p>

        </div>

      </div>


      {/* =================================================
          SECONDARY STATS
      ================================================= */}

      <div className="dashboard-secondary">

        <div className="dashboard-mini-card">

          <span>
            RECEIVED DONATIONS
          </span>

          <strong>
            {money(
              receivedDonations
            )}
          </strong>

        </div>


        <div className="dashboard-mini-card">

          <span>
            PENDING DONATIONS
          </span>

          <strong>
            {money(
              pendingDonations
            )}
          </strong>

        </div>


        <div className="dashboard-mini-card">

          <span>
            COMMITTEE MEMBERS
          </span>

          <strong>
            {committee.length}
          </strong>

        </div>


        <div className="dashboard-mini-card">

          <span>
            TOTAL DONATIONS
          </span>

          <strong>
            {money(
              totalDonations
            )}
          </strong>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="dashboard-content">

        {/* =================================================
            RECENT DONATIONS
        ================================================= */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <div className="dashboard-eyebrow">
                RECENT ACTIVITY
              </div>

              <h2>
                Recent Donations
              </h2>

            </div>

            <span className="record-count">
              {donations.length}
            </span>

          </div>


          {recentDonations.length === 0 ? (

            <div className="dashboard-no-data">

              <div className="empty-icon">
                ₹
              </div>

              <strong>
                No donations yet
              </strong>

              <span>
                Add a donation to see
                it here.
              </span>

            </div>

          ) : (

            <div className="dashboard-list">

              {recentDonations.map(
                (
                  donation,
                  index
                ) => (

                  <div
                    className="dashboard-list-item"
                    key={
                      donation?._id ||
                      donation?.id ||
                      index
                    }
                  >

                    <div className="dashboard-list-icon">
                      ₹
                    </div>

                    <div className="dashboard-list-info">

                      <strong>
                        {
                          donation?.donorName ||
                          donation?.name ||
                          donation?.donor ||
                          "Donor"
                        }
                      </strong>

                      <span>
                        {formatDate(
                          donation?.createdAt ||
                            donation?.date
                        )}
                      </span>

                    </div>

                    <div className="dashboard-list-right">

                      <strong className="dashboard-money">
                        {money(
                          getDonationAmount(
                            donation
                          )
                        )}
                      </strong>

                      <span
                        className={
                          String(
                            donation?.status ||
                              ""
                          )
                            .toLowerCase() ===
                          "received"
                            ? "dashboard-status received"
                            : "dashboard-status pending"
                        }
                      >
                        {
                          donation?.status ||
                          "Received"
                        }
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            RECENT EXPENSES
        ================================================= */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <div className="dashboard-eyebrow">
                FESTIVAL SPENDING
              </div>

              <h2>
                Recent Expenses
              </h2>

            </div>

            <span className="record-count">
              {expenses.length}
            </span>

          </div>


          {recentExpenses.length === 0 ? (

            <div className="dashboard-no-data">

              <div className="empty-icon expense-empty">
                ₹
              </div>

              <strong>
                No expenses yet
              </strong>

              <span>
                Add an expense to see
                it here.
              </span>

            </div>

          ) : (

            <div className="dashboard-list">

              {recentExpenses.map(
                (
                  expense,
                  index
                ) => (

                  <div
                    className="dashboard-list-item"
                    key={
                      expense?._id ||
                      expense?.id ||
                      index
                    }
                  >

                    <div className="dashboard-list-icon expense">
                      ₹
                    </div>

                    <div className="dashboard-list-info">

                      <strong>
                        {
                          expense?.title ||
                          expense?.description ||
                          expense?.name ||
                          expense?.category ||
                          "Expense"
                        }
                      </strong>

                      <span>
                        {formatDate(
                          expense?.createdAt ||
                            expense?.date
                        )}
                      </span>

                    </div>

                    <strong className="dashboard-expense-money">
                      {money(
                        getExpenseAmount(
                          expense
                        )
                      )}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>


      {/* =================================================
          MOBILE QUICK SUMMARY
      ================================================= */}

      <div className="dashboard-mobile-summary">

        <div>

          <span>
            RECEIVED
          </span>

          <strong>
            {money(
              receivedDonations
            )}
          </strong>

        </div>


        <div>

          <span>
            EXPENSES
          </span>

          <strong>
            {money(
              totalExpenses
            )}
          </strong>

        </div>


        <div>

          <span>
            BALANCE
          </span>

          <strong
            className={
              balance < 0
                ? "negative"
                : ""
            }
          >
            {money(balance)}
          </strong>

        </div>

      </div>


      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 38px 42px 70px;
          box-sizing: border-box;
          color: #f4eff8;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 28px;
        }

        .dashboard-eyebrow {
          color: #f5bd45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #f6f1f8;
          font-size: 40px;
          font-weight: 800;
        }

        .dashboard-header p {
          margin: 9px 0 0;
          color: #8d8297;
          font-size: 15px;
        }

        .dashboard-year {
          min-width: 125px;
          padding: 15px 20px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
        }

        .dashboard-year span {
          display: block;
          color: #716779;
          font-size: 9px;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }

        .dashboard-year strong {
          color: #f5bd45;
          font-size: 20px;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
          padding: 14px 18px;
          color: #ffb4b4;
          background: rgba(180,50,50,0.12);
          border: 1px solid rgba(220,90,90,0.3);
          border-radius: 12px;
          font-size: 13px;
        }

        .dashboard-error button {
          border: 0;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          background: #f5bd45;
          color: #171019;
          font-weight: 700;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .dashboard-card {
          padding: 22px;
          min-height: 155px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .dashboard-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard-card-top span {
          color: #81768a;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .dashboard-card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
          font-weight: 800;
          font-size: 17px;
        }

        .dashboard-card h2 {
          margin: 19px 0 6px;
          color: #f4eff8;
          font-size: 27px;
        }

        .dashboard-card h2.negative {
          color: #ef7474;
        }

        .dashboard-card p {
          margin: 0;
          color: #6f6577;
          font-size: 11px;
        }

        .dashboard-secondary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .dashboard-mini-card {
          padding: 17px 19px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
        }

        .dashboard-mini-card span {
          display: block;
          color: #746a7c;
          font-size: 8px;
          letter-spacing: 1.3px;
          margin-bottom: 8px;
        }

        .dashboard-mini-card strong {
          color: #dcd4e0;
          font-size: 17px;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .dashboard-panel {
          min-width: 0;
          min-height: 320px;
          background: #120d17;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }

        .dashboard-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .dashboard-panel-header h2 {
          margin: 0;
          color: #f4eff8;
          font-size: 22px;
        }

        .record-count {
          min-width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          border-radius: 9px;
          background: rgba(245,189,69,0.08);
          color: #f5bd45;
          font-size: 11px;
          font-weight: 700;
        }

        .dashboard-list {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .dashboard-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          background: #18121e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: transform 0.2s ease;
        }

        .dashboard-list-item:hover {
          transform: translateY(-1px);
        }

        .dashboard-list-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(245,189,69,0.07);
          color: #f5bd45;
          font-weight: 800;
        }

        .dashboard-list-icon.expense {
          color: #df7777;
          background: rgba(220,90,90,0.07);
        }

        .dashboard-list-info {
          flex: 1;
          min-width: 0;
        }

        .dashboard-list-info strong {
          display: block;
          color: #e9e3eb;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dashboard-list-info span {
          display: block;
          margin-top: 4px;
          color: #6f6577;
          font-size: 10px;
        }

        .dashboard-list-right {
          flex-shrink: 0;
          text-align: right;
        }

        .dashboard-money {
          display: block;
          color: #f5bd45;
          font-size: 13px;
        }

        .dashboard-expense-money {
          flex-shrink: 0;
          color: #df7777;
          font-size: 13px;
        }

        .dashboard-status {
          display: block;
          margin-top: 4px;
          font-size: 9px;
        }

        .dashboard-status.received {
          color: #72ca94;
        }

        .dashboard-status.pending {
          color: #f0b95c;
        }

        .dashboard-no-data {
          min-height: 240px;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #6f6577;
        }

        .dashboard-no-data strong {
          margin-top: 12px;
          color: #c9c0cd;
          font-size: 14px;
        }

        .dashboard-no-data span {
          margin-top: 5px;
          font-size: 11px;
        }

        .empty-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #f5bd45;
          background: rgba(245,189,69,0.08);
          font-size: 20px;
          font-weight: 800;
        }

        .expense-empty {
          color: #df7777;
          background: rgba(220,90,90,0.08);
        }

        .dashboard-mobile-summary {
          display: none;
        }

        .dashboard-loading {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5bd45;
          font-size: 16px;
        }

        @media (max-width: 1100px) {

          .dashboard-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-secondary {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 800px) {

          .dashboard-page {
            padding: 28px 22px 50px;
          }

          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }

        }

        @media (max-width: 550px) {

          .dashboard-page {
            padding: 22px 15px 40px;
          }

          .dashboard-header {
            margin-bottom: 20px;
          }

          .dashboard-header h1 {
            font-size: 32px;
          }

          .dashboard-header p {
            font-size: 13px;
          }

          .dashboard-year {
            width: 100%;
          }

          .dashboard-cards {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .dashboard-card {
            min-height: 135px;
            padding: 18px;
            border-radius: 16px;
          }

          .dashboard-card h2 {
            font-size: 25px;
            margin-top: 15px;
          }

          .dashboard-secondary {
            display: none;
          }

          .dashboard-content {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .dashboard-panel {
            border-radius: 16px;
          }

          .dashboard-panel-header {
            padding: 18px;
          }

          .dashboard-panel-header h2 {
            font-size: 19px;
          }

          .dashboard-list {
            padding: 10px;
            gap: 8px;
          }

          .dashboard-list-item {
            padding: 11px;
          }

          .dashboard-list-icon {
            width: 34px;
            height: 34px;
          }

          .dashboard-list-info strong {
            font-size: 12px;
          }

          .dashboard-money,
          .dashboard-expense-money {
            font-size: 12px;
          }

          .dashboard-mobile-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 15px;
          }

          .dashboard-mobile-summary > div {
            padding: 12px 8px;
            background: #120d17;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            text-align: center;
          }

          .dashboard-mobile-summary span {
            display: block;
            color: #746a7c;
            font-size: 7px;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }

          .dashboard-mobile-summary strong {
            color: #f5bd45;
            font-size: 12px;
          }

          .dashboard-mobile-summary strong.negative {
            color: #ef7474;
          }

        }

      `}</style>

    </div>
  );
}

export default Dashboard;