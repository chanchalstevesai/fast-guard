import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BaseURl } from "./NWconfig";

export const signupUser = createAsyncThunk(
  "signup/signupUser",
  async (userData, thunkAPI) => {
    try {
      
      const response = await axios.post(
        BaseURl +  "/add_member",
        { ...userData, role: "member" },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue("Unexpected response status");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
