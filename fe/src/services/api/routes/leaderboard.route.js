import api from "../axios";

export const getLeaderboard = async (params = {}) => {
  const response = await api.get("/leaderboard", { params });
  return response.data;
};

export const getWilayahLeaderboard = async () => {
  const response = await api.get("/leaderboard/wilayah");
  return response.data;
};
