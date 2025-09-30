import { createSlice } from '@reduxjs/toolkit';
import { LoginSubmit } from '../APIs/LoginApi';

const loginSlice = createSlice({
    name: 'loginSlice',
    initialState: {
        loading: false,
        Athorization: null,
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(LoginSubmit.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(LoginSubmit.fulfilled, (state, action) => {
            state.loading = false;
            state.Athorization = action.payload;

        })
        builder.addCase(LoginSubmit.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default loginSlice.reducer;
