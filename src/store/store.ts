import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import calculatorReducer, { CalculationState } from './reducers/calculatorReducer';
import wiborReducer, { WiborState } from './reducers/wiborReducer';

const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
    wibor: wiborReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppState = {
  calculator: CalculationState;
  wibor: WiborState;
};
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
