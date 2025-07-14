import axios from "axios";

export async function get(endPoint, token, params = {}) {
  return await axios.get(endPoint, {
    params: params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function post(endPoint, params, token) {
  return await axios.post(endPoint, params, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
