import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useChatScroll } from "../hooks/useChatScroll.js";
import { useSpeechPlayer } from "../hooks/useSpeechPlayer.js";
import {
  useConversationQuery,
  useDeleteConversationMutation,
  useHistoryQuery,
  useSendMessageMutation,
  useTranscribeMutation,
} from "../services/aiApi.js";
import { getApiErrorMessage } from "../../tickets/utils.js";
import ChatHeader from "./ChatHeader.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatMessage from "./ChatMessage.jsx";
import ChatSkeleton from "./ChatSkeleton.jsx";
import ConversationSidebar from "./ConversationSidebar.jsx";
import EmptyConversation from "./EmptyConversation.jsx";
import TypingAnimation from "./TypingAnimation.jsx";

const asMessage = (role, content, extras = {}) => ({
  _id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
  ...extras,
});

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const exportPdf = (messages) => {
  if (!messages.length) {
    toast.error("No messages to download");
    return;
  }

  const rows = messages
    .map(
      (message) => `
        <section class="message ${message.role}">
          <div class="role">${escapeHtml(message.role === "assistant" ? "SupportDesk AI" : "You")}</div>
          <div class="content">${escapeHtml(message.content).replaceAll("\n", "<br />")}</div>
        </section>
      `,
    )
    .join("");

  const pdfHtml = `
    <!doctype html>
    <html>
      <head>
        <title>SupportDesk AI Chat</title>
        <style>
          @page { margin: 18mm; }
          body { color: #0f172a; font-family: Arial, sans-serif; line-height: 1.5; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
          .message { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; padding: 12px; page-break-inside: avoid; }
          .assistant { background: #f8fafc; }
          .user { background: #eff6ff; }
          .role { font-size: 12px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; }
          .content { font-size: 14px; white-space: normal; }
        </style>
      </head>
      <body>
        <h1>SupportDesk AI Chat</h1>
        <div class="meta">Downloaded ${new Date().toLocaleString()}</div>
        ${rows}
      </body>
    </html>
  `;

  const existingFrame = document.getElementById("supportdesk-chat-pdf-frame");
  existingFrame?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "supportdesk-chat-pdf-frame";
  iframe.title = "SupportDesk AI Chat PDF";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  document.body.appendChild(iframe);

  const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDocument || !iframe.contentWindow) {
    iframe.remove();
    toast.error("PDF download failed");
    return;
  }

  iframeDocument.open();
  iframeDocument.write(pdfHtml);
  iframeDocument.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    toast.success("Choose Save as PDF in the print dialog");
  }, 250);
};

const ChatWindow = ({ compact = false, onClose }) => {
  const [conversationId, setConversationId] = useState(null);
  const [draft, setDraft] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const history = useHistoryQuery({ page: 1, limit: 30 });
  const conversation = useConversationQuery(conversationId, { skip: !conversationId });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [transcribe, { isLoading: isTranscribing }] = useTranscribeMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const speech = useSpeechPlayer();

  const serverMessages = conversation.data?.data?.messages || [];
  const messages = conversationId ? serverMessages : localMessages;
  const bottomRef = useChatScroll(messages.length + Number(isSending));
  const conversations = history.data?.data?.conversations || [];

  const displayMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  const send = async ({ message, attachments = [] }) => {
    const userMessage = asMessage("user", message);
    if (!conversationId) setLocalMessages((current) => [...current, userMessage]);
    setDraft("");

    try {
      const response = await sendMessage({ message, conversationId, attachments }).unwrap();
      const reply = response?.data?.reply || "I could not generate a response.";
      const nextConversationId = response?.data?.conversationId;
      if (nextConversationId) setConversationId(nextConversationId);
      if (!conversationId) setLocalMessages((current) => [...current, asMessage("assistant", reply)]);
      toast.success("AI response ready");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "AI request failed"));
    }
  };

  const transcribeAudio = async (blob) => {
    try {
      const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
      const response = await transcribe({ audio: file, conversationId }).unwrap();
      setDraft(response?.data?.transcript || "");
      toast.success("Transcript ready");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Transcription failed"));
    }
  };

  const startNew = () => {
    setConversationId(null);
    setLocalMessages([]);
    setDraft("");
    setIsHistoryOpen(false);
  };

  const removeConversation = async (item) => {
    try {
      await deleteConversation(item._id).unwrap();
      if (conversationId === item._id) startNew();
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete conversation"));
    }
  };

  const copyConversation = async () => {
    await navigator.clipboard.writeText(displayMessages.map((message) => `${message.role}: ${message.content}`).join("\n\n"));
    toast.success("Conversation copied");
  };

  return (
    <section className={`relative min-h-0 flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${compact ? "h-[min(620px,calc(100dvh-16px))] sm:h-[min(680px,calc(100vh-64px))]" : "flex-1"}`}>
      {!compact ? (
        <ConversationSidebar
          activeConversationId={conversationId}
          conversations={conversations}
          onDelete={removeConversation}
          onSelect={(item) => setConversationId(item._id)}
        />
      ) : null}
      {compact && isHistoryOpen ? (
        <>
          <button className="absolute inset-0 z-10 bg-slate-950/20" type="button" onClick={() => setIsHistoryOpen(false)} aria-label="Close previous chats" />
          <ConversationSidebar
            compact
            activeConversationId={conversationId}
            conversations={conversations}
            onClose={() => setIsHistoryOpen(false)}
            onDelete={removeConversation}
            onSelect={(item) => {
              setConversationId(item._id);
              setIsHistoryOpen(false);
            }}
          />
        </>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          compact={compact}
          onClose={onClose}
          onClear={startNew}
          onCopyConversation={copyConversation}
          onExportPdf={() => exportPdf(displayMessages)}
          onNewChat={startNew}
          onToggleHistory={() => setIsHistoryOpen((value) => !value)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">
          {conversation.isFetching ? <ChatSkeleton /> : null}
          {!conversation.isFetching && !displayMessages.length ? <EmptyConversation onSelect={(question) => send({ message: question })} /> : null}
          <div className="space-y-5">
            {displayMessages.map((message) => (
              <ChatMessage key={message._id} message={message} speech={speech} />
            ))}
            {isSending ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <TypingAnimation />
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>
        <ChatInput
          disabled={isSending}
          isTranscribing={isTranscribing}
          onChange={setDraft}
          onSend={send}
          onTranscribe={transcribeAudio}
          value={draft}
        />
      </div>
    </section>
  );
};

export default ChatWindow;
