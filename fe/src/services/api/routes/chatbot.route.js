import api from "../axios";

export const askChatbot = async ({ message, history = [] }) => {
  const response = await api.post("/chatbot/ask", { message, history });
  return response.data;
};
