import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store/store';
import MainClaim from './MainClaim';
import FirstClaim from './FirstClaim';
import SecondClaim from './SecondClaim';
import { WiborData } from '../../store/reducers/wiborReducer';

export const Summary: React.FC = () => {
    const params = JSON.parse(localStorage.getItem('loanParams') || '');
    console.log(params)
    const basicCalulations = useSelector((state: AppState) => state.calculator.results);
    const mainClaimResults = useSelector((state: AppState) => state.calculator.mainClaimResults);
    const firstClaimResults = useSelector((state: AppState) => state.calculator.firstClaimResults);
    const secondClaimResults = useSelector((state: AppState) => state.calculator.secondClaimResults);
    const wiborData = useSelector((state: AppState) => state.wibor.wiborData) as WiborData[];

    const handleGenerateExcel = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/generate-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    params,
                    mainClaimResults,
                    firstClaimResults,
                    secondClaimResults,
                    basicCalulations,
                    wiborData
                }),
            });

            if (!response.ok) {
                console.error('Failed to generate Excel file');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'loan_calculations.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error generating Excel file:', error);
        }
    };

    return (
        <div>
            <MainClaim />
            <FirstClaim />
            <SecondClaim />
            <button onClick={handleGenerateExcel} className="btn btn-primary mt-4">
                Generate Excel
            </button>
        </div>
    );
};

export default Summary;
