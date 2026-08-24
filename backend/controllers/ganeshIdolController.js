const GaneshIdol = require(
  "../models/GaneshIdol"
);

const getGaneshIdols = async (
  req,
  res
) => {
  try {
    const year = Number(req.query.year);

    const filter = {};

    if (year) {
      filter.festivalYear = year;
    }

    const idols =
      await GaneshIdol.find(filter)
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      count: idols.length,
      idols,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch Ganesh idols",
      error: error.message,
    });
  }
};

const addGaneshIdol = async (
  req,
  res
) => {
  try {
    const {
      idolName,
      supplierName,
      mobile,
      totalFeet,
      totalAmount,
      advanceAmount,
      bookingDate,
      deliveryDate,
      paymentMethod,
      status,
      notes,
      festivalYear,
      year,
    } = req.body;

    if (
      !idolName ||
      !totalAmount ||
      !bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Idol name, amount and booking date are required",
      });
    }

    const idol =
      await GaneshIdol.create({
        idolName,
        supplierName,
        mobile,

        image: req.file
          ? `/uploads/idols/${req.file.filename}`
          : "",

        totalFeet:
          Number(totalFeet || 0),

        totalAmount:
          Number(totalAmount),

        advanceAmount:
          Number(advanceAmount || 0),

        bookingDate,
        deliveryDate,

        paymentMethod:
          paymentMethod || "Cash",

        status:
          status || "Booked",

        notes: notes || "",

        festivalYear: Number(
          festivalYear || year
        ),
      });

    res.status(201).json({
      success: true,
      message:
        "Ganesh idol added successfully",
      idol,
    });
  } catch (error) {
    console.error(
      "ADD IDOL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add Ganesh idol",
      error: error.message,
    });
  }
};

const updateGaneshIdol =
  async (req, res) => {
    try {
      const updateData = {
        ...req.body,
      };

      if (req.file) {
        updateData.image =
          `/uploads/idols/${req.file.filename}`;
      }

      if (
        updateData.totalAmount !==
        undefined
      ) {
        updateData.totalAmount =
          Number(updateData.totalAmount);
      }

      if (
        updateData.advanceAmount !==
        undefined
      ) {
        updateData.advanceAmount =
          Number(updateData.advanceAmount);
      }

      if (
        updateData.totalFeet !==
        undefined
      ) {
        updateData.totalFeet =
          Number(updateData.totalFeet);
      }

      const idol =
        await GaneshIdol.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!idol) {
        return res.status(404).json({
          success: false,
          message:
            "Ganesh idol not found",
        });
      }

      res.json({
        success: true,
        message:
          "Ganesh idol updated successfully",
        idol,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to update Ganesh idol",
        error: error.message,
      });
    }
  };

const deleteGaneshIdol =
  async (req, res) => {
    try {
      const idol =
        await GaneshIdol.findByIdAndDelete(
          req.params.id
        );

      if (!idol) {
        return res.status(404).json({
          success: false,
          message:
            "Ganesh idol not found",
        });
      }

      res.json({
        success: true,
        message:
          "Ganesh idol deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Failed to delete Ganesh idol",
        error: error.message,
      });
    }
  };

module.exports = {
  getGaneshIdols,
  addGaneshIdol,
  updateGaneshIdol,
  deleteGaneshIdol,
};