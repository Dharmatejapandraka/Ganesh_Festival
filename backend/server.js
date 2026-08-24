const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

const donationRoutes =
  require("./routes/donationRoutes");

const expenseRoutes =
  require("./routes/expenseRoutes");

const djSetRoutes =
  require("./routes/djSetRoutes");

const pujariRoutes =
  require("./routes/pujariRoutes");

const ganeshIdolRoutes =
  require("./routes/ganeshIdolRoutes");

const photoRoutes =
  require("./routes/photoRoutes");

const nimarganamRoutes =
  require("./routes/nimarganamRoutes");

const committeeRoutes =
  require("./routes/committeeRoutes");

const villagerRoutes =
  require("./routes/villagerRoutes");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// =====================================================
// UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message:
      "Ganesh Festival API is running",
  });

});


// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// USERS / ADMIN
// =====================================================

app.use(
  "/api/users",
  userRoutes
);


// =====================================================
// DONATIONS
// =====================================================

app.use(
  "/api/donations",
  donationRoutes
);


// =====================================================
// EXPENSES
// =====================================================

app.use(
  "/api/expenses",
  expenseRoutes
);


// =====================================================
// DJ SETS
// =====================================================

app.use(
  "/api/dj-sets",
  djSetRoutes
);


// =====================================================
// PUJARI
// =====================================================

app.use(
  "/api/pujari",
  pujariRoutes
);

app.use(
  "/api/pujaris",
  pujariRoutes
);


// =====================================================
// GANESH IDOLS
// =====================================================

app.use(
  "/api/ganesh-idols",
  ganeshIdolRoutes
);

app.use(
  "/api/ganesh-idol",
  ganeshIdolRoutes
);


// =====================================================
// PHOTOS
// =====================================================

app.use(
  "/api/photos",
  photoRoutes
);


// =====================================================
// NIMARGANAM
// =====================================================

app.use(
  "/api/nimarganam",
  nimarganamRoutes
);


// =====================================================
// COMMITTEE
// =====================================================

app.use(
  "/api/committee",
  committeeRoutes
);


// =====================================================
// VILLAGERS
// =====================================================

app.use(
  "/api/villagers",
  villagerRoutes
);


// =====================================================
// 404
// =====================================================

app.use(
  (req, res) => {

    console.log(
      "404 API:",
      req.method,
      req.originalUrl
    );

    res.status(404).json({
      success: false,
      message:
        `API route not found: ${req.method} ${req.originalUrl}`,
    });

  }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });

  }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);