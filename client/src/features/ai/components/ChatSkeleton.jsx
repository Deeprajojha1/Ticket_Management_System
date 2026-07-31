const ChatSkeleton = () => (
  <div className="space-y-4 p-5">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className={`flex animate-pulse ${index % 2 ? "justify-end" : "justify-start"}`}>
        <div className="h-20 w-2/3 rounded-2xl bg-slate-200" />
      </div>
    ))}
  </div>
);

export default ChatSkeleton;
