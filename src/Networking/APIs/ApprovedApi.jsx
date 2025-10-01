import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Approved_Decline_list, Approvedsubmit, BaseURl, Delete_Not_Aprroved, GetCountryState } from './NWconfig';

export const ApprovedSubmitApi = createAsyncThunk(
  'form/ApprovedSubmit',
  async (post, { rejectWithValue }) => {
    // console.log(post, "post api data approved1111111111");

    try {
      const token = localStorage.getItem('token');

      const url = BaseURl + Approvedsubmit;
      // console.log(url, "url approved111111111");

      const response = await axios.post(url, post, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        }
      });
      // console.log(response, "response approved11111111111111");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const ApprovedList = createAsyncThunk(
  'get/ApprovedList',
  async ({ params }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');

      const url = new URL(BaseURl + Approved_Decline_list);
      
      if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      }

      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        }
      });

      if (response.status === 200) {
        return {
          data: response.data.data,      // list of guards
          pagination: response.data.meta || {}, // include pagination info if API provides
        };
      } else {
        return thunkAPI.rejectWithValue("Unexpected response status");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const DeclineList = createAsyncThunk(
  'get/DeclineList',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      //   console.log(token, "token");

      const response = await axios.get(
        BaseURl + "all-security-guards",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          }
        }
      );

      //   console.log(response.data, "response");
      if (response.status === 200) {
        return Promise.resolve(response.data.data);
      } else {
        return Promise.reject("Unexpected response status");
      }
    } catch (error) {
      return Promise.reject(thunkAPI.rejectWithValue(error.response?.data || error.message));
    }
  }
);


export const DeleteUserApi = createAsyncThunk(
  'DeleteUserApi',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BaseURl}${Delete_Not_Aprroved}?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.status === 200) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue('Unexpected response status');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

