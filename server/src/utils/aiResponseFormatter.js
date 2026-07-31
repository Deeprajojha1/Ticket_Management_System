export const formatAIReply = (rawReply) => {
  const reply = String(rawReply || "").trim();

  if (!reply) {
    return "I could not generate a response right now. Please try again or create a support ticket.";
  }

  return reply.replace(/\n{3,}/g, "\n\n");
};

export const attachmentSummary = (attachments = []) =>
  attachments
    .map((attachment) => `${attachment.originalName} (${attachment.mimeType}, ${attachment.size} bytes)`)
    .join("; ");
