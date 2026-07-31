import AIAvatar from "./AIAvatar.jsx";
import SuggestedQuestions from "./SuggestedQuestions.jsx";

const EmptyConversation = ({ onSelect }) => (
  <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
    <AIAvatar />
    <h2 className="mt-4 text-2xl font-bold text-slate-950">How can I help with your support tickets?</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">
      Ask about your latest ticket, open issues, refunds, uploads, account help, or support workflows.
    </p>
    <div className="mt-6 w-full">
      <SuggestedQuestions onSelect={onSelect} />
    </div>
  </div>
);

export default EmptyConversation;
