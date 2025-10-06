
import axios from "axios";
import { BaseURl } from "./NWconfig";

export const viewMemberActivity = async (filters = {}) => {
    try {
        const token = localStorage.getItem("token");
        const today = new Date().toISOString().split("T")[0];
        const date_from = filters.date_from || today;
        const date_to = filters.date_to || today;

        // Build query params
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        params.append("date_from", date_from);
        params.append("date_to", date_to);

        const response = await axios.get(`${BaseURl}/members-activity?${params.toString()}`, {
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
