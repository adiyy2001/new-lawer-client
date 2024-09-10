import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../store/store';
import { Installment } from '../../types';

const FirstClaimCalculations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const firstClaimResults = useSelector((state: AppState) => state.calculator.firstClaimResults) as Installment[];

  useEffect(() => {
    if (!firstClaimResults.length) {
      navigate('/');
    }

  }, [location.state, , dispatch, navigate]);

  const formatNumber = (number: number | undefined): string => {
    if (number === undefined) {
      return "0,00";
    }
    return number.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (firstClaimResults.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="calculation-results mt-8">
        <h2 className="text-xl font-bold mb-4">Wyniki obliczeń First Claim</h2>
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Data</th>
                <th className="py-2 px-4 border">Odsetki (zł)</th>
                <th className="py-2 px-4 border">Kapitał (zł)</th>
                <th className="py-2 px-4 border">Rata (zł)</th>
                <th className="py-2 px-4 border">Pozostałe zadłużenie (zł)</th>
                <th className="py-2 px-4 border">MARŻA</th>
              </tr>
            </thead>
            <tbody>
              {firstClaimResults.map((result, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-2 px-4 border">{new Date(result.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.interest)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.principal)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.installment)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.remainingAmount)}</td>
                  <td className="py-2 px-4 border text-right">{formatNumber(result.wiborRate - result.wiborWithoutMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FirstClaimCalculations;
