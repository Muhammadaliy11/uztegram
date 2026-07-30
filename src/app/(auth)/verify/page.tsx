import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Check your email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            A sign-in link has been sent to your email address. Click the link in the email to
            complete your sign-in.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Didn&apos;t receive an email? Check your spam folder or{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline"
            >
              try again
            </Link>
            .
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
