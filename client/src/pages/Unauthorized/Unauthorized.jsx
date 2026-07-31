import { Link } from "../../lib/router.jsx";
import { Home, ShieldAlert } from "lucide-react";
import Button from "../../components/common/Button/Button.jsx";

const Unauthorized = () => (
  <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col items-center justify-center px-4 text-center">
    <ShieldAlert className="h-12 w-12 text-orange-500" />
    <h1 className="mt-5 text-3xl font-bold text-slate-950">Unauthorized</h1>
    <p className="mt-3 text-slate-600">Your account does not have access to this workspace.</p>
    <Button as={Link} to="/" className="mt-7">
      <Home className="h-4 w-4" />
      Go home
    </Button>
  </section>
);

export default Unauthorized;
