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
  // 基于学生的统计
  studentStats?: {
    activeStudents?: number;
    avgPracticePerStudent?: number;
    avgExamPerStudent?: number;
    topStudents?: { userId: string; userName: string; practiceCount: number; examCount: number; totalScore: number }[];
  };
  // 基于课程的统计
  courseStats?: {
    totalChapters?: number;
    avgAttemptsPerChapter?: number;
    avgScorePerChapter?: number;
    chapterStats?: { chapterId: string; attempts: number; avgScore: number; completionRate: number }[];
  };
  // 基于练习的统计
  practiceStats?: {
    totalQuestions?: number;
    avgAttemptsPerQuestion?: number;
    avgScorePerQuestion?: number;
    difficultyDistribution?: { difficulty: string; count: number; avgScore: number }[];
  };
  // 基于考试的统计
  examDetailedStats?: {
    totalExams?: number;
    avgAttemptsPerExam?: number;
    avgScorePerExam?: number;
    passRate?: number;
    examStats?: { examId: string; attempts: number; avgScore: number; passRate: number }[];
  };
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

interface ExamData {
  id: string;
  version?: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  passingScore: number;
  questions: {
    id: string;
    type: string;
    title: string;
    instruction: string;
    initialCode: string;
    testConfig: {
      expected?: string | null;
      timeout_ms: number;
      mockInputs?: string[];
      weight?: number;
    };
    hints?: {
      text: string;
      visible: boolean;
    }[];
  }[];
}

export function AdminPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [previewExam, setPreviewExam] = useState<ExamData | null>(null);
  const [previewVersions, setPreviewVersions] = useState<ExamData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  const handlePreviewExam = async (examId: string) => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      setPreviewExam(null);
      setPreviewVersions([]);

      // 如果是期末考试（多版本）
      if (examId === 'final_exam') {
        const versions = ['final_exam_A', 'final_exam_B', 'final_exam_C'];
        const versionData: ExamData[] = [];

        for (const versionId of versions) {
          const response = await fetch(`/data/exam/${versionId}.json`);
          if (response.ok) {
            const data = await response.json();
            versionData.push(data);
          }
        }

        setPreviewVersions(versionData);
      } else {
        // 单版本考试
        const response = await fetch(`/data/exam/${examId}.json`);
        const examData = await response.json();
        setPreviewExam(examData);
      }
    } catch (err) {
      console.error('Failed to load exam data:', err);
      alert('加载考试内容失败');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
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

  const cleanupData = async (type: 'invalid' | 'all') => {
    const password = prompt(type === 'all' ? '请输入管理员密码以清理全部记录' : '请输入管理员密码以清理无效记录');
    if (!password) return;

    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, password })
      });
      const data = await response.json();
      if (data.ok) {
        alert(`${data.message}\n删除了 ${data.deletedRecords?.practiceRecords || 0} 条练习记录\n删除了 ${data.deletedRecords?.examRecords || 0} 条考试记录\n删除了 ${data.deletedRecords?.auditLogs || 0} 条审计日志`);
        fetchStats(); // 重新获取统计数据
      } else {
        alert('数据清理失败：' + data.error);
      }
    } catch (error) {
      alert('数据清理失败：网络错误');
    }
  };

  const exportData = async () => {
    const password = prompt('请输入管理员密码以导出学生数据');
    if (!password) return;

    try {
      const response = await fetch('/api/export', {
        headers: { 'X-Admin-Password': `__admin__${password}` }
      });
      const data = await response.json();
      if (data.ok) {
        // 生成 CSV 内容
        let csvContent = '数据类型,学生姓名,学生ID,考试/章节,分数,总题数,完成时间\n';

        // 添加考试记录
        data.data?.students.forEach((student: any) => {
          student.examRecords.forEach((record: any) => {
            csvContent += `考试,${student.name},${student.id},${record.exam_title},${record.score},${record.total_questions},${new Date(record.completed_at).toLocaleString()}\n`;
          });

          // 添加练习记录
          student.practiceRecords.forEach((record: any) => {
            csvContent += `练习,${student.name},${student.id},${record.chapter_id},${record.score},${record.total_questions},${new Date(record.completed_at).toLocaleString()}\n`;
          });
        });

        // 下载 CSV 文件
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `学生答题记录_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('数据导出失败：' + data.error);
      }
    } catch (error) {
      alert('数据导出失败：网络错误');
    }
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
      {/* 操作按钮 */}
      <div className="flex justify-end mb-6 gap-4">
        <button 
          onClick={exportData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>📤</span>
          <span>导出学生数据</span>
        </button>
        <button 
          onClick={() => cleanupData('invalid')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <span>🧹</span>
          <span>清理无效数据</span>
        </button>
        <button 
          onClick={() => cleanupData('all')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>清理全部记录</span>
        </button>
      </div>

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

      {/* 学生统计 */}
      {stats?.studentStats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">活跃学生</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.studentStats.activeStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">人均练习</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.studentStats.avgPracticePerStudent?.toFixed(1) || 0}
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
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">人均考试</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.studentStats.avgExamPerStudent?.toFixed(1) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* 课程统计 */}
      {stats?.courseStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">课程统计</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总章节数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.courseStats.totalChapters || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均尝试次数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.courseStats.avgAttemptsPerChapter?.toFixed(1) || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均得分</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.courseStats.avgScorePerChapter?.toFixed(1)}%
              </p>
            </div>
          </div>
          {stats.courseStats.chapterStats && stats.courseStats.chapterStats.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">章节ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">尝试次数</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">平均得分</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">完成率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.courseStats.chapterStats.slice(0, 5).map((chapter) => (
                    <tr key={chapter.chapterId} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{chapter.chapterId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{chapter.attempts}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${chapter.avgScore >= 70 ? 'bg-green-100 text-green-800' : chapter.avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {chapter.avgScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${chapter.completionRate >= 70 ? 'bg-green-100 text-green-800' : chapter.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {chapter.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 练习统计 */}
      {stats?.practiceStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">练习统计</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总题目数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.practiceStats.totalQuestions || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均尝试次数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.practiceStats.avgAttemptsPerQuestion?.toFixed(1) || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均得分</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.practiceStats.avgScorePerQuestion?.toFixed(1)}%
              </p>
            </div>
          </div>
          {stats.practiceStats.difficultyDistribution && stats.practiceStats.difficultyDistribution.length > 0 && (
            <div className="h-64">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">难度分布</h4>
              <div className="flex items-end gap-4 h-48">
                {stats.practiceStats.difficultyDistribution.map((item) => (
                  <div key={item.difficulty} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-90`}
                      style={{ 
                        height: `${Math.max((item.count / (stats.totalPracticeRecords || 1)) * 100, 8)}%`,
                        backgroundColor: item.difficulty === '简单' ? '#10b981' : item.difficulty === '中等' ? '#f59e0b' : '#ef4444'
                      }}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.difficulty}</span>
                    <span className="text-xs text-gray-500">{item.count}</span>
                    <span className="text-xs text-gray-500">{item.avgScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 考试统计 */}
      {stats?.examDetailedStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">考试统计</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总考试数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.examDetailedStats.totalExams || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均尝试次数</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.examDetailedStats.avgAttemptsPerExam?.toFixed(1) || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均得分</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.examDetailedStats.avgScorePerExam?.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">整体通过率</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.examDetailedStats.passRate}%
              </p>
            </div>
          </div>
          {stats.examDetailedStats.examStats && stats.examDetailedStats.examStats.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">考试ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">考试名称</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">尝试次数</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">平均得分</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">通过率</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.examDetailedStats.examStats.map((exam) => (
                    <tr key={exam.examId} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{exam.examId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {examTitles[exam.examId] || exam.examId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{exam.attempts}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${exam.avgScore >= 70 ? 'bg-green-100 text-green-800' : exam.avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {exam.avgScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${exam.passRate >= 70 ? 'bg-green-100 text-green-800' : exam.passRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {exam.passRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handlePreviewExam(exam.examId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <span>👁️</span>
                          <span>预览</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 优秀学生 */}
      {stats?.studentStats?.topStudents && stats.studentStats.topStudents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">优秀学生</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">排名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">学生姓名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">练习次数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">考试次数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">总得分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.studentStats.topStudents.map((student, index) => (
                  <tr key={student.userId} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.practiceCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.examCount}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  操作
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
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handlePreviewExam(stat.examId)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <span>👁️</span>
                      <span>预览</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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

      {/* 预览考试模态框 */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                预览考试内容
              </h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewExam(null);
                  setPreviewVersions([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : previewVersions.length > 0 ? (
                // 多版本考试预览
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>多版本考试说明</span>
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      此考试包含 A、B、C 三套试卷，系统会根据学生ID随机分配其中一套。每套试卷各有 {previewVersions[0]?.questions.length || 12} 题，考试时长 {previewVersions[0]?.duration || 90} 分钟。
                    </p>
                  </div>

                  {previewVersions.map((version, vIndex) => (
                    <div key={version.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="bg-gray-100 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            vIndex === 0 ? 'bg-red-100 text-red-800' :
                            vIndex === 1 ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {version.version || ['A', 'B', 'C'][vIndex]} 卷
                          </span>
                          <span>{version.title}</span>
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                          {version.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <span>⏱️</span>
                            <span>{version.duration} 分钟</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📝</span>
                            <span>{version.questions.length} 题</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>🏆</span>
                            <span>{version.totalScore} 分</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {version.questions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                第 {qIndex + 1} 题
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                question.type === 'output' ? 'bg-blue-100 text-blue-800' :
                                question.type === 'function' ? 'bg-green-100 text-green-800' :
                                question.type === 'interactive' ? 'bg-yellow-100 text-yellow-800' :
                                question.type === 'unittest' ? 'bg-orange-100 text-orange-800' :
                                question.type === 'constraint' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {question.type === 'output' ? '输出题' :
                                 question.type === 'function' ? '函数题' :
                                 question.type === 'interactive' ? '交互题' :
                                 question.type === 'unittest' ? '单元测试' :
                                 question.type === 'constraint' ? '约束题' :
                                 '调试题'}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {question.title}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap line-clamp-2 mb-2">
                              {question.instruction}
                            </p>
                            {/* 评分标准 */}
                            {question.testConfig.expected && (
                              <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">📋 评分标准：</span>
                                </div>
                                <pre className="text-xs text-blue-800 dark:text-blue-300 whitespace-pre-wrap overflow-x-auto">
                                  {question.testConfig.expected}
                                </pre>
                              </div>
                            )}
                            {/* 测试用例输入 */}
                            {question.testConfig.mockInputs && question.testConfig.mockInputs.length > 0 && (
                              <div className="mt-2 bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-green-600 dark:text-green-400 text-xs font-medium">📥 测试输入：</span>
                                </div>
                                <pre className="text-xs text-green-800 dark:text-green-300 whitespace-pre-wrap overflow-x-auto">
                                  {question.testConfig.mockInputs.join('\n')}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : previewExam ? (
                // 单版本考试预览
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {previewExam.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {previewExam.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">⏱️</span>
                        <span className="text-gray-900 dark:text-white">考试时长：{previewExam.duration} 分钟</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">📝</span>
                        <span className="text-gray-900 dark:text-white">总题数：{previewExam.questions.length} 题</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">🏆</span>
                        <span className="text-gray-900 dark:text-white">总分：{previewExam.totalScore} 分</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">✅</span>
                        <span className="text-gray-900 dark:text-white">及格线：{previewExam.passingScore} 分</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      题目列表
                    </h4>
                    <div className="space-y-4">
                      {previewExam.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                                第 {index + 1} 题
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                question.type === 'output' ? 'bg-blue-100 text-blue-800' :
                                question.type === 'function' ? 'bg-green-100 text-green-800' :
                                question.type === 'interactive' ? 'bg-yellow-100 text-yellow-800' :
                                question.type === 'unittest' ? 'bg-orange-100 text-orange-800' :
                                question.type === 'constraint' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {question.type === 'output' ? '输出题' :
                                 question.type === 'function' ? '函数题' :
                                 question.type === 'interactive' ? '交互题' :
                                 question.type === 'unittest' ? '单元测试' :
                                 question.type === 'constraint' ? '约束题' :
                                 '调试题'}
                              </span>
                            </div>
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {question.title}
                          </h5>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                            {question.instruction}
                          </p>
                          <div className="bg-gray-900/90 rounded-lg p-3 mb-3">
                            <pre className="text-sm text-green-400 overflow-x-auto">
                              <code>{question.initialCode}</code>
                            </pre>
                          </div>
                          {/* 评分标准 */}
                          {question.testConfig.expected && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mb-3">
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">📋 评分标准（期望输出）：</span>
                              </div>
                              <pre className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap overflow-x-auto bg-white dark:bg-gray-900 rounded p-2">
                                {question.testConfig.expected}
                              </pre>
                            </div>
                          )}
                          {/* 测试用例输入 */}
                          {question.testConfig.mockInputs && question.testConfig.mockInputs.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 mb-3">
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">📥 测试输入：</span>
                              </div>
                              <pre className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap overflow-x-auto bg-white dark:bg-gray-900 rounded p-2">
                                {question.testConfig.mockInputs.join('\n')}
                              </pre>
                            </div>
                          )}
                          {/* 超时时间 */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            ⏱️ 超时限制：{question.testConfig.timeout_ms / 1000} 秒
                          </div>
                          {question.hints && question.hints.length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                提示：
                              </h6>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {question.hints.map((hint, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>{hint.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-2">📋</span>
                  <p className="text-gray-500">暂无考试内容</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewExam(null);
                  setPreviewVersions([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}