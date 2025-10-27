import { createSlice } from '@reduxjs/toolkit';
import { ApprovedList, ApprovedSubmitApi, DeclineList } from '../APIs/ApprovedApi';

const ApprovedSlice = createSlice({
    name: 'ApprovedSlice',
    initialState: {
        loading: false,
        ApprovedData: null,
        Approvedlist: '',
        Declinelist: '',
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(ApprovedSubmitApi.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(ApprovedSubmitApi.fulfilled, (state, action) => {
            state.loading = false;
            state.ApprovedData = action.payload;
            // console.log(state.ApprovedData, " state.ApprovedData ");

        })
        builder.addCase(ApprovedSubmitApi.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(ApprovedList.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(ApprovedList.fulfilled, (state, action) => {
            state.loading = false;
            state.Approvedlist = action.payload;
            // console.log(state.Approvedlist, " state.Approvedlist");

        })
        builder.addCase(ApprovedList.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(DeclineList.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(DeclineList.fulfilled, (state, action) => {
            state.loading = false;
            state.Declinelist = action.payload;
            // console.log(state.Approvedlist, " state.Approvedlist");

        })
        builder.addCase(DeclineList.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default ApprovedSlice.reducer;
