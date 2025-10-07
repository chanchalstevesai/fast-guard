import axios from "axios";
import { BaseURl } from "./NWconfig";

export const getTokenData = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURl}/get_zoho_keys`, {
            headers: {
              
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",   
                Authorization: `Bearer ${token}`,    
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching token data:", error);
        throw error;
    }
};


// export const generateTokenData = async () => {
//     try {
//         const token = localStorage.getItem("token");
//         const response = await axios.post(`${BaseURl}generate_token`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//                 "ngrok-skip-browser-warning": "true",       
//             },
//         });
        
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching token data:", error);
//         throw error;
//     }
// };


// export const generateTokenData = async ({ clientId, clientSecret, authorization }) => {
//   try {
//     const token = localStorage.getItem("token");

//     const response = await axios.post(
//       `${BaseURl}generate_token`,
//       {
//         client_id: clientId,
//         client_secret: clientSecret,
//         authorization: authorization,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           "ngrok-skip-browser-warning": "true",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Error generating token:", error.response || error);
//     throw error;
//   }
// };




export const generateTokenData = async ({ clientId, clientSecret, authorizationCode }) => {
  try {
    const token = localStorage.getItem("token"); // your auth token

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      authorization_code: authorizationCode,
    };
    console.log(payload,"payload");
    

    const response = await axios.post(`${BaseURl}generate_token`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating token:", error.response || error);
    throw error;
  }
};
