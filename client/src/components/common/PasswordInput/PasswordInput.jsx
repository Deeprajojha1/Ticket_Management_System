import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../Input/Input.jsx";

const PasswordInput = ({ id, label, error, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        label={label}
        error={error}
        type={isVisible ? "text" : "password"}
        className="pr-11"
        {...props}
      />
      <button
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="focus-ring absolute right-2 top-8 rounded-md p-2 text-slate-500 hover:bg-slate-100"
        onClick={() => setIsVisible((value) => !value)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;
