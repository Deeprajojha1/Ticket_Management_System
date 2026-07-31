import { useSelector } from "react-redux";
import { selectAuth } from "../features/auth/authSlice.js";

export const useAuth = () => useSelector(selectAuth);
