import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEmail: "",
};

const usermailSlice = createSlice({
  name: "usermail",
  initialState,
  reducers: {
    setSelectedUsermail: (state, action) => {
      state.selectedEmail = action.payload;
    },
  },
});

export const { setSelectedUsermail } = usermailSlice.actions;
export default usermailSlice.reducer;
