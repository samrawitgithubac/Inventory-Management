export default function DashboardSkeleton() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card-surface p-6">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mt-4 h-9 w-32" />
            <div className="skeleton mt-3 h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card-surface h-80 p-6">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton mt-6 h-56 w-full rounded-xl" />
        </div>
        <div className="card-surface h-80 p-6">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton mt-6 h-56 w-full rounded-xl" />
        </div>
      </div>
      <div className="card-surface p-6">
        <div className="skeleton h-5 w-36" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
