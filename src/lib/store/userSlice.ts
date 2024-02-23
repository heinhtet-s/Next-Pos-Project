import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  email: string;
  username: string;
  auth: boolean;
  isAdmin: boolean;
}

const initialState: UserState = {
  email: "",
  username: "",
  auth: true,
  isAdmin: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    LoggedIn: (
      state,
      action: PayloadAction<{
        email: string;
        username: string;
        isAdmin: boolean;
      }>
    ) => {
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.isAdmin = action.payload.isAdmin;
      state.auth = true;
    },
    LoggedOut: (state) => {
      state.email = "";
      state.username = "";
      state.isAdmin = false;
      state.auth = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { LoggedIn, LoggedOut } = userSlice.actions;

export default userSlice.reducer;
