import axios from "axios";
import { headers } from "next/headers";
type RequestBodyType<T> = T;

export async function getData(endpoint: string) {
  return await axios
    .get(endpoint, {
      headers: {},
    })
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      throw err;
    });
}

export async function postData<T>(endpoint: string, body: RequestBodyType<T>) {
  try {
    const { data, status } = await axios.post(endpoint, body, {
      headers: {
        Accept: "application/json",
      },
    });
    return { ...data, status };
  } catch (error) {
    throw error;
  }
}

export async function updateData<T>(
  endpoint: string,
  body: RequestBodyType<T>
) {
  try {
    const { data, status } = await axios.patch(endpoint, body);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteData(endpoint: string, body: FormData | {} = {}) {
  try {
    const response = await axios.delete(endpoint, { data: body });
    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function postImage(body: FormData | {}) {
  try {
    const response = await axios.post("/v1/photo_upload", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
}
