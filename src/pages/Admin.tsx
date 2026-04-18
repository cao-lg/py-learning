import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface StatsResponse {
  ok: boolean;
  totalUsers?: number;
  totalPracticeRecords?: number;
  totalExamRecords?: number;
  recentActivity?: { date: string; count: number }[];
  topChapters?: { chapterId: string; attempts: number; avgScore: number }[];
  examStats?: { examId: string; attempts: number; avgScore: number }[];
  error?: string;
}

const examTitles: Record<string, string> = {
  ch01_basics: '第一章测验',
  ch02_variables: '第二章测验',
  ch03_operators: '第三章测验',
  ch04_control_flow: '第四章测验',
  ch05_functions: '第五章测验',
  ch06_data_structures: '第六章测验',
  ch07_strings: '第七章测验',
  ch08_file_io: '第八章测验',
  ch09_exception: '第九章测验',
  ch10_oop: '第十章测验',
  mid_term: '期中考试',
  final_exam: '期末考试',
};

export function AdminPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
          <button onClick={fetchStats} className="mt-4 btn btn-primary">
            重试
          </button>
        </div>
      </div>
    );
  }

  const examStats = stats?.examStats || [];
  const filteredStats = selectedExam === 'all'
    ? examStats
    : examStats.filter(s => s.examId === selectedExam);

  const exportCSV = () => {
    if (filteredStats.length === 0) return;

    const headers = ['Exam ID', 'Title', 'Attempts', 'Avg Score'];
    const rows = filteredStats.map((s) => [
      s.examId,
      examTitles[s.examId] || s.examId,
      s.attempts.toString(),
      s.avgScore.toFixed(1) + '%',
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">教师端</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin/settings" className="btn btn-secondary">
            考试设置
          </Link>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Exams</option>
            {examStats.map((s) => (
              <option key={s.examId} value={s.examId}>
                {examTitles[s.examId] || s.examId}
              </option>
            ))}
          </select>
          <button onClick={exportCSV} className="btn btn-primary">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.totalUsers || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Practice Records</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalPracticeRecords || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Exam Records</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.totalExamRecords || 0}
          </p>
        </div>
      </div>

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-sm text-gray-500 mb-3">Recent Activity (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.recentActivity.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${Math.max((day.count / Math.max(...stats.recentActivity!.map(d => d.count))) * 100, 5)}%` }}
                />
                <span className="text-xs text-gray-500">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exam Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Exam ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStats.map((stat) => (
                <tr key={stat.examId} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.examId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {examTitles[stat.examId] || stat.examId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.attempts}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${
                      stat.avgScore >= 70 ? 'text-green-600' : stat.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.avgScore.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No data available. Students need to complete exams first.
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
