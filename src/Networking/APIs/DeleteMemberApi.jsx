import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BaseURl } from "./NWconfig";

// Delete member by id
export const deleteMember = createAsyncThunk(
  "members/deleteMember",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        BaseURl + `delete_member/${id}`, 
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
             Authorization: `Bearer ${token}`,
          },
        }
      );

      // Return the id so we can remove it from state
      if (response.status === 200 || response.status === 204) {
        return id;
      } else {
        return thunkAPI.rejectWithValue("Failed to delete member");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
