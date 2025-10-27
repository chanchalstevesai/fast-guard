import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BaseURl } from "./NWconfig";

export const getMembers = createAsyncThunk(
  "members/getMembers",
  async (_, thunkAPI) => {
    try {
       const token = localStorage.getItem("token");
      const response = await axios.get(
        BaseURl +"/get_members",
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    //   console.log(response.data,"response data");
      return response.data.members;
      
      
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);



