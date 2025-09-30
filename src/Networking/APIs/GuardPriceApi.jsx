import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseURl, Guardprice, UpdateGuardPrice } from './NWconfig';


export const guardPriceList = createAsyncThunk(
    'get/guardPriceList',
    async (thunkAPI) => {
        try {
            const token = localStorage.getItem('token');

            const url = new URL(BaseURl + Guardprice);

            const response = await axios.get(url.toString(), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                }
            });
            console.log(response.data, "response.data in gaud price");

            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);



export const updateGuardPrice = createAsyncThunk(
    'updateGuardPrice',
    async (data , thunkAPI) => {
        try {
            const token = localStorage.getItem('token');

            const url = new URL(BaseURl + UpdateGuardPrice);

            const response = await axios.put(url, data,{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                }
            });
            console.log(response.data, "response.data in gaud price");

            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);
