import axios from 'axios';
import { BaseURl } from './NWconfig';

export const resetPasswordRequest = async ({ email, old_password, new_password }) => {
  const token = localStorage.getItem('token');
  const url = BaseURl + 'reset_password';
  const headers = {
    'ngrok-skip-browser-warning': 'true',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return axios.post(url, { email, old_password, new_password }, { headers });
};


