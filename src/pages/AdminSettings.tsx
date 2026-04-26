import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  difficulty: string;
  startTime?: string;
  endTime?: string;
}

interface ExamSchedule {
  startTime: string | null;
  endTime: string | null;
}

const ADMIN_PASSWORD = '__admin__admin123';

export function AdminSettingsPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [schedule, setSchedule] = useState<Record<string, ExamSchedule>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examRes, scheduleRes] = await Promise.all([
        fetch('/data/exam/_index.json'),
        fetch('/api/exam-schedule', {
          headers: { 'X-Admin-Password': ADMIN_PASSWORD }
        })
      ]);

      const examData = await examRes.json();
      setExams(examData.exams);

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setSchedule(scheduleData.schedule || {});
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (examId: string, startTime: string, endTime: string) => {
    setSaving(examId);
    setMessage(null);

    try {
      const response = await fetch('/api/exam-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: JSON.stringify({ examId, startTime, endTime }),
      });

      if (response.ok) {
        setSchedule(prev => ({
          ...prev,
          [examId]: { startTime: startTime || null, endTime: endTime || null }
        }));
        setMessage({ type: 'success', text: `${exams.find(e => e.id === examId)?.title || '考试'}设置已保存` });
      } else {
        setMessage({ type: 'error', text: '保存失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClear = async (examId: string) => {
    if (window.confirm('确定要清除此考试的时间限制吗？')) {
      await handleSave(examId, '', '');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="考试设置">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="考试设置">
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <span>ℹ️</span>
          <span>考试时间设置说明</span>
        </h3>
        <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-sm">
          <li>• 设置开始和结束时间后，只有在指定时间范围内才能参加考试</li>
          <li>• 清除时间限制后，任何时间都可以参加考试</li>
          <li>• 时间设置使用本地时间，注意设置正确的日期和时间</li>
        </ul>
      </div>

      <div className="space-y-6">
        {exams.map((exam) => {
          const examSchedule = schedule[exam.id];
          const startInputId = `start-${exam.id}`;
          const endInputId = `end-${exam.id}`;

          // 将时间转换为 datetime-local 格式
          const formatDateTime = (dateString: string | null | undefined) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch {
              return '';
            }
          };

          // 检查当前是否在考试时间范围内
          const checkExamStatus = () => {
            if (!examSchedule?.startTime || !examSchedule?.endTime) {
              return { status: 'open', label: '开放考试', color: 'green' };
            }
            
            const now = new Date();
            const start = new Date(examSchedule.startTime);
            const end = new Date(examSchedule.endTime);
            
            if (now < start) {
              return { status: 'pending', label: '考试未开始', color: 'yellow' };
            } else if (now > end) {
              return { status: 'closed', label: '考试已结束', color: 'red' };
            } else {
              return { status: 'active', label: '考试进行中', color: 'green' };
            }
          };

          const status = checkExamStatus();

          return (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{exam.title}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{exam.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{exam.duration}分钟</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📝</span>
                      <span>{exam.questionCount}道题</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📊</span>
                      <span>{exam.totalScore}分</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{exam.difficulty}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor={startInputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    id={startInputId}
                    defaultValue={
                      formatDateTime(examSchedule?.startTime) || 
                      formatDateTime(exam.startTime)
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  {examSchedule?.startTime && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(examSchedule.startTime).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={endInputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    id={endInputId}
                    defaultValue={
                      formatDateTime(examSchedule?.endTime) || 
                      formatDateTime(exam.endTime)
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  {examSchedule?.endTime && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(examSchedule.endTime).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    const startInput = document.getElementById(startInputId) as HTMLInputElement;
                    const endInput = document.getElementById(endInputId) as HTMLInputElement;
                    const startTime = startInput?.value ? new Date(startInput.value).toISOString() : '';
                    const endTime = endInput?.value ? new Date(endInput.value).toISOString() : '';
                    await handleSave(exam.id, startTime, endTime);
                  }}
                  disabled={saving === exam.id}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving === exam.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>保存设置</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleClear(exam.id)}
                  disabled={saving === exam.id}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>清除时间限制</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}