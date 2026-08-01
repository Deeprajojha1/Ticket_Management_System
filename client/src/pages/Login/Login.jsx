import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "../../lib/router.jsx";
import { z } from "zod";
import Button from "../../components/common/Button/Button.jsx";
import Card from "../../components/common/Card/Card.jsx";
import Input from "../../components/common/Input/Input.jsx";
import PasswordInput from "../../components/common/PasswordInput/PasswordInput.jsx";
import { roleHomePath } from "../../constants/auth.js";
import { setCredentials } from "../../features/auth/authSlice.js";
import { useDispatch } from "react-redux";
import { authApi, useLoginMutation } from "../../app/services/authApi.js";
import { dashboardApi } from "../../features/agent/services/dashboardApi.js";
import { ticketApi } from "../../features/tickets/services/ticketApi.js";
import { aiApi } from "../../features/ai/services/aiApi.js";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const getErrorMessage = (error) =>
  error?.data?.message || error?.data?.errors?.[0]?.msg || "Login failed";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await login({ email, password }).unwrap();
      const user = response?.data?.user;
      dispatch(authApi.util.resetApiState());
      dispatch(ticketApi.util.resetApiState());
      dispatch(dashboardApi.util.resetApiState());
      dispatch(aiApi.util.resetApiState());
      dispatch(setCredentials(user));
      toast.success(response?.message || "Logged in successfully");
      navigate(roleHomePath[user?.role] || "/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to continue to SupportDesk AI.</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                {...register("remember")}
              />
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">
            Create an account
          </Link>
        </p>
      </Card>
    </motion.section>
  );
};

export default Login;
