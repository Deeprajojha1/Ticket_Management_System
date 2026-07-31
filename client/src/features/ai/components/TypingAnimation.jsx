const TypingAnimation = ({ label = "Thinking" }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <span>{label}</span>
    <span className="flex gap-1">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
      ))}
    </span>
  </div>
);

export default TypingAnimation;
