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

const exportMarkdown = (messages) => {
  const markdown = messages.map((message) => `## ${message.role}\n\n${message.content}`).join("\n\n");
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "supportdesk-ai-chat.md";
  link.click();
  URL.revokeObjectURL(url);
};

const ChatWindow = ({ compact = false }) => {
  const [conversationId, setConversationId] = useState(null);
  const [draft, setDraft] = useState("");
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
    <section className={`flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${compact ? "h-[min(720px,calc(100vh-96px))]" : "h-[calc(100vh-140px)]"}`}>
      {!compact ? (
        <ConversationSidebar
          activeConversationId={conversationId}
          conversations={conversations}
          onDelete={removeConversation}
          onSelect={(item) => setConversationId(item._id)}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onClear={startNew}
          onCopyConversation={copyConversation}
          onExportMarkdown={() => exportMarkdown(displayMessages)}
          onNewChat={startNew}
        />
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
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
