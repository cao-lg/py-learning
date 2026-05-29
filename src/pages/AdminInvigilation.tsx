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
    const exams = new Set(sessions.map(s => s.examId));
    return Array.from(exams).map(id => ({ id, title: examTitles[id] || id }));
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
        </ul>
      </div>
    </AdminLayout>
  );
}