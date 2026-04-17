import { useState } from 'react';

interface StatsData {
  exam_id: string;
  title: string;
  total_students: number;
  submitted: number;
  avg_score: number;
  pass_rate: number;
  top_errors: { question_id: string; error_rate: number }[];
}

const mockStats: StatsData[] = [
  {
    exam_id: 'ch01_basics',
    title: '第一章测验',
    total_students: 45,
    submitted: 42,
    avg_score: 85.2,
    pass_rate: 0.88,
    top_errors: [{ question_id: 'ex1_q3', error_rate: 0.15 }],
  },
  {
    exam_id: 'ch02_variables',
    title: '第二章测验',
    total_students: 42,
    submitted: 38,
    avg_score: 78.6,
    pass_rate: 0.76,
    top_errors: [{ question_id: 'ex2_q2', error_rate: 0.22 }],
  },
  {
    exam_id: 'ch03_operators',
    title: '第三章测验',
    total_students: 40,
    submitted: 35,
    avg_score: 72.3,
    pass_rate: 0.68,
    top_errors: [{ question_id: 'ex3_q6', error_rate: 0.28 }],
  },
  {
    exam_id: 'ch04_control_flow',
    title: '第四章测验',
    total_students: 38,
    submitted: 32,
    avg_score: 68.9,
    pass_rate: 0.58,
    top_errors: [{ question_id: 'ex4_q1', error_rate: 0.35 }],
  },
  {
    exam_id: 'ch05_functions',
    title: '第五章测验',
    total_students: 35,
    submitted: 28,
    avg_score: 65.4,
    pass_rate: 0.52,
    top_errors: [{ question_id: 'ex5_q5', error_rate: 0.42 }],
  },
  {
    exam_id: 'mid_term',
    title: '期中考试',
    total_students: 32,
    submitted: 30,
    avg_score: 71.2,
    pass_rate: 0.65,
    top_errors: [{ question_id: 'em_q2', error_rate: 0.38 }],
  },
];

export function AdminPage() {
  const [stats] = useState<StatsData[]>(mockStats);
  const [selectedExam, setSelectedExam] = useState<string>('all');

  const filteredStats = selectedExam === 'all' 
    ? stats 
    : stats.filter(s => s.exam_id === selectedExam);

  const exportCSV = () => {
    if (filteredStats.length === 0) return;

    const headers = ['Exam ID', 'Title', 'Total Students', 'Submitted', 'Avg Score', 'Pass Rate'];
    const rows = filteredStats.map((s) => [
      s.exam_id,
      s.title,
      s.total_students.toString(),
      s.submitted.toString(),
      s.avg_score.toFixed(1),
      (s.pass_rate * 100).toFixed(0) + '%',
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

  const totalStudents = filteredStats.reduce((sum, s) => sum + s.total_students, 0);
  const totalSubmitted = filteredStats.reduce((sum, s) => sum + s.submitted, 0);
  const avgScore = filteredStats.length > 0
    ? filteredStats.reduce((sum, s) => sum + s.avg_score, 0) / filteredStats.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">教师端</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Exams</option>
            {stats.map((s) => (
              <option key={s.exam_id} value={s.exam_id}>
                {s.title}
              </option>
            ))}
          </select>
          <button onClick={exportCSV} className="btn btn-primary">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
          💡 这是演示数据，实际数据需要通过 Cloudflare D1 后端 API 获取
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalStudents}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Submitted</h3>
          <p className="text-3xl font-bold text-green-600">
            {totalSubmitted}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-purple-600">
            {avgScore.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredStats.map((stat) => (
          <div
            key={stat.exam_id}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">{stat.title}</h3>
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
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>参与人数</span>
                <span className="font-medium text-gray-900 dark:text-white">{stat.submitted}/{stat.total_students}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>平均分</span>
                <span className="font-medium text-gray-900 dark:text-white">{stat.avg_score.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stat.avg_score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">详细数据</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  考试ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  总人数
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  提交数
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  平均分
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  通过率
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  高频错误
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStats.map((stat) => (
                <tr key={stat.exam_id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.exam_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.title}</td>
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
                    {stat.top_errors.map((e) => e.question_id).join(', ') || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
