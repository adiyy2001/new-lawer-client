import axios from "axios";

import { AppThunk } from "../store";
import {
  fetchWiborStart,
  fetchWiborSuccess,
  fetchWiborFailure,
  WiborData,
} from "../reducers/wiborReducer";

export const fetchWibor = (): AppThunk => async (dispatch) => {
  dispatch(fetchWiborStart());
  try {
    const response = await axios.get(
      "https://laywer-calculator-server.onrender.com/api/get-wibor-rates"
    );
    const processedData = response.data.map((item: WiborData) => ({
      ...item,
      wibor3m: parseFloat(
        item.wibor3m.toString().replace(",", ".").replace("%", "")
      ),
      wibor6m: parseFloat(
        item.wibor6m.toString().replace(",", ".").replace("%", "")
      ),
    }));

    dispatch(fetchWiborSuccess(processedData));
  } catch (error: unknown) {
    if (error instanceof Error) {
      dispatch(fetchWiborFailure(error.message));
    } else {
      dispatch(fetchWiborFailure("An unknown error occurred"));
    }
  }
};
