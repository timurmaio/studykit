import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../../config";

interface AnalyticsSummary {
  totalParticipants: number;
  totalContent: number;
  totalProblems: number;
  avgProgressPercent: number;
  avgProblemsSolved: number;
}

interface AnalyticsParticipant {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  progressPercent: number;
  solvedProblems: number;
  totalProblems: number;
}

interface AnalyticsResponse {
  data: {
    courseTitle: string;
    summary: AnalyticsSummary;
    participants: AnalyticsParticipant[];
  };
}

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

function formatName(p: AnalyticsParticipant): string {
  const first = p.firstName?.trim() || "";
  const last = p.lastName?.trim() || "";
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return p.email ?? `Участник #${p.userId}`;
}

export function CourseAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState<AnalyticsResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    apiGet<AnalyticsResponse>(`/api/courses/${id}/analytics`)
      .then((res) => setData(res.data))
      .catch(() => setError("Не удалось загрузить аналитику"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-[var(--color-text-muted)]">Загрузка аналитики...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        {error && <div className="alert alert-warning mb-6">{error}</div>}
        <Link to={id ? `/courses/${id}` : "/teaching"} className="button button--ghost">
          <ArrowLeftIcon />
          Назад к курсу
        </Link>
      </div>
    );
  }

  const { courseTitle, summary, participants } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 analytics-page">
      <Link to={id ? `/courses/${id}` : "/teaching"} className="button button--ghost mb-6 inline-flex items-center gap-2">
        <ArrowLeftIcon />
        Назад к курсу
      </Link>

      <h1 className="text-2xl font-bold mb-2">{courseTitle}</h1>
      <p className="text-[var(--color-text-muted)] mb-8">Аналитика по участникам курса</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
            <UsersIcon />
            <span className="text-sm">Участников</span>
          </div>
          <p className="text-2xl font-semibold">{summary.totalParticipants}</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
            <BookIcon />
            <span className="text-sm">Уроков в курсе</span>
          </div>
          <p className="text-2xl font-semibold">{summary.totalContent}</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
            <ChartIcon />
            <span className="text-sm">Средний прогресс</span>
          </div>
          <p className="text-2xl font-semibold">{summary.avgProgressPercent}%</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
            <ChartIcon />
            <span className="text-sm">Задач в курсе</span>
          </div>
          <p className="text-2xl font-semibold">{summary.totalProblems}</p>
        </div>
      </div>

      {/* Participants table */}
      <div className="panel overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-[var(--color-border)]">Участники</h2>
        {participants.length === 0 ? (
          <p className="p-6 text-[var(--color-text-muted)]">Пока нет участников курса</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-4 font-medium">Участник</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Прогресс</th>
                  <th className="py-3 px-4 font-medium">Решено задач</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.userId} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="py-3 px-4">{formatName(p)}</td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">{p.email ?? "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-[200px]">
                        <div className="course-progress-bar flex-1 min-w-[80px]">
                          <div
                            className="course-progress-bar__fill"
                            style={{ width: `${Math.min(100, p.progressPercent)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">{p.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.solvedProblems} / {p.totalProblems}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
