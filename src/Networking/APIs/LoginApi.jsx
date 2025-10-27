import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseURl, Login } from './NWconfig';
import { toast } from 'react-toastify';
import { Toast } from 'bootstrap';

export const LoginSubmit = createAsyncThunk(
  'auth/LoginSubmit',
  async (credentials) => {
    try {
      const url = `${BaseURl}/${Login}`;
      const response = await axios.post(url, credentials);
      if (response.status === 200) {
        const token = response.data?.access_token;
        // console.log(token, "token");

        if (token) {
          localStorage.setItem('token', token);
          console.log(response.data);
          localStorage.setItem("role", response.data.role);
          toast.success(response.data.message);
          return Promise.resolve(response.data);
        } else {
          // console.log("failed");
          return Promise.reject('Token not found in response');
        }
      }
    } catch (error) {
      toast.error(error.response.data.msg)
      throw error;
    }
  }
);
