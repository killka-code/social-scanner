import { useState, useEffect } from 'react';
import {
  Instagram,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Report } from './Report';
import type { AnalysisReport } from '../lib/analyzer';

const STATUS_MESSAGES = [
  'Obteniendo perfil y posts...',
  'Procesando datos de Instagram...',
  'Analizando contenido con IA...',
  'Generando reporte...',
];

export function ScanForm() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [analyzedUsername, setAnalyzedUsername] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);
    setProfilePic(undefined);
    setAnalyzedUsername('');

    if (!username.trim()) {
      setError('Ingresa un nombre de usuario.');
      return;
    }

    setLoading(true);
    setStatusIndex(0);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().replace(/^@/, ''),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      setReport(data.report);
      setProfilePic(data.profile?.profilePicUrl);
      setAnalyzedUsername(data.profile?.username || username.trim());
    } catch (err: any) {
      setError(err.message || 'Ocurrio un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero / Form Section */}
      <div className="relative overflow-hidden">
        {/* Gradient background orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-fuchsia-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-lg px-5 pb-8 pt-12 sm:pt-20">
          {/* Logo & Title */}
          <div className="mb-8 text-center sm:mb-10">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-violet-500/10 p-3 ring-1 ring-violet-500/20">
              <Instagram className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Social Scanner
            </h1>
            <p className="text-sm text-gray-400 sm:text-base">
              Analiza tu cuenta de Instagram y mejora tu estrategia de contenido
            </p>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            <div className="overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/50 backdrop-blur-sm">
              <div className="p-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Usuario de Instagram
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-violet-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nombre_de_usuario"
                    disabled={loading}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 py-3 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="border-t border-gray-800/40 bg-gray-900/30 p-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="animate-pulse">
                        {STATUS_MESSAGES[statusIndex]}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analizar cuenta
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </form>

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-6 space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-gray-900/50" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 animate-pulse rounded-2xl bg-gray-900/50" />
                <div className="h-24 animate-pulse rounded-2xl bg-gray-900/50" />
              </div>
              <div className="h-48 animate-pulse rounded-2xl bg-gray-900/50" />
            </div>
          )}
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className="border-t border-gray-800/40">
          <Report report={report} username={analyzedUsername} profilePic={profilePic} />
        </div>
      )}
    </div>
  );
}
