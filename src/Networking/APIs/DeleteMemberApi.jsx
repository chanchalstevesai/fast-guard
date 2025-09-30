import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Delete member by id
export const deleteMember = createAsyncThunk(
  "members/deleteMember",
  async (id, thunkAPI) => {
    try {
      const response = await axios.delete(
        `https://f0b8191f1575.ngrok-free.app/delete_member/${id}`, // adjust your endpoint
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
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
