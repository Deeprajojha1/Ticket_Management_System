import { Link } from "../../lib/router.jsx";
import Button from "../../components/common/Button/Button.jsx";

const NotFound = () => (
  <section className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <p className="text-sm font-semibold text-blue-700">404</p>
    <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
    <p className="mt-3 text-slate-600">The page you requested does not exist.</p>
    <Button as={Link} to="/" className="mt-7">
      Go home
    </Button>
  </section>
);

export default NotFound;
