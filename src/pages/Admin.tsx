import { useState, useEffect } from 'react';

interface StatsData {
  exam_id: string;
  total_students: number;
  submitted: number;
  avg_score: number;
  pass_rate: number;
  top_errors: { question_id: string; error_rate: number }[];
}

export function AdminPage() {
  const [stats, setStats] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam] = useState<string>('mid_term');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stats?exam_id=${selectedExam}`);
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await response.json();
      setStats(Array.isArray(data) ? data : [data]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (stats.length === 0) return;

    const headers = ['Exam ID', 'Total Students', 'Submitted', 'Avg Score', 'Pass Rate'];
    const rows = stats.map((s) => [
      s.exam_id,
      s.total_students.toString(),
      s.submitted.toString(),
      s.avg_score.toFixed(2),
      (s.pass_rate * 100).toFixed(2) + '%',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-stats-${selectedExam}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
        <button onClick={exportCSV} className="btn btn-primary" disabled={stats.length === 0}>
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
          <button onClick={loadStats} className="btn btn-secondary mt-2">
            Retry
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.reduce((sum, s) => sum + s.total_students, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Submitted</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.reduce((sum, s) => sum + s.submitted, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.length > 0
              ? (stats.reduce((sum, s) => sum + s.avg_score, 0) / stats.length).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exam Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Exam ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pass Rate
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Top Errors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((stat) => (
                <tr key={stat.exam_id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.exam_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.total_students}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.submitted}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.avg_score.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        stat.pass_rate >= 0.7
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : stat.pass_rate >= 0.5
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {(stat.pass_rate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {stat.top_errors.slice(0, 2).map((e) => e.question_id).join(', ') || '-'}
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
