import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/store";
import MainClaim from "./MainClaim";
import FirstClaim from "./FirstClaim";
import SecondClaim from "./SecondClaim";
import { WiborData } from "../../store/reducers/wiborReducer";
import { Installment } from "../../types";

export const Summary: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const params = JSON.parse(localStorage.getItem("loanParams") || "null");
  const basicCalculations = useSelector(
    (state: AppState) => state.calculator.results
  );

  const signDateWibor = useSelector(
    (state: AppState) => state.calculator.params?.startDate
  );
  console.log(signDateWibor);
  const wiborData = useSelector(
    (state: AppState) => state.wibor.wiborData
  ) as WiborData[];

  useEffect(() => {
    if (!params || !basicCalculations || !wiborData) {
      setError("Missing required data");
    }
  }, [params, basicCalculations, wiborData]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Obliczenia używając kalkulatorów

  let mainClaimResults, firstClaimResults, secondClaimResults;
  try {
    mainClaimResults = useSelector(
      (state: AppState) => state.calculator.mainClaimResults
    ) as Installment[];
    firstClaimResults = useSelector(
      (state: AppState) => state.calculator.firstClaimResults
    ) as Installment[];
    secondClaimResults = useSelector(
      (state: AppState) => state.calculator.secondClaimResults
    ) as Installment[];
  } catch (err) {
    setError("Error calculating installments");
    console.error(err);
    return null;
  }

  if (wiborData.length === 0) {
    setError("WiborData is empty");
    return null;
  }

  const latestWiborDate = new Date(
    wiborData
      .slice()
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0].date
  );
  console.log("Latest WIBOR Date:", latestWiborDate);

  const totalInterestBasicCalc = basicCalculations.reduce(
    (acc, installment) => acc + installment.interest,
    0
  );
  const totalInterestMainClaimCalc = mainClaimResults.reduce(
    (acc, installment) => acc + installment.interest,
    0
  );
  const futureInterestBasicCalc = basicCalculations.reduce(
    (acc, installment) => {
      if (new Date(installment.date) >= latestWiborDate) {
        return acc + installment.interest;
      }
      return acc;
    },
    0
  );
  const futureInterestMainClaimCalc = mainClaimResults.reduce(
    (acc, installment) => {
      if (new Date(installment.date) >= latestWiborDate) {
        return acc + installment.interest;
      }
      return acc;
    },
    0
  );
  const borrowerBenefitCalc =
    totalInterestBasicCalc - totalInterestMainClaimCalc;

  const totalInterestFirstClaimCalc = firstClaimResults.reduce(
    (acc, installment) => acc + installment.interest,
    0
  );
  const refundInterestCalc =
    totalInterestBasicCalc - totalInterestFirstClaimCalc;
  const borrowerBenefitFirstClaimCalc =
    totalInterestBasicCalc - totalInterestFirstClaimCalc;
  const futureInterestDifferenceCalcFirstClaim =
    futureInterestBasicCalc -
    firstClaimResults.reduce((acc, installment) => {
      if (new Date(installment.date) >= latestWiborDate) {
        return acc + installment.interest;
      }
      return acc;
    }, 0);

  const totalInterestSecondClaimCalc = secondClaimResults.reduce(
    (acc, installment) => acc + installment.interest,
    0
  );

  const futureInterestBasic = basicCalculations.reduce((acc, installment) => {
    if (new Date(installment.date) >= latestWiborDate) {
      return acc + installment.interest;
    }
    return acc;
  }, 0);

  const futureInterestSecondClaim = secondClaimResults.reduce(
    (acc, installment) => {
      if (new Date(installment.date) >= latestWiborDate) {
        return acc + installment.interest;
      }
      return acc;
    },
    0
  );

  const futureInterestDifferenceCalc =
    futureInterestBasic - futureInterestSecondClaim;
  params.signDateWibor = signDateWibor;
  const calculationsSummary = {
    totalInterestBasicCalc,
    totalInterestMainClaimCalc,
    futureInterestBasicCalc,
    futureInterestMainClaimCalc,
    borrowerBenefitCalc,
    totalInterestFirstClaimCalc,
    refundInterestCalc,
    borrowerBenefitFirstClaimCalc,
    futureInterestDifferenceCalcFirstClaim,
    totalInterestSecondClaimCalc,
    futureInterestDifferenceCalc,
  };

  console.log("Calculations Summary:", calculationsSummary);

  const handleGenerateExcel = async () => {
    try {
      const response = await fetch(
        "https://laywer-calculator-server.onrender.com/api/generate-excel",
        {
          //   const response = await fetch("http://localhost:3001/api/generate-excel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params,
            mainClaimResults,
            firstClaimResults,
            secondClaimResults,
            basicCalculations,
            wiborData,
            calculationsSummary,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to generate Excel file");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "loan_calculations.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error generating Excel file:", error);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <MainClaim />
      <FirstClaim />
      <SecondClaim />
      <button
        onClick={handleGenerateExcel}
        className="btn bg-blue-500 text-white p-2 rounded"
      >
        Wygeneruj plik Excel
      </button>
    </div>
  );
};

export default Summary;
