import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseURl, submitRegistration } from './NWconfig';

export const submitForm = createAsyncThunk(
    'form/submitForm',
    async (post, { rejectWithValue }) => {
        try {
            const url = BaseURl + submitRegistration;
            const response = await axios.post(url, post, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
