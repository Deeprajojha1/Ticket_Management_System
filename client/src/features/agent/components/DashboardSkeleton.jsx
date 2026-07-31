const DashboardSkeleton = () => (
  <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white p-5">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-5 h-8 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
  </div>
);

export default DashboardSkeleton;
