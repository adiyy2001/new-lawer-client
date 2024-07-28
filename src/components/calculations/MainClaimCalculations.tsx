import React, { useEffect } from 'react';
import {  useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../../store/store';
import { Installment } from '../../types';

const MainClaimCalculations: React.FC = () => {
  const mainClaimResults = useSelector((state: AppState) => state.calculator.mainClaimResults) as Installment[];
  const navigate = useNavigate();

  useEffect(() => {
    if (!mainClaimResults.length) {
      navigate('/');
    }})

  const formatNumber = (number: number | undefined): string => {
    if (number === undefined) {
      return "0,00";
    }
    return number.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="container mx-auto p-4">
      {mainClaimResults.length > 0 ? (
        <div className="calculation-results mt-8">
          <h2 className="text-xl font-bold mb-4">Wyniki obliczeń MainClaim</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">Data</th>
                  <th className="py-2 px-4 border">Odsetki (zł)</th>
                  <th className="py-2 px-4 border">Kapitał (zł)</th>
                  <th className="py-2 px-4 border">Rata (zł)</th>
                  <th className="py-2 px-4 border">Pozostałe zadłużenie (zł)</th>
                  <th className="py-2 px-4 border">WIBOR 3M</th>
                  <th className="py-2 px-4 border">MARŻA + WIBOR 3M</th>
                </tr>
              </thead>
              <tbody>
                {mainClaimResults.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2 px-4 border">{new Date(result.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.interest)}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.principal)}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.installment)}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.remainingAmount)}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.wiborWithoutMargin)}</td>
                    <td className="py-2 px-4 border text-right">{formatNumber(result.wiborRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MainClaimCalculations;
