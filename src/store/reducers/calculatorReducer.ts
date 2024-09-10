import { createReducer, Reducer } from '@reduxjs/toolkit';
import { setCalculationParams, setCalculationResults, setMainClaimResults, setFirstClaimResults, setSecondClaimResults } from '../actions/calculatorActions';
import { BaseCalculationParams, Installment } from '../../types';

export interface CalculationState {
  params: BaseCalculationParams | null;
  results: Installment[];
  mainClaimResults: Installment[];
  firstClaimResults: Installment[];
  secondClaimResults: Installment[];
}

const initialState: CalculationState = {
  params: null,
  results: [],
  mainClaimResults: [],
  firstClaimResults: [],
  secondClaimResults: [],
};

const calculatorReducer: Reducer<CalculationState> = createReducer(initialState, (builder) => {
  builder
    .addCase(setCalculationParams, (state, action) => {
      state.params = action.payload;
    })
    .addCase(setCalculationResults, (state, action) => {
      state.results = action.payload;
    })
    .addCase(setMainClaimResults, (state, action) => {
      state.mainClaimResults = action.payload;
    })
    .addCase(setFirstClaimResults, (state, action) => {
      state.firstClaimResults = action.payload;
    })
    .addCase(setSecondClaimResults, (state, action) => {
      state.secondClaimResults = action.payload;
    });
});

export default calculatorReducer;
