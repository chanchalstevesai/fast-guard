// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   selectedEmail: "",
// };

// const usermailSlice = createSlice({
//   name: "usermail",
//   initialState,
//   reducers: {
//     setSelectedUsermail: (state, action) => {
//       state.selectedEmail = action.payload;
//     },
//   },
// });

// export const { setSelectedUsermail } = usermailSlice.actions;
// export default usermailSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

// Initialize from localStorage if available
const initialState = {
  selectedEmail: localStorage.getItem("selectedEmail") || "",
};

const usermailSlice = createSlice({
  name: "usermail",
  initialState,
  reducers: {
    setSelectedUsermail: (state, action) => {
      state.selectedEmail = action.payload;
      // Persist to localStorage
      localStorage.setItem("selectedEmail", action.payload);
    },
    clearSelectedUsermail: (state) => {
      state.selectedEmail = "";
      localStorage.removeItem("selectedEmail");
    },
  }, 
});

export const { setSelectedUsermail, clearSelectedUsermail } = usermailSlice.actions;
export default usermailSlice.reducer;
