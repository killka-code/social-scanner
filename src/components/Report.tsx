import type { AnalysisReport } from '../lib/analyzer';
import {
  TrendingUp,
  Star,
  Target,
  Clock,
  Image,
  Video,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  AlertTriangle,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface Props {
  report: AnalysisReport;
  username: string;
  profilePic?: string;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score < 40 ? '#ef4444' : score <= 70 ? '#eab308' : '#22c55e';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-white">{score}</span>
        <span className="text-[10px] text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'green' | 'red' | 'yellow' | 'blue' | 'violet' | 'gray';
}) {
  const styles: Record<string, string> = {
    green: 'bg-green-500/10 text-green-400 ring-green-500/20',
    red: 'bg-red-500/10 text-red-400 ring-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
    gray: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Star; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
      <div className="rounded-lg bg-violet-500/10 p-1.5">
        <Icon className="h-4 w-4 text-violet-400" />
      </div>
      {children}
    </h2>
  );
}

export function Report({ report, username, profilePic }: Props) {
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sortedCategories = [...report.contentCategories].sort((a, b) => b.avgEngagement - a.avgEngagement);
  const sortedRecommendations = [...report.recommendations].sort(
    (a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3),
  );

  const engagementColor =
    report.engagementRate < 1 ? 'text-red-400' : report.engagementRate <= 3 ? 'text-yellow-400' : 'text-green-400';

  const mix = report.contentMix ?? { images: 0, videos: 0, carousels: 0 };
  const total = mix.images + mix.videos + mix.carousels || 1;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-10">
      {/* Header Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          {profilePic ? (
            <img src={profilePic} alt={username} className="h-14 w-14 shrink-0 rounded-full ring-2 ring-violet-500/40 sm:h-16 sm:w-16" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl font-bold text-white sm:h-16 sm:w-16">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-white sm:text-xl">@{username}</h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Engagement:{' '}
              <span className={`font-bold ${engagementColor}`}>{report.engagementRate.toFixed(2)}%</span>
            </div>
          </div>
          <ScoreGauge score={report.overallScore} />
        </div>
        {report.summary && (
          <p className="mt-4 border-t border-gray-800/50 pt-4 text-xs leading-relaxed text-gray-400 sm:text-sm">
            {report.summary}
          </p>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Engagement */}
        <Card className="p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500 sm:text-xs">
            <Target className="h-3.5 w-3.5 text-violet-400" />
            Engagement
          </div>
          <p className={`text-xl font-extrabold sm:text-2xl ${engagementColor}`}>
            {report.engagementRate.toFixed(2)}%
          </p>
        </Card>

        {/* Posts Analyzed */}
        <Card className="p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500 sm:text-xs">
            <Star className="h-3.5 w-3.5 text-violet-400" />
            Posts analizados
          </div>
          <p className="text-xl font-extrabold text-white sm:text-2xl">{total}</p>
        </Card>

        {/* Content Mix */}
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-gray-500 sm:text-xs">
            <LayoutGrid className="h-3.5 w-3.5 text-violet-400" />
            Mix de contenido
          </div>
          <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-gray-800">
            <div className="bg-blue-500 transition-all" style={{ width: `${(mix.images / total) * 100}%` }} />
            <div className="bg-violet-500 transition-all" style={{ width: `${(mix.videos / total) * 100}%` }} />
            <div className="bg-amber-500 transition-all" style={{ width: `${(mix.carousels / total) * 100}%` }} />
          </div>
          <div className="flex gap-2 text-[10px] text-gray-500 sm:text-[11px]">
            <span className="flex items-center gap-0.5"><Image className="h-2.5 w-2.5 text-blue-400" />{mix.images}</span>
            <span className="flex items-center gap-0.5"><Video className="h-2.5 w-2.5 text-violet-400" />{mix.videos}</span>
            <span className="flex items-center gap-0.5"><LayoutGrid className="h-2.5 w-2.5 text-amber-400" />{mix.carousels}</span>
          </div>
        </Card>

        {/* Best Times */}
        <Card className="p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500 sm:text-xs">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            Mejores horarios
          </div>
          <ul className="space-y-0.5 text-xs text-gray-300 sm:text-sm">
            {report.bestPostingTimes.slice(0, 3).map((time, i) => (
              <li key={i} className="truncate">{time}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Strong & Weak Points */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Puntos fuertes
          </h3>
          <ul className="space-y-2">
            {report.strongPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-gray-300 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500/60" />
                {point}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-red-400">
            <XCircle className="h-4 w-4" />
            Areas de mejora
          </h3>
          <ul className="space-y-2">
            {report.weakPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-gray-300 sm:text-sm">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500/60" />
                {point}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Content Categories */}
      {sortedCategories.length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={LayoutGrid}>Categorias de contenido</SectionTitle>
          <div className="space-y-3">
            {sortedCategories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-b border-gray-800/30 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-[11px] text-gray-500">{cat.postCount} posts · {cat.avgEngagement.toFixed(2)}% eng.</p>
                </div>
                <Badge variant={cat.verdict === 'keep' ? 'green' : cat.verdict === 'increase' ? 'blue' : 'red'}>
                  {cat.verdict === 'keep' ? 'Mantener' : cat.verdict === 'increase' ? 'Aumentar' : 'Reducir'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Posts */}
      {report.topPosts && report.topPosts.length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={Award}>Top posts</SectionTitle>
          <div className="space-y-3">
            {report.topPosts.map((post, i) => (
              <div key={i} className="rounded-xl border border-gray-800/30 bg-gray-800/20 p-3 sm:p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <a
                    href={`https://instagram.com/p/${post.shortcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {post.shortcode}
                  </a>
                  <Badge variant={post.score >= 70 ? 'green' : post.score >= 40 ? 'yellow' : 'red'}>
                    {post.score}pts
                  </Badge>
                </div>
                {post.caption && (
                  <p className="mb-1.5 line-clamp-2 text-xs text-gray-400">{post.caption}</p>
                )}
                <p className="text-[11px] italic text-gray-500">{post.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {sortedRecommendations.length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={Lightbulb}>Recomendaciones</SectionTitle>
          <div className="space-y-3">
            {sortedRecommendations.map((rec, i) => {
              const Icon = rec.priority === 'high' ? AlertTriangle : rec.priority === 'medium' ? Zap : Lightbulb;
              const badgeVariant = rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue';

              return (
                <div key={i} className="rounded-xl border border-gray-800/30 bg-gray-800/20 p-3 sm:p-4">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-violet-400" />
                      <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                    </div>
                    <Badge variant={badgeVariant as any}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <p className="pl-6 text-xs leading-relaxed text-gray-400">{rec.description}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Footer */}
      <p className="pb-4 text-center text-[11px] text-gray-600">
        Generado por Social Scanner con IA
      </p>
    </div>
  );
}
