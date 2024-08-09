import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WiborData {
  date: string;
  id: number;
  wibor3m: number;
  wibor6m: number;
}

export interface WiborState {
  wiborData: WiborData[] | null;
  loading: boolean;
  error: string | null;
}

export const initialState: WiborState = {
  wiborData: null,
  loading: true,
  error: null,
};

const wiborSlice = createSlice({
  name: "wibor",
  initialState,
  reducers: {
    fetchWiborStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWiborSuccess(state, action: PayloadAction<WiborData[]>) {
      state.wiborData = action.payload;
      state.loading = false;
    },
    fetchWiborFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchWiborStart, fetchWiborSuccess, fetchWiborFailure } =
  wiborSlice.actions;

export default wiborSlice.reducer;
