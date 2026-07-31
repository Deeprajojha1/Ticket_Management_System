import { Link } from "../../lib/router.jsx";
import { motion } from "framer-motion";
import { ArrowRight, Bot, CheckCircle2, Clock3, Headset, Lock, MessageSquare, ShieldCheck, TicketCheck, Users } from "lucide-react";
import Button from "../../components/common/Button/Button.jsx";

const Landing = () => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
  >
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          <ShieldCheck className="h-4 w-4" />
          Secure ticket support platform
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Resolve customer tickets faster with AI-aware support operations.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          SupportDesk AI brings customer ticket history, secure role-based workflows, file attachments, realtime replies, and AI assistance into one focused helpdesk experience.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/register" className="w-full sm:w-auto">
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as={Link} to="/login" variant="secondary" className="w-full sm:w-auto">
            Sign in
          </Button>
        </div>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
          {[
            ["24/7", "AI support"],
            ["Realtime", "Conversations"],
            ["Secure", "Cookie auth"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
              <p className="text-lg font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm font-bold text-slate-950">Support Queue</p>
            <p className="text-xs text-slate-500">Live operational view</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            connected
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Open", value: "18", icon: TicketCheck, tone: "blue" },
            { label: "Assigned", value: "12", icon: Headset, tone: "emerald" },
            { label: "SLA Risk", value: "03", icon: Clock3, tone: "amber" },
          ].map(({ icon: Icon, label, tone, value }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xl font-bold text-slate-950">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {[
            ["SD-2026-00042", "Refund not reflected after payment retry", "High", "Billing"],
            ["SD-2026-00039", "Unable to open uploaded PDF attachment", "Medium", "Technical"],
            ["SD-2026-00031", "Customer needs final resolution update", "Low", "General"],
          ].map(([id, title, priority, category]) => (
            <div key={id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-blue-700">{id}</p>
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">{category}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  routed to agent
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${priority === "High" ? "bg-red-50 text-red-700" : priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {[
        { icon: Bot, title: "Context-aware AI", text: "Answers using only the logged-in customer's recent tickets and comments." },
        { icon: MessageSquare, title: "Realtime replies", text: "Customer and agent conversations update without disruptive page reloads." },
        { icon: Lock, title: "Secure access", text: "HTTP-only cookies, role-based routing, and protected ticket attachments." },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Production-oriented
          </div>
        </div>
      ))}
    </div>
  </motion.section>
);

export default Landing;
