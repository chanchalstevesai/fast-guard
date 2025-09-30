import { createSlice } from '@reduxjs/toolkit';
import { GetuserDetail, GetuserList } from '../APIs/UserGetDetails';

const userListSlice = createSlice({
  name: 'userListSlice',
  initialState: {
    data: [],
    userData: {},
    loading: false,
    error: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(GetuserList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetuserList.fulfilled, (state, action) => {
        state.loading = false;
        state.data= action.payload;
        // console.log(state.data, "action.payload");

      })
      .addCase(GetuserList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
    builder
      .addCase(GetuserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetuserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        // console.log(state.userData, "userData slice");

      })
      .addCase(GetuserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default userListSlice.reducer;
