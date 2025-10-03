import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseURl, Notes, userDetail } from './NWconfig';
import { toast } from 'react-toastify';

// export const GetuserList = createAsyncThunk(
//   'get/GetuserList',
//   async (params = {}, thunkAPI) => {
//     try {
//       const token = localStorage.getItem('token');
//       //   console.log(token, "token");

//       const response = await axios.get(
//         BaseURl + "all-security-guards",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//           }
//         }
//       );
//       //   console.log(response.data, "response");
//       if (response.status === 200) {
//         return Promise.resolve(response.data.data);
//       } else {
//         return Promise.reject("Unexpected response status");
//       }
//     } catch (error) {
//       return Promise.reject(thunkAPI.rejectWithValue(error.response?.data || error.message));
//     }
//   }
// );


// export const GetuserList = createAsyncThunk(
//   'get/GetuserList',
//   async (params = {}, thunkAPI) => {
//     try {
//       const token = localStorage.getItem('token');

//       const response = await axios.get(
//         BaseURl + "all-security-guards",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//           },
         
//                    params: {
//             page: params.page || 1,
           
//             search: params.search || "",
//             country: params.country || "",
//             state: params.state || "",
//           }// <-- pass page, search, country, state here
//         }
//       );

//       if (response.status === 200) {
//         return Promise.resolve(response.data.data); // API should return paginated array
//       } else {
//         return Promise.reject("Unexpected response status");
//       }
//     } catch (error) {
//       return Promise.reject(thunkAPI.rejectWithValue(error.response?.data || error.message));
//     }
//   }
// );


export const GetuserList = createAsyncThunk(
  'get/GetuserList',
  async (params = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');

      // Build params dynamically
      const queryParams = { page: params.page || 1, status: params.status || "None" };

      if (params.search && params.search.trim() !== "") {
        queryParams.name = params.search.trim();
      }
      if (params.country && params.country.trim() !== "") {
        queryParams.country = params.country.trim();
      }
      if (params.state && params.state.trim() !== "") {
        queryParams.state = params.state.trim();
      }

      const response = await axios.get(
        BaseURl + "all-security-guard-new",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: queryParams, // only non-empty params are sent
        }
      );

      if (response.status === 200) {
        return response.data.data; // paginated array
      } else {
        return thunkAPI.rejectWithValue("Unexpected response status");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const GetuserDetail = createAsyncThunk(
  'get/GetuserDetail',
  async ({ id }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');

      const url = new URL(BaseURl + userDetail);
      
      if (id) {
        url.searchParams.append("id", id);
      }

      // console.log(url.toString(), "📌 Final request URL");

      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        }
      });

      // console.log(response, "✅ API response");

      if (response.status === 200) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue("Unexpected response status");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const NotesDetailSubmit = createAsyncThunk(
  'get/NotesDetailSubmit',
  async (data , thunkAPI) => {
    try {
      console.log(data,"data");
      
      const token = localStorage.getItem('token');

      const url = new URL(BaseURl + Notes);

      const response = await axios.put(url,data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        }
      });

      console.log(response.data, "API response");

      if (response.status === 200) {
        toast.success(response.data.message)
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue("Unexpected response status");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const GetCountryStateApi = createAsyncThunk(
  'get/countryStateList',
  async (params = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');

      // Build the URL with optional query params
      const url = new URL(BaseURl + 'get-country-state');
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            url.searchParams.append(key, value);
          }
        });
      }

      // API request
      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.status === 200) {
        return response.data?.data || response.data; // expects { countries: [...], states: [...] }
      }

      return thunkAPI.rejectWithValue('Unexpected response status');
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
 
