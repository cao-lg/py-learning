import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';

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

  const examStats = stats?.examStats || [];
  const filteredStats = selectedExam === 'all'
    ? examStats
    : examStats.filter(s => s.examId === selectedExam);

  const exportCSV = () => {
    if (filteredStats.length === 0) return;

    const headers = ['考试ID', '考试名称', '参考次数', '平均分数'];
    const rows = filteredStats.map((s) => [
      s.examId,
      examTitles[s.examId] || s.examId,
      s.attempts.toString(),
      s.avgScore.toFixed(1) + '%',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `考试统计_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout title="统计概览">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="统计概览">
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
          <button onClick={fetchStats} className="mt-4 btn btn-primary">
            重试
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="统计概览">
      {/* 统计卡片 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总用户数</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">练习记录</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats?.totalPracticeRecords || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">考试记录</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalExamRecords || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动图表 */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近活动（过去7天）</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.recentActivity.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                  style={{ 
                    height: `${Math.max((day.count / Math.max(...stats.recentActivity!.map(d => d.count))) * 100, 8)}%` 
                  }}
                />
                <span className="text-xs text-gray-500">{day.date.slice(5)}</span>
                <span className="text-xs font-medium text-gray-700">{day.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 考试统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">考试统计</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">全部考试</option>
              {examStats.map((s) => (
                <option key={s.examId} value={s.examId}>
                  {examTitles[s.examId] || s.examId}
                </option>
              ))}
            </select>
            <button 
              onClick={exportCSV}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              <span>导出CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  考试ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  考试名称
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  参考次数
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  平均分数
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStats.map((stat) => (
                <tr key={stat.examId} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{stat.examId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {examTitles[stat.examId] || stat.examId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{stat.attempts}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                      stat.avgScore >= 70 ? 'bg-green-100 text-green-800' : 
                      stat.avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {stat.avgScore.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📊</span>
                      <p>暂无考试数据</p>
                      <p className="text-sm text-gray-400">学生完成考试后会显示统计信息</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}