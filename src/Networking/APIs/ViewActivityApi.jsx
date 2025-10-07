
import axios from "axios";
import { BaseURl } from "./NWconfig";

export const viewMemberActivity = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    // Get email from filters or Redux store
    const email = filters.email || Store.getState().usermail.selectedEmail;

    // Build query params dynamically
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (filters.status) params.append("status", filters.status);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);

    const response = await axios.get(
      `${BaseURl}members-activity?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

