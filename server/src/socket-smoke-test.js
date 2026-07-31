import "dotenv/config";
import { io as Client } from "socket.io-client";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import User from "./models/User.model.js";
import Ticket from "./models/Ticket.model.js";
import Comment from "./models/Comment.model.js";
import Counter from "./models/Counter.model.js";
import { loginUser } from "./services/auth.service.js";
import { createTicket } from "./services/ticket.service.js";
import { initializeSocket } from "./socket/socket.js";
import { SOCKET_EVENTS } from "./socket/socketConstants.js";
import { USER_ROLES } from "./utils/constants.js";

const port = process.env.SOCKET_SMOKE_TEST_PORT || 5065;
const stamp = Date.now();

let server;
let customer;
let agent;

const createMockResponse = () => {
  const cookies = [];

  return {
    cookie(name, value) {
      cookies.push(`${name}=${encodeURIComponent(value)}`);
      return this;
    },
    getCookieHeader() {
      return cookies.join("; ");
    },
  };
};

const waitForEvent = (socket, event, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeoutMs);

    socket.once(event, (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });

try {
  await connectDatabase();

  customer = await User.create({
    fullName: "Socket Smoke Customer",
    email: `socket-customer-${stamp}@example.com`,
    password: "SmokeTest1!",
    role: USER_ROLES.CUSTOMER,
  });

  agent = await User.create({
    fullName: "Socket Smoke Agent",
    email: `socket-agent-${stamp}@example.com`,
    password: "SmokeTest1!",
    role: USER_ROLES.AGENT,
  });

  const ticket = await createTicket({
    payload: {
      title: "Socket smoke verification",
      description: "This ticket validates authenticated socket room behavior.",
      category: "Technical",
      priority: "Medium",
      tags: ["socket"],
    },
    files: [],
    user: customer,
  });

  const customerRes = createMockResponse();
  const agentRes = createMockResponse();
  await loginUser({ email: customer.email, password: "SmokeTest1!" }, customerRes);
  await loginUser({ email: agent.email, password: "SmokeTest1!" }, agentRes);

  server = app.listen(port);
  initializeSocket(server);

  const customerSocket = Client(`http://127.0.0.1:${port}`, {
    extraHeaders: { Cookie: customerRes.getCookieHeader() },
    transports: ["websocket"],
  });

  const agentSocket = Client(`http://127.0.0.1:${port}`, {
    extraHeaders: { Cookie: agentRes.getCookieHeader() },
    transports: ["websocket"],
  });

  await Promise.all([
    waitForEvent(customerSocket, "connect"),
    waitForEvent(agentSocket, "connect"),
  ]);

  customerSocket.emit(SOCKET_EVENTS.JOIN_TICKET, { ticketId: ticket._id.toString() });
  agentSocket.emit(SOCKET_EVENTS.JOIN_TICKET, { ticketId: ticket._id.toString() });

  await new Promise((resolve) => setTimeout(resolve, 300));

  const typingPromise = waitForEvent(customerSocket, SOCKET_EVENTS.TYPING);
  agentSocket.emit(SOCKET_EVENTS.TYPING_START, { ticketId: ticket._id.toString() });
  const typingPayload = await typingPromise;

  customerSocket.disconnect();
  agentSocket.disconnect();

  console.log("Socket smoke test passed");
  console.log(JSON.stringify({
    ticketId: ticket._id,
    typingReceived: typingPayload.isTyping === true,
    typingUserRole: typingPayload.user.role,
  }));
} finally {
  if (customer || agent) {
    const ids = [customer?._id, agent?._id].filter(Boolean);
    await Comment.deleteMany({ user: { $in: ids } });
    await Ticket.deleteMany({ createdBy: customer?._id });
    await User.deleteMany({ _id: { $in: ids } });
  }

  const count2026 = await Ticket.countDocuments({ ticketNumber: /^SD-2026-/ });
  if (count2026 === 0) {
    await Counter.deleteOne({ key: "ticket-2026" });
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.connection.close(false);
}
