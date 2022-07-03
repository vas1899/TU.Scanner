import axios, { AxiosError, AxiosResponse } from "axios";
import { Packet } from "../models/Packet";

axios.defaults.baseURL = "http://localhost:5000/api";
// axios.defaults.baseURL = "http://192.168.100.4:5000/api";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

axios.interceptors.response.use(
  async (response) => {
    await sleep(0);
    return response;
  },
  (error: AxiosError) => {
    const { data, status, config }: any = error.response!;
    switch (status) {
      case 400:
        if (config.method === "get" && data.errors.hasOwnProperty("id")) {
          // history.push("/not-found");
        }
        if (data.errors) {
          const modalStateErrors = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modalStateErrors.push(data.errors[key]);
            }
          }
          console.log(data);
          throw modalStateErrors.flat();
        } else {
          console.log(data);

          // console.log(data);
        }
        break;
      case 401:
        console.log("unauthorised");
        break;
      case 404:
        console.log("not found");
        // history.push("/not_found");
        break;
      case 500:
        console.log("server error");
        break;
    }
    return Promise.reject(error);
  }
);
const responceBody = (response: AxiosResponse) => response.data;
const requests = {
  get: <T>(url: string) => axios.get<T>(url).then(responceBody),
  post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responceBody),
  put: <T>(url: string) => axios.put<T>(url).then(responceBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responceBody),
};

const Packets = {
  update: (id: string) => requests.put(`/packets/markDelivered/${id}`),
  list: () => requests.get<Packet>("/packets"),
};

const agent = {
  Packets,
};

export default agent;
