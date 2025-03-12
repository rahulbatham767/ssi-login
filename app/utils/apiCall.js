import axios from "axios";
import toast from "react-hot-toast";

const apiCall = async (baseUrl, method, endpoint, data = null) => {
  try {
    const response = await axios[method](`${baseUrl}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);

    if (!error.response) {
      // Handle network errors (ECONNREFUSED, server down, etc.)
      toast.error(
        "Cannot connect to the server. Please check your network or server status."
      );
    } else {
      // Handle API-specific errors
      toast.error(error.response?.data?.message || "Something went wrong.");
    }

    throw new Error(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
};

export default apiCall;

export const checkCredential = async () => {
  const response = await apiCall(
    process.env.NEXT_PUBLIC_HOLDER_ENDPOINT,
    "get",
    "/credentials"
  );
  const token = response.results.map((result) => result.attrs.credentialIssuer);

  console.log(token);
};
