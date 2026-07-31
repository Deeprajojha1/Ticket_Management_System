import { SUGGESTIONS } from "../constants.js";

const SuggestedQuestions = ({ onSelect }) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {SUGGESTIONS.map((question) => (
      <button
        key={question}
        className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"
        onClick={() => onSelect(question)}
      >
        {question}
      </button>
    ))}
  </div>
);

export default SuggestedQuestions;
