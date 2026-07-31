import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "../../lib/router.jsx";
import { z } from "zod";
import { useRegisterMutation } from "../../app/services/authApi.js";
import Button from "../../components/common/Button/Button.jsx";
import Card from "../../components/common/Card/Card.jsx";
import Input from "../../components/common/Input/Input.jsx";
import PasswordInput from "../../components/common/PasswordInput/PasswordInput.jsx";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/, "Password must contain a special character");

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(80, "Full name is too long"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const getErrorMessage = (error) =>
  error?.data?.message || error?.data?.errors?.[0]?.msg || "Registration failed";

const Register = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formValues) => {
    const payload = {
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      password: formValues.password,
    };

    try {
      const response = await registerUser(payload).unwrap();
      toast.success(response?.message || "Account created successfully");
      navigate("/login", { replace: true });
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
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Start with secure cookie-based authentication.</p>
        </div>
        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Input id="fullName" label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
          <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input id="phone" label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            Customer accounts can be created here. Agent access is provisioned by the support team.
          </div>
          <PasswordInput id="password" label="Password" error={errors.password?.message} {...register("password")} />
          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Register
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Login
          </Link>
        </p>
      </Card>
    </motion.section>
  );
};

export default Register;
