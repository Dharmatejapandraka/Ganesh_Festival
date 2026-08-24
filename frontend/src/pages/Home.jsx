import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFestival } from "../context/FestivalContext";

import api from "../utils/api";


// =====================================================
// HOME / DASHBOARD
// =====================================================

function Home() {

  const { currentYear } =
    useFestival();


  // =====================================================
  // STATE
  // =====================================================

  const [
    donations,
    setDonations,
  ] = useState([]);


  const [
    expenses,
    setExpenses,
  ] = useState([]);


  const [
    committee,
    setCommittee,
  ] = useState([]);


  const [
    villagers,
    setVillagers,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // HELPER
  // =====================================================

  const extractList = (
    response,
    possibleKeys = []
  ) => {

    if (Array.isArray(response)) {
      return response;
    }


    for (
      const key of possibleKeys
    ) {

      if (
        Array.isArray(
          response?.[key]
        )
      ) {

        return response[key];

      }

    }


    return [];

  };


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);

      setError("");


      console.log(
        "================================="
      );

      console.log(
        "LOADING DASHBOARD"
      );

      console.log(
        "YEAR:",
        currentYear
      );

      console.log(
        "================================="
      );


      // =================================================
      // API REQUESTS
      // =================================================

      const [
        donationsResponse,
        expensesResponse,
        committeeResponse,
        villagersResponse,
      ] = await Promise.all([

        api.get(
          `/donations?year=${currentYear}`
        ),

        api.get(
          `/expenses?year=${currentYear}`
        ),

        api.get(
          `/committee?year=${currentYear}`
        ),

        api.get(
          `/villagers?year=${currentYear}`
        ),

      ]);


      // =================================================
      // LOG RESPONSES
      // =================================================

      console.log(
        "DONATIONS RESPONSE:",
        donationsResponse
      );


      console.log(
        "EXPENSES RESPONSE:",
        expensesResponse
      );


      console.log(
        "COMMITTEE RESPONSE:",
        committeeResponse
      );


      console.log(
        "VILLAGERS RESPONSE:",
        villagersResponse
      );


      // =================================================
      // EXTRACT DATA
      // =================================================

      const donationList =
        extractList(
          donationsResponse,
          [
            "donations",
            "data",
          ]
        );


      const expenseList =
        extractList(
          expensesResponse,
          [
            "expenses",
            "data",
          ]
        );


      const committeeList =
        extractList(
          committeeResponse,
          [
            "committee",
            "members",
            "data",
          ]
        );


      const villagerList =
        extractList(
          villagersResponse,
          [
            "villagers",
            "data",
          ]
        );


      // =================================================
      // SAVE DATA
      // =================================================

      setDonations(
        donationList
      );


      setExpenses(
        expenseList
      );


      setCommittee(
        committeeList
      );


      setVillagers(
        villagerList
      );


      // =================================================
      // LOG COUNTS
      // =================================================

      console.log(
        "DONATIONS COUNT:",
        donationList.length
      );


      console.log(
        "EXPENSES COUNT:",
        expenseList.length
      );


      console.log(
        "COMMITTEE COUNT:",
        committeeList.length
      );


      console.log(
        "VILLAGERS COUNT:",
        villagerList.length
      );


      console.log(
        "================================="
      );


      console.log(
        "DASHBOARD LOADED SUCCESSFULLY"
      );


      console.log(
        "================================="
      );


    } catch (error) {

      console.error(
        "DASHBOARD ERROR:",
        error
      );


      setError(
        error?.message ||
        "Failed to load dashboard"
      );


      setDonations([]);

      setExpenses([]);

      setCommittee([]);

      setVillagers([]);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD WHEN YEAR CHANGES
  // =====================================================

  useEffect(() => {

    if (currentYear) {

      loadDashboard();

    }

  }, [currentYear]);


  // =====================================================
  // TOTAL DONATIONS
  // =====================================================

  const totalDonations =
    useMemo(() => {

      return donations.reduce(
        (total, donation) =>
          total +
          Number(
            donation.amount || 0
          ),
        0
      );

    }, [donations]);


  // =====================================================
  // RECEIVED DONATIONS
  // =====================================================

  const receivedAmount =
    useMemo(() => {

      return donations

        .filter(
          (donation) =>
            String(
              donation.status || ""
            ).toLowerCase() !==
            "pending"
        )

        .reduce(
          (total, donation) =>
            total +
            Number(
              donation.amount || 0
            ),
          0
        );

    }, [donations]);


  // =====================================================
  // PENDING DONATIONS
  // =====================================================

  const pendingDonations =
    useMemo(() => {

      return donations

        .filter(
          (donation) =>
            String(
              donation.status || ""
            ).toLowerCase() ===
            "pending"
        )

        .reduce(
          (total, donation) =>
            total +
            Number(
              donation.amount || 0
            ),
          0
        );

    }, [donations]);


  // =====================================================
  // TOTAL EXPENSES
  // =====================================================

  const totalExpenses =
    useMemo(() => {

      return expenses.reduce(
        (total, expense) =>
          total +
          Number(
            expense.amount || 0
          ),
        0
      );

    }, [expenses]);


  // =====================================================
  // BALANCE
  // =====================================================

  const balance =
    receivedAmount -
    totalExpenses;


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (
    value
  ) => {

    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

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
          b.date ||
          b.createdAt ||
          0
        ) -
        new Date(
          a.date ||
          a.createdAt ||
          0
        )
    )

    .slice(0, 5);


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="dashboard-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            GANESH UTSAVAM {currentYear}
          </span>


          <h2>
            Festival Dashboard
          </h2>


          <p>
            Overview of the {currentYear} Ganesh Utsavam.
          </p>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loading && (

        <div
          className="dashboard-panel"
          style={{
            marginBottom: "20px",
            borderColor: "#ff5555",
          }}
        >

          <div
            style={{
              padding: "20px",
              color: "#ff7777",
            }}
          >

            <strong>
              Dashboard Error
            </strong>


            <p>
              {error}
            </p>


            <button
              onClick={loadDashboard}
              style={{
                marginTop: "10px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="empty-state">

          <h3>
            Loading dashboard...
          </h3>


          <p>
            Fetching festival data.
          </p>

        </div>

      ) : (

        <>


          {/* =================================================
              FINANCIAL CARDS
          ================================================= */}

          <div className="dashboard-stats">


            {/* TOTAL RECEIVED */}

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon">
                ₹
              </div>


              <span>
                Total Received
              </span>


              <strong>
                {money(
                  receivedAmount
                )}
              </strong>


              <small>
                {donations.length} donations
              </small>

            </div>


            {/* TOTAL EXPENSES */}

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon">
                ◇
              </div>


              <span>
                Total Expenses
              </span>


              <strong>
                {money(
                  totalExpenses
                )}
              </strong>


              <small>
                {expenses.length} expenses
              </small>

            </div>


            {/* REMAINING BALANCE */}

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon">
                ✓
              </div>


              <span>
                Remaining Balance
              </span>


              <strong>
                {money(
                  balance
                )}
              </strong>


              <small>
                Received − Expenses
              </small>

            </div>


            {/* VILLAGERS */}

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon">
                ♟
              </div>


              <span>
                Villagers
              </span>


              <strong>
                {villagers.length}
              </strong>


              <small>
                {committee.length} committee members
              </small>

            </div>

          </div>


          {/* =================================================
              SECONDARY INFORMATION
          ================================================= */}

          <div className="dashboard-grid">


            {/* =================================================
                DONATION OVERVIEW
            ================================================= */}

            <div className="dashboard-panel">

              <div className="dashboard-panel-header">

                <div>

                  <span className="page-eyebrow">
                    CONTRIBUTIONS
                  </span>


                  <h3>
                    Donation Overview
                  </h3>

                </div>

              </div>


              <div className="dashboard-overview-row">

                <span>
                  Received
                </span>


                <strong>
                  {money(
                    receivedAmount
                  )}
                </strong>

              </div>


              <div className="dashboard-overview-row">

                <span>
                  Pending
                </span>


                <strong>
                  {money(
                    pendingDonations
                  )}
                </strong>

              </div>


              <div className="dashboard-overview-row">

                <span>
                  Total Records
                </span>


                <strong>
                  {donations.length}
                </strong>

              </div>

            </div>


            {/* =================================================
                EXPENSE OVERVIEW
            ================================================= */}

            <div className="dashboard-panel">

              <div className="dashboard-panel-header">

                <div>

                  <span className="page-eyebrow">
                    FESTIVAL SPENDING
                  </span>


                  <h3>
                    Expense Overview
                  </h3>

                </div>

              </div>


              <div className="dashboard-overview-row">

                <span>
                  Total Expenses
                </span>


                <strong>
                  {money(
                    totalExpenses
                  )}
                </strong>

              </div>


              <div className="dashboard-overview-row">

                <span>
                  Records
                </span>


                <strong>
                  {expenses.length}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              RECENT DONATIONS
          ================================================= */}

          <div className="dashboard-panel dashboard-recent mobile-hide">

            <div className="dashboard-panel-header">

              <div>

                <span className="page-eyebrow">
                  RECENT ACTIVITY
                </span>


                <h3>
                  Recent Donations
                </h3>

              </div>

            </div>


            {recentDonations.length === 0 ? (

              <div className="dashboard-no-data">
                No donations yet.
              </div>

            ) : (

              <div className="dashboard-recent-list">

                {recentDonations.map(
                  (donation, index) => {

                    const id =
                      donation._id ||
                      donation.id ||
                      `donation-${index}`;


                    return (

                      <div
                        className="dashboard-recent-item"
                        key={id}
                      >

                        <div>

                          <strong>
                            {donation.donorName ||
                              donation.name ||
                              "Unknown"}
                          </strong>


                          <small>
                            {donation.date ||
                              donation.createdAt ||
                              "-"}
                          </small>

                        </div>


                        <strong>
                          {money(
                            donation.amount
                          )}
                        </strong>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </>

      )}

    </div>

  );

}


export default Home;