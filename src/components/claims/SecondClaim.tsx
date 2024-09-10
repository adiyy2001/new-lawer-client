import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/store";
import { Installment } from "../../types";

const SecondClaimCalculations: React.FC = () => {
  const basicResults = useSelector(
    (state: AppState) => state.calculator.results
  ) as Installment[];
  const secondClaimResults = useSelector(
    (state: AppState) => state.calculator.secondClaimResults
  ) as Installment[];
  const wiborData = useSelector((state: AppState) => state.wibor.wiborData);

  const [totalInterestBasic, setTotalInterestBasic] = useState(0);
  const [totalInterestSecondClaim, setTotalInterestSecondClaim] = useState(0);
  const [refundInterest, setRefundInterest] = useState(0);
  const [_borrowerBenefit, setBorrowerBenefit] = useState(0);
  const [futureInterestDifference, setFutureInterestDifference] = useState(0);
  const [unknownWiborDate, setUnknownWiborDate] = useState<Date | null>(null);
  const [loanEndDate, setLoanEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate total interest for Basic Loan
    const totalInterestBasicCalc = basicResults.reduce(
      (acc, installment) => acc + installment.interest,
      0
    );
    setTotalInterestBasic(totalInterestBasicCalc);

    // Calculate total interest for Second Claim
    const totalInterestSecondClaimCalc = secondClaimResults.reduce(
      (acc, installment) => acc + installment.interest,
      0
    );
    setTotalInterestSecondClaim(totalInterestSecondClaimCalc);

    // Find the loan end date in Basic Loan
    const endDate = basicResults[basicResults.length - 1]?.date;
    setLoanEndDate(endDate);

    // Find the last known WIBOR date
    const lastWiborData = wiborData?.reduce((latest, entry) => {
      const entryDate = new Date(entry.date);
      return entryDate > new Date(latest.date) ? entry : latest;
    }, wiborData[0]);

    if (lastWiborData) {
      setUnknownWiborDate(new Date(lastWiborData.date));
    }
  }, [basicResults, secondClaimResults, wiborData]);

  useEffect(() => {
    if (unknownWiborDate && loanEndDate) {
      // Calculate the total interest up to the unknown WIBOR date for basic results
      const interestUpToUnknownWiborDate = basicResults.reduce(
        (acc, installment) => {
          if (new Date(installment.date) < unknownWiborDate) {
            return acc + installment.interest;
          }
          return acc;
        },
        0
      );

      // Calculate the total interest up to the unknown WIBOR date for second claim results
      const interestSecondClaimUpToUnknownWiborDate = secondClaimResults.reduce(
        (acc, installment) => {
          if (new Date(installment.date) < unknownWiborDate) {
            return acc + installment.interest;
          }
          return acc;
        },
        0
      );

      // Calculate refund interest (difference up to the unknown WIBOR date)
      const refundInterestCalc =
        interestUpToUnknownWiborDate - interestSecondClaimUpToUnknownWiborDate;
      setRefundInterest(refundInterestCalc);

      // Calculate borrower benefit as the calculated difference
      setBorrowerBenefit(refundInterestCalc);

      // Calculate future interest difference from the specified dates
      const futureInterestBasic = basicResults.reduce((acc, installment) => {
        if (new Date(installment.date) >= unknownWiborDate) {
          return acc + installment.interest;
        }
        return acc;
      }, 0);

      const futureInterestSecondClaim = secondClaimResults.reduce(
        (acc, installment) => {
          if (new Date(installment.date) >= unknownWiborDate) {
            return acc + installment.interest;
          }
          return acc;
        },
        0
      );

      const futureInterestDifferenceCalc =
        futureInterestBasic - futureInterestSecondClaim;
      setFutureInterestDifference(futureInterestDifferenceCalc);
    }
  }, [unknownWiborDate, loanEndDate, basicResults, secondClaimResults]);

  const formatNumber = (number: number | undefined): string => {
    if (number === undefined) {
      return "0,00";
    }
    return number.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="calculation-results mt-8">
        <h2 className="text-xl font-bold mb-4">II ROSZCZENIE EWENTUALNE: </h2>
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Opis</th>
                <th className="py-2 px-4 border">Wartość (zł)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="py-2 px-4 border">Wibor 3M</td>
                <td className="py-2 px-4 border text-right">
                  {formatNumber(totalInterestBasic)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border">Stały WIBOR</td>
                <td className="py-2 px-4 border text-right">
                  {formatNumber(totalInterestSecondClaim)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-2 px-4 border">
                  Zwrot do Klienta nadpłaconych odsetek
                </td>
                <td className="py-2 px-4 border text-right">
                  {formatNumber(refundInterest)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border">
                  Wartość anulowanych odsetek na przyszłość
                </td>
                <td className="py-2 px-4 border text-right">
                  {formatNumber(futureInterestDifference)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-2 px-4 border">Korzyść Kredytobiorcy</td>
                <td className="py-2 px-4 border text-right">
                  {formatNumber(refundInterest + futureInterestDifference)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecondClaimCalculations;
