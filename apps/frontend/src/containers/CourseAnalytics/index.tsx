import { useMemo, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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

import { ArrowLeftIcon, ChartIcon, UsersIcon, BookIcon } from "../../components/icons";

function formatName(p: AnalyticsParticipant): string {
  const first = p.firstName?.trim() || "";
  const last = p.lastName?.trim() || "";
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return p.email ?? `Участник #${p.userId}`;
}

const PROGRESS_BUCKETS = [
  { name: "0–25%", min: 0, max: 25 },
  { name: "25–50%", min: 25, max: 50 },
  { name: "50–75%", min: 50, max: 75 },
  { name: "75–100%", min: 75, max: 101 },
];

const CHART_COLORS = [
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-accent-2)",
  "var(--color-success)",
];

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

  const progressDistribution = useMemo(() => {
    return PROGRESS_BUCKETS.map((bucket) => ({
      name: bucket.name,
      value: participants.filter(
        (p) => p.progressPercent >= bucket.min && p.progressPercent < bucket.max
      ).length,
    }));
  }, [participants]);

  const topBySolved = useMemo(() => {
    return [...participants]
      .sort((a, b) => b.solvedProblems - a.solvedProblems)
      .slice(0, 10)
      .map((p) => ({
        name: formatName(p).slice(0, 20) + (formatName(p).length > 20 ? "…" : ""),
        solved: p.solvedProblems,
        progress: p.progressPercent,
      }));
  }, [participants]);

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

      {/* Charts */}
      {participants.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="panel p-4">
            <h3 className="text-lg font-semibold mb-4">Распределение по прогрессу</h3>
            <div className="analytics-chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={progressDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }: { name: string; value: number }) =>
                      value > 0 ? `${name}: ${value}` : null
                    }
                  >
                    {progressDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "участников"]}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--color-text)" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="panel p-4">
            <h3 className="text-lg font-semibold mb-4">Топ по решённым задачам</h3>
            <div className="analytics-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topBySolved}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis type="number" stroke="var(--color-text-muted)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    stroke="var(--color-text-muted)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} задач`, "решено"]}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--color-text)" }}
                  />
                  <Bar
                    dataKey="solved"
                    fill="var(--color-accent)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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
