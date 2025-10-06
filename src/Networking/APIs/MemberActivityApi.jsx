import axios from "axios";
import { BaseURl } from "./NWconfig";

export const memberActivity = async () => {
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
   
    return response.data.members;
  } catch (error) {
    console.error("Error fetching member activity:", error);
    throw error;
  }
};
