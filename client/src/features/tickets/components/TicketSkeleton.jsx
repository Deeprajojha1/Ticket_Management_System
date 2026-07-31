const TicketSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
        <div className="h-4 w-1/4 rounded bg-slate-200" />
        <div className="mt-4 h-3 w-3/4 rounded bg-slate-200" />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
);

export default TicketSkeleton;
