import { Link } from "../../lib/router.jsx";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Lock, TicketCheck } from "lucide-react";
import Button from "../../components/common/Button/Button.jsx";
import Card from "../../components/common/Card/Card.jsx";

const Landing = () => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24"
  >
    <div className="flex flex-col justify-center">
      <span className="w-fit rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
        SupportDesk AI
      </span>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
        Customer support workflows with secure AI assistance.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
        Manage authentication, route users by role, and give teams a polished foundation for ticket support.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button as={Link} to="/register" className="w-full sm:w-auto">
          Get started <ArrowRight className="h-4 w-4" />
        </Button>
        <Button as={Link} to="/login" variant="secondary" className="w-full sm:w-auto">
          Login
        </Button>
      </div>
    </div>

    <div className="grid gap-4">
      {[
        { icon: TicketCheck, title: "Ticket Context", text: "Customer-aware support views." },
        { icon: Bot, title: "AI Ready", text: "Prepared for Gemini-powered assistance." },
        { icon: Lock, title: "Cookie Auth", text: "HTTP-only cookie flow with protected routes." },
      ].map(({ icon: Icon, title, text }) => (
        <Card key={title} className="p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </motion.section>
);

export default Landing;
