import { createSlice } from '@reduxjs/toolkit';
import { submitForm } from '../APIs/ResgistrationFormApi';

const formSlice = createSlice({
    name: 'formSlice',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(submitForm.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(submitForm.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            // console.log(state.data, "state.data");

        })
        builder.addCase(submitForm.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default formSlice.reducer;
