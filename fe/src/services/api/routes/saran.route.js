import api from "../axios";

export const kirimSaran = async ({ nama, email, pesan }) => {
  const response = await api.post("/saran", { nama, email, pesan });
  return response.data;
};

// Khusus admin.
export const getSaran = async () => {
  const response = await api.get("/saran");
  return response.data;
};
