import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../store/idb';

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
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

  const checkAdmin = async () => {
    const pwd = await storage.getUserPassword();
    if (pwd !== ADMIN_PASSWORD) {
      navigate('/admin/login');
    }
  };

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
        setMessage({ type: 'success', text: '保存成功' });
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

  const handleLogout = async () => {
    await storage.setUserPassword('');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">考试时间设置</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          退出登录
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{exam.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{exam.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  id={`start-${exam.id}`}
                  defaultValue={schedule[exam.id]?.startTime || exam.startTime || ''}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  id={`end-${exam.id}`}
                  defaultValue={schedule[exam.id]?.endTime || exam.endTime || ''}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  const startInput = document.getElementById(`start-${exam.id}`) as HTMLInputElement;
                  const endInput = document.getElementById(`end-${exam.id}`) as HTMLInputElement;
                  const startTime = startInput?.value ? new Date(startInput.value).toISOString() : '';
                  const endTime = endInput?.value ? new Date(endInput.value).toISOString() : '';
                  await handleSave(exam.id, startTime, endTime);
                }}
                disabled={saving === exam.id}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving === exam.id ? '保存中...' : '保存'}
              </button>
              <button
                onClick={async () => {
                  await handleSave(exam.id, '', '');
                }}
                disabled={saving === exam.id}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                清除时间限制
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/admin"
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          ← 返回统计页面
        </Link>
      </div>
    </div>
  );
}
