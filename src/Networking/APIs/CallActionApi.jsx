import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BaseURl } from "./NWconfig";

const API_URL = `${BaseURl.replace(/\/$/, "")}/call-actions`;

/**
 * ✅ POST → Add new Call Action
 * @param payload = { attempt, time, status }
 */
export const addCallAction = createAsyncThunk(
  "callAction/add",
  async (payload, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("Authentication token missing");
      }

      const response = await axios.post(API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`, // ✅ Bearer token added
        },
      });

      return response.data;
    } catch (error) {
      console.error("Add Call Action Error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ✅ GET → Fetch all Call Actions
 */
export const getCallActions = createAsyncThunk(
  "callAction/getByGuard",
  async (guardId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("Authentication token missing");
      }

      const response = await axios.get(`${API_URL}/${guardId}`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`, // ✅ Bearer token added
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get Call Actions Error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
