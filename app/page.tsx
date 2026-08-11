import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-surface-hover">
      <div className="max-w-md w-full bg-theme-surface rounded-xl shadow-lg p-8 text-center space-y-6 border border-theme-border">
        <div className="mx-auto w-16 h-16 bg-theme-surface-hover rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Billing ERP System</h1>
          <p className="text-theme-text-muted mt-2">Welcome to your new enterprise resource planning application.</p>
        </div>

        <div className="pt-4 border-t border-theme-border">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary transition-colors"
          >
            Enter Application
          </Link>
        </div>
      </div>
    </div>
  );
}
