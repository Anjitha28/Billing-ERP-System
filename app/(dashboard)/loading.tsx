export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full h-full p-8 flex flex-col items-center justify-center animate-pulse min-h-[500px]">
      <div className="w-12 h-12 border-4 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin mb-4"></div>
      <h2 className="text-lg font-medium text-theme-text-muted">Loading section...</h2>
    </div>
  );
}
