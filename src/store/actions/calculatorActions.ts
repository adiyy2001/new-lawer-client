

import { createAction } from '@reduxjs/toolkit';
import { BaseCalculationParams, Installment } from '../../types';

export const setCalculationParams = createAction<BaseCalculationParams>('SET_CALCULATION_PARAMS');
export const setCalculationResults = createAction<Installment[]>('SET_CALCULATION_RESULTS');
export const setMainClaimResults = createAction<Installment[]>('SET_MAIN_CLAIM_RESULTS');
export const setFirstClaimResults = createAction<Installment[]>('SET_FIRST_CLAIM_RESULTS');
export const setSecondClaimResults = createAction<Installment[]>('SET_SECOND_CLAIM_RESULTS');
