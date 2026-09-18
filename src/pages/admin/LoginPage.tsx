import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { authErrorMessage, requestPasswordReset, signIn, useAuth } from '../../lib/auth';
import { MindAlnoorLogo } from '../../components/MindAlnoorLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  useEffect(() => {
    if (!loading && isAdmin) navigate(from, { replace: true });
  }, [loading, isAdmin, from, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      // useAuth effect above will redirect once admin status resolves.
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const signedInNotAdmin = !loading && user && !isAdmin;

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then click "Forgot password?".');
      return;
    }
    setError('');
    setResetStatus('sending');
    try {
      await requestPasswordReset(email);
    } catch {
      // Firebase intentionally doesn't reveal whether the email exists.
    } finally {
      setResetStatus('sent');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center gap-3">
          <MindAlnoorLogo className="w-9 h-9" />
          <div>
            <h1 className="font-bold text-base">Staff sign in</h1>
            <p className="text-xs text-slate-400">Product & catalog management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {error}
            </p>
          )}
          {signedInNotAdmin && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              You are signed in as {user?.email}, but this account is not an administrator. Ask an
              existing admin to add your user ID to the <code>admins</code> collection.
            </p>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</span>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Sign in</span>
          </button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setShowReset((v) => !v);
                setResetStatus('idle');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-teal-700 transition cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {showReset && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {resetStatus === 'sent' ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    If <strong>{email}</strong> has an account, a reset link was just emailed to it.
                    Check your inbox (and spam folder).
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetStatus === 'sending'}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                >
                  {resetStatus === 'sending' ? 'Sending reset email…' : `Send reset email to ${email || 'your address'}`}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
