import { createSlice } from "@reduxjs/toolkit";
import { getMembers } from "../../Networking/APIs/MemberApi";

const membersSlice = createSlice({
  name: "members",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export default membersSlice.reducer;
