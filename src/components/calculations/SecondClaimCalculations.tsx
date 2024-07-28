import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../../store/store';
import { Installment } from '../../types';

const SecondClaimCalculations: React.FC = () => {
  const navigate = useNavigate();
  const secondClaimResults = useSelector((state: AppState) => state.calculator.secondClaimResults) as Installment[];

  useEffect(() => {
    if (!secondClaimResults.length) {
      navigate('/');
    }
  }, [secondClaimResults, navigate]); // Dodano tablicę zależności

  const formatNumber = (number: number | undefined): string => {
    if (number === undefined) {
      return "0,00";
    }
    return number.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (secondClaimResults.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="calculation-results mt-8">
        <h2 className="text-xl font-bold mb-4">Wyniki obliczeń Second Claim</h2>
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Data</th>
                <th className="py-2 px-4 border">Odsetki (zł)</th>
                <th className="py-2 px-4 border">Kapitał (zł)</th>
                <th className="py-2 px-4 border">Rata (zł)</th>
                <th className="py-2 px-4 border">Pozostałe zadłużenie (zł)</th>
                <th className="py-2 px-4 border">MARŻA + WIBOR 3M</th>
              </tr>
            </thead>
            <tbody>
              {secondClaimResults.map((result, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-2 px-4 border">{new Date(result.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.interest)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.principal)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.installment)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.remainingAmount)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.wiborRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecondClaimCalculations;
