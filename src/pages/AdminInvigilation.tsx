import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ExamSessionInfo {
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  tabSwitchCount: number;
  startTime: number;
  status: 'ongoing' | 'submitted';
  lastActive?: number;
}

interface ExportRecord {
  userId: string;
  userName: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number;
  durationFormatted: string;
  score: number;
  totalQuestions: number;
  tabSwitchCount: number;
  status: string;
  answers: Record<string, string>;
}

interface ExportStats {
  totalStudents: number;
  submitted: number;
  ongoing: number;
  avgScore: number;
  totalTabSwitches: number;
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
  final_exam_A: '期末考试A卷',
  final_exam_B: '期末考试B卷',
  final_exam_C: '期末考试C卷',
};

export function AdminInvigilationPage() {
  const [sessions, setSessions] = useState<ExamSessionInfo[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<{
    stats: ExportStats;
    records: ExportRecord[];
    examId: string;
    exportedAt: string;
  } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/invigilation');
      const data = await response.json();
      if (data.ok) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch invigilation data:', err);
    }
  };

  const handleResetTabSwitch = async (userId: string, examId: string) => {
    const confirmReset = window.confirm('确定要重置该学生的切屏次数吗？');
    if (!confirmReset) return;

    try {
      const response = await fetch('/api/invigilation/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, examId })
      });
      const data = await response.json();
      if (data.ok) {
        alert('切屏次数已重置');
        fetchSessions();
      } else {
        alert('重置失败：' + data.error);
      }
    } catch (err) {
      alert('重置失败：网络错误');
    }
  };

  const handleClearViolation = async (userId: string, examId: string) => {
    const confirmClear = window.confirm('确定要清除该学生的违规记录吗？这将允许他们重新参加考试。');
    if (!confirmClear) return;

    try {
      const response = await fetch('/api/invigilation/clear-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, examId })
      });
      const data = await response.json();
      if (data.ok) {
        alert('违规记录已清除');
        fetchSessions();
      } else {
        alert('清除失败：' + data.error);
      }
    } catch (err) {
      alert('清除失败：网络错误');
    }
  };

  const formatDuration = (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getExamList = () => {
    return Object.entries(examTitles).map(([id, title]) => ({ id, title }));
  };

  const handleExport = async () => {
    if (selectedExam === 'all') {
      alert('请先选择一场具体的考试');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/invigilation/export?examId=${selectedExam}`);
      const data = await response.json();
      
      if (data.ok) {
        setExportData({
          stats: data.stats,
          records: data.records,
          examId: data.examId,
          exportedAt: data.exportedAt
        });
        setShowExportModal(true);
      } else {
        alert('导出失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出失败：网络错误');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = () => {
    if (!exportData) return;

    const examTitle = examTitles[exportData.examId] || exportData.examId;
    
    // 创建 CSV 内容
    const headers = ['学生姓名', '学生ID', '开始时间', '提交时间', '用时', '成绩', '总分', '切屏次数', '状态'];
    const rows = exportData.records.map(r => [
      r.userName,
      r.userId,
      r.startedAt ? new Date(r.startedAt).toLocaleString('zh-CN') : '-',
      r.completedAt ? new Date(r.completedAt).toLocaleString('zh-CN') : '-',
      r.durationFormatted,
      r.score.toString(),
      r.totalQuestions.toString(),
      r.tabSwitchCount.toString(),
      r.status
    ]);

    const csvContent = [
      `# ${examTitle} 考试数据导出`,
      `# 导出时间：${new Date(exportData.exportedAt).toLocaleString('zh-CN')}`,
      `# 统计：总人数 ${exportData.stats.totalStudents}，已提交 ${exportData.stats.submitted}，进行中 ${exportData.stats.ongoing}，平均分 ${exportData.stats.avgScore}，总切屏 ${exportData.stats.totalTabSwitches}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${examTitle}_考试数据_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSessions = selectedExam === 'all'
    ? sessions
    : sessions.filter(s => s.examId === selectedExam);

  const ongoingCount = sessions.filter(s => s.status === 'ongoing').length;
  const totalTabSwitches = sessions.reduce((sum, s) => sum + s.tabSwitchCount, 0);

  return (
    <AdminLayout title="监考管理">
      {/* 统计卡片 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总考试人数</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sessions.length}
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
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">进行中</h3>
              <p className="text-3xl font-bold text-green-600">
                {ongoingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总切屏次数</h3>
              <p className="text-3xl font-bold text-orange-600">
                {totalTabSwitches}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">选择考试：</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">全部考试</option>
              {getExamList().map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>刷新</span>
          </button>
          <button
            onClick={handleExport}
            disabled={selectedExam === 'all' || isExporting}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              selectedExam === 'all' 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isExporting ? (
              <>
                <span>⏳</span>
                <span>导出中...</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>导出数据</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 学生列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  学生姓名
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  学生ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  考试名称
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  切屏次数
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  已用时
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSessions.map((session) => (
                <tr key={`${session.userId}-${session.examId}`} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {session.userName || '未知用户'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {session.userId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {examTitles[session.examId] || session.examId}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                      session.tabSwitchCount >= 3 ? 'bg-red-100 text-red-800' :
                      session.tabSwitchCount >= 1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.tabSwitchCount} / 3
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDuration(session.startTime)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                      session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status === 'ongoing' ? '进行中' : '已提交'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetTabSwitch(session.userId, session.examId)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="重置切屏次数"
                      >
                        重置切屏
                      </button>
                      <button
                        onClick={() => handleClearViolation(session.userId, session.examId)}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="清除违规记录"
                      >
                        清除违规
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">👀</span>
                      <p>暂无监考数据</p>
                      <p className="text-sm text-gray-400">学生开始考试后会显示在这里</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">📋 监考说明</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 切屏次数达到3次将自动终止考试并禁止再次进入</li>
          <li>• 点击"重置切屏"可清零该学生的切屏计数（适用于误判情况）</li>
          <li>• 点击"清除违规"可移除学生的违规记录，允许其重新参加考试</li>
          <li>• 页面每30秒自动刷新一次，也可手动点击刷新按钮</li>
          <li>• 选择具体考试后可点击"导出数据"下载该场考试的详细数据</li>
        </ul>
      </div>

      {/* 导出模态框 */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  📊 {examTitles[exportData.examId] || exportData.examId} - 考试数据导出
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                导出时间：{new Date(exportData.exportedAt).toLocaleString('zh-CN')}
              </p>
            </div>

            {/* 统计卡片 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{exportData.stats.totalStudents}</div>
                  <div className="text-sm text-gray-500">总人数</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{exportData.stats.submitted}</div>
                  <div className="text-sm text-gray-500">已提交</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{exportData.stats.ongoing}</div>
                  <div className="text-sm text-gray-500">进行中</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{exportData.stats.avgScore}</div>
                  <div className="text-sm text-gray-500">平均分</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{exportData.stats.totalTabSwitches}</div>
                  <div className="text-sm text-gray-500">总切屏</div>
                </div>
              </div>
            </div>

            {/* 数据表格 */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">学生姓名</th>
                    <th className="px-4 py-3 text-left">用时</th>
                    <th className="px-4 py-3 text-left">成绩</th>
                    <th className="px-4 py-3 text-left">切屏</th>
                    <th className="px-4 py-3 text-left">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {exportData.records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-3 font-medium">{record.userName}</td>
                      <td className="px-4 py-3">{record.durationFormatted}</td>
                      <td className="px-4 py-3">{record.score} / {record.totalQuestions}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.tabSwitchCount >= 3 ? 'bg-red-100 text-red-800' :
                          record.tabSwitchCount >= 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.tabSwitchCount}次
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === '已提交' ? 'bg-green-100 text-green-800' :
                          record.status === '进行中' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 操作按钮 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                关闭
              </button>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span>📥</span>
                <span>下载CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}