import { createSlice } from "@reduxjs/toolkit";
import { deleteMember } from "../../Networking/APIs/DeleteMemberApi";
const deleteMemberSlice = createSlice({
  name: "deleteMember",
  initialState: { loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default deleteMemberSlice.reducer;