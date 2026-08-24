const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {

    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    await connectDB();

    console.log("Database connected");


    // ==========================================
    // ADMIN DETAILS
    // ==========================================

    const name = "Dharmateja";

    const mobile = "9052551462";

    const password = "Dharmateja@1234";

    const role = "admin";


    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // ==========================================
    // CHECK EXISTING ADMIN
    // ==========================================

    const existingUser =
      await User.findOne({
        mobile: mobile,
      });


    // ==========================================
    // UPDATE EXISTING USER
    // ==========================================

    if (existingUser) {

      existingUser.name = name;

      existingUser.password =
        hashedPassword;

      existingUser.role =
        "admin";

      existingUser.mobile =
        mobile;

      await existingUser.save();

      console.log(
        "=================================="
      );

      console.log(
        "Existing user updated successfully"
      );

      console.log(
        "Mobile:",
        mobile
      );

      console.log(
        "Role:",
        existingUser.role
      );

      console.log(
        "=================================="
      );

    }

    // ==========================================
    // CREATE NEW ADMIN
    // ==========================================

    else {

      const admin =
        await User.create({

          name: name,

          mobile: mobile,

          password:
            hashedPassword,

          role: role,

        });


      console.log(
        "=================================="
      );

      console.log(
        "Admin created successfully"
      );

      console.log(
        "Mobile:",
        admin.mobile
      );

      console.log(
        "Role:",
        admin.role
      );

      console.log(
        "=================================="
      );

    }


    process.exit(0);

  } catch (error) {

    console.error(
      "CREATE ADMIN ERROR:",
      error
    );

    process.exit(1);

  }
};


createAdmin();