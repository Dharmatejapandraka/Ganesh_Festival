import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FestivalContext =
  createContext(null);

/* =========================================
   DEFAULT YEAR DATA
========================================= */

const createEmptyFestivalYear = () => ({
  donations: [],
  expenses: [],
  djSets: [],
  pujari: [],
  ganeshIdol: [],
  nimarganam: [],
});

/* =========================================
   DEFAULT PERMANENT DATA
========================================= */

const defaultPermanentData = {
  committee: [],
  villagers: [],
};

/* =========================================
   LOAD FESTIVAL DATA
========================================= */

const loadFestivalData = () => {
  try {
    const saved =
      localStorage.getItem(
        "ganeshFestivalData"
      );

    if (!saved) {
      return {};
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Unable to load festival data:",
      error
    );

    return {};
  }
};

/* =========================================
   LOAD PERMANENT DATA
========================================= */

const loadPermanentData = () => {
  try {
    const saved =
      localStorage.getItem(
        "ganeshPermanentData"
      );

    if (!saved) {
      return defaultPermanentData;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Unable to load permanent data:",
      error
    );

    return defaultPermanentData;
  }
};

/* =========================================
   PROVIDER
========================================= */

export function FestivalProvider({
  children,
}) {
  /* ---------------------------------------
     CURRENT YEAR
  --------------------------------------- */

  const [currentYear, setCurrentYear] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "ganeshCurrentYear"
        );

      return saved
        ? Number(saved)
        : new Date().getFullYear();
    });

  /* ---------------------------------------
     ALL YEAR DATA
  --------------------------------------- */

  const [festivalData, setFestivalData] =
    useState(loadFestivalData);

  /* ---------------------------------------
     PERMANENT DATA
  --------------------------------------- */

  const [permanentData, setPermanentData] =
    useState(loadPermanentData);

  /* =======================================
     SAVE YEAR
  ======================================= */

  useEffect(() => {
    localStorage.setItem(
      "ganeshCurrentYear",
      String(currentYear)
    );
  }, [currentYear]);

  /* =======================================
     SAVE FESTIVAL DATA
  ======================================= */

  useEffect(() => {
    localStorage.setItem(
      "ganeshFestivalData",
      JSON.stringify(festivalData)
    );
  }, [festivalData]);

  /* =======================================
     SAVE PERMANENT DATA
  ======================================= */

  useEffect(() => {
    localStorage.setItem(
      "ganeshPermanentData",
      JSON.stringify(
        permanentData
      )
    );
  }, [permanentData]);

  /* =======================================
     MAKE SURE YEAR EXISTS
  ======================================= */

  useEffect(() => {
    setFestivalData((previous) => {
      if (previous[currentYear]) {
        return previous;
      }

      return {
        ...previous,

        [currentYear]:
          createEmptyFestivalYear(),
      };
    });
  }, [currentYear]);

  /* =======================================
     CURRENT YEAR DATA
  ======================================= */

  const currentFestivalData =
    useMemo(() => {
      return (
        festivalData[currentYear] ||
        createEmptyFestivalYear()
      );
    }, [
      festivalData,
      currentYear,
    ]);

  /* =======================================
     CHANGE YEAR
  ======================================= */

  const changeYear = (year) => {
    const selectedYear =
      Number(year);

    if (!selectedYear) {
      return;
    }

    /* If this year doesn't exist,
       create an empty year */

    setFestivalData((previous) => {
      if (previous[selectedYear]) {
        return previous;
      }

      return {
        ...previous,

        [selectedYear]:
          createEmptyFestivalYear(),
      };
    });

    setCurrentYear(selectedYear);
  };

  /* =======================================
     UPDATE CURRENT YEAR DATA
  ======================================= */

  const updateCurrentYearData = (
    section,
    data
  ) => {
    setFestivalData((previous) => ({
      ...previous,

      [currentYear]: {
        ...(previous[currentYear] ||
          createEmptyFestivalYear()),

        [section]: data,
      },
    }));
  };

  /* =======================================
     ADD ITEM TO CURRENT YEAR
  ======================================= */

  const addCurrentYearItem = (
    section,
    item
  ) => {
    const existing =
      currentFestivalData[section] ||
      [];

    updateCurrentYearData(
      section,
      [...existing, item]
    );
  };

  /* =======================================
     REMOVE ITEM
  ======================================= */

  const removeCurrentYearItem = (
    section,
    id
  ) => {
    const existing =
      currentFestivalData[section] ||
      [];

    const updated =
      existing.filter(
        (item) =>
          item.id !== id
      );

    updateCurrentYearData(
      section,
      updated
    );
  };

  /* =======================================
     UPDATE PERMANENT DATA
  ======================================= */

  const updatePermanentData = (
    section,
    data
  ) => {
    setPermanentData(
      (previous) => ({
        ...previous,

        [section]: data,
      })
    );
  };

  /* =======================================
     VALUE
  ======================================= */

  const value = {
    currentYear,

    changeYear,
    setCurrentYear: changeYear,

    festivalData,

    currentFestivalData,

    permanentData,

    updateCurrentYearData,

    addCurrentYearItem,

    removeCurrentYearItem,

    updatePermanentData,
  };

  return (
    <FestivalContext.Provider
      value={value}
    >
      {children}
    </FestivalContext.Provider>
  );
}

/* =========================================
   HOOK
========================================= */

export function useFestival() {
  const context =
    useContext(FestivalContext);

  if (!context) {
    throw new Error(
      "useFestival must be used inside FestivalProvider"
    );
  }

  return context;
}

export default FestivalContext;