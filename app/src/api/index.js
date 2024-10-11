import axios from "axios";
import { BASE_URL } from "@/constants/index";

axios.defaults.baseURL = BASE_URL;

axios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  function (response) {
    return response?.data;
  },
  function (err) {
    return Promise.reject(err);
  }
);

export default {
  get: function (url, params) {
    return new Promise((resolve, reject) => {
      try {
        const res = axios.get(url, {
          params,
        });
        resolve(res);
      } catch (err) {
        reject(err.data);
      }
    });
  },
  post: function (url, params) {
    return new Promise((resolve, reject) => {
      try {
        const res = axios.post(url, params);
        resolve(res);
      } catch (err) {
        reject(err.data);
      }
    });
  },
  put: function (url, params) {
    return new Promise((resolve, reject) => {
      try {
        const res = axios.put(url, params);
        resolve(res);
      } catch (err) {
        reject(err.data);
      }
    });
  },
  delete: function (url) {
    return new Promise((resolve, reject) => {
      try {
        const res = axios.delete(url);
        resolve(res);
      } catch (err) {
        reject(err.data);
      }
    });
  },
};
