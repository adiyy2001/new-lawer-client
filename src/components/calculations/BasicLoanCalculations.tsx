import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCalculationParams, setCalculationResults, setMainClaimResults, setFirstClaimResults, setSecondClaimResults } from '../../store/actions/calculatorActions';
import { WiborData } from '../../store/reducers/wiborReducer';
import { AppState } from '../../store/store';
import { Installment } from '../../types';
import BasicLoanCalculator from '../../utils/BasicLoanCalculator';
import FirstClaimCalculator from '../../utils/FirstClaimCalculator';
import MainClaimCalculator from '../../utils/MainClaimCalculator';
import SecondClaimCalculator from '../../utils/SecondClaimCalculator';

const BasicLoanCalculations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wiborData = useSelector((state: AppState) => state.wibor.wiborData) as WiborData[];
  const basicResults = useSelector((state: AppState) => state.calculator.results) as Installment[];
  const mainClaimResults = useSelector((state: AppState) => state.calculator.mainClaimResults) as Installment[];
  const firstClaimResults = useSelector((state: AppState) => state.calculator.firstClaimResults) as Installment[];
  const secondClaimResults = useSelector((state: AppState) => state.calculator.secondClaimResults) as Installment[];

  useEffect(() => {
    if (!location.state || !wiborData) {
      navigate('/');
      return;
    }

    const params = location.state.data;
    
    const loanCalculator = new BasicLoanCalculator(wiborData);
    const basicCalculations = loanCalculator.calculateInstallments('wibor3m', params, true);
    dispatch(setCalculationParams(params));
    dispatch(setCalculationResults(basicCalculations));

    const mainClaimCalculator = new MainClaimCalculator(wiborData);
    const mainClaimCalculations = mainClaimCalculator.calculateInstallments('wibor3m', params);
    dispatch(setMainClaimResults(mainClaimCalculations));

    const firstClaimCalculator = new FirstClaimCalculator();
    const firstClaimCalculations = firstClaimCalculator.calculateInstallments(params);
    dispatch(setFirstClaimResults(firstClaimCalculations));

    const secondClaimCalculator = new SecondClaimCalculator(wiborData);
    const secondClaimCalculations = secondClaimCalculator.calculateInstallments('wibor3m', params);
    dispatch(setSecondClaimResults(secondClaimCalculations));
  }, [location.state, wiborData, dispatch, navigate]);

  const formatNumber = (number: number | undefined): string => {
    if (number === undefined) {
      return "0,00";
    }
    return number.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (basicResults.length === 0 || mainClaimResults.length === 0 || firstClaimResults.length === 0 || secondClaimResults.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="calculation-results mt-8">
        <h2 className="text-xl font-bold mb-4">Wyniki obliczeń</h2>
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
              {basicResults.map((result, index) => (
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
    </div>
  );
};

export default BasicLoanCalculations;
