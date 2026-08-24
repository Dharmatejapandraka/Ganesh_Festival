const jwt = require("jsonwebtoken");


// =====================================================
// VERIFY LOGIN
// =====================================================

const protect = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;


    // -----------------------------------------------
    // CHECK TOKEN
    // -----------------------------------------------

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

    }


    const token =
      authHeader.split(" ")[1];


    // -----------------------------------------------
    // VERIFY JWT
    // -----------------------------------------------

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // -----------------------------------------------
    // SAVE USER
    // -----------------------------------------------

    req.user = decoded;


    next();


  } catch (error) {

    console.error(
      "AUTH ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });

  }
};


// =====================================================
// ADMIN ONLY
// =====================================================

const adminOnly = (
  req,
  res,
  next
) => {

  if (
    !req.user ||
    req.user.role !== "admin"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Admin access required",
    });

  }

  next();
};


// =====================================================
// EDITOR + ADMIN
// =====================================================

const editorOrAdmin = (
  req,
  res,
  next
) => {

  if (
    !req.user ||
    (
      req.user.role !== "editor" &&
      req.user.role !== "admin"
    )
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Editor access required",
    });

  }

  next();
};


module.exports = {
  protect,
  adminOnly,
  editorOrAdmin,
};