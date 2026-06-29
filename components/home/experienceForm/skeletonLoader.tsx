export default function SkeletonLoader() {
  return (
    <div className="flex flex-col items-center gap-10 animate-pulse ">
      <div className="relative min-full w-70 md:w-75 lg:w-105 rounded-2xl bg-primary overflow-hidden">
        <div className="relative z-10 flex h-full flex-col justify-center gap-6 px-5 lg:px-10 py-8">
          <div className="flex justify-between items-center">
            <div className="h-5 w-12 rounded bg-dark-base/50" />
            <div className="flex flex-col items-end gap-1.5">
              <div className="h-5 w-24 rounded bg-dark-base/50" />
              <div className="h-3 w-16 rounded bg-dark-base/50" />
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-dark-base/50" />
        </div>
      </div>
      <div className="h-12 w-64 rounded-full bg-secondary/40" />
    </div>
  );
}
