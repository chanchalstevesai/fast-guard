//http://localhost:5000/members-activity?email=user@example.com&status=approved&date_from=2025-09-01&date_to=2025-09-30

//https://98a1e1c0677b.ngrok-free.app//members-activity?email=test1%40gmail.com&status=approved&date_from=2025-09-26&date_to=2025-10-02

import axios from "axios";
import { BaseURl } from "./NWconfig";


export const viewMemberActivity = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split("T")[0];
    const date_from = filters.date_from || today;
    const date_to = filters.date_to || today;
    const email = filters.email || store.getState().usermail.selectedEmail;

    // Build query params
    const params = new URLSearchParams();
     if (email) params.append("email", email);
    if (filters.status) params.append("status", filters.status);
    params.append("date_from", date_from);
    params.append("date_to", date_to);

    const response = await axios.get(`${BaseURl}members-activity?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API response:", response.data);
     return {
      members: response.data.data || [],
      totalGuards: response.data.total_guards || 0,
    };
  } catch (error) {
    console.error("Error fetching member activity:", error);
    throw error;
  }
};
