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
  hasMultipleVersions?: boolean;
}

interface ExamSchedule {
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
}

interface ExamInputValues {
  [examId: string]: {
    startTime: string;
    endTime: string;
    duration: string;
  };
}

interface ExamDetail {
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

const ADMIN_PASSWORD = '__admin__admin123';

export function AdminSettingsPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [schedule, setSchedule] = useState<Record<string, ExamSchedule>>({});
  const [inputValues, setInputValues] = useState<ExamInputValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewExam, setPreviewExam] = useState<ExamDetail | null>(null);
  const [previewVersions, setPreviewVersions] = useState<ExamDetail[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const formatDateTime = (dateString: string | null | undefined): string => {
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

  const initializeInputValues = (exams: ExamInfo[], scheduleData: Record<string, ExamSchedule>) => {
    const initialValues: ExamInputValues = {};
    exams.forEach(exam => {
      const examSchedule = scheduleData[exam.id];
      const scheduledDuration = examSchedule?.duration;
      initialValues[exam.id] = {
        startTime: formatDateTime(examSchedule?.startTime) || formatDateTime(exam.startTime) || '',
        endTime: formatDateTime(examSchedule?.endTime) || formatDateTime(exam.endTime) || '',
        duration: scheduledDuration ? String(scheduledDuration) : String(exam.duration),
      };
    });
    return initialValues;
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

      let scheduleData: Record<string, ExamSchedule> = {};
      
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        scheduleData = data.schedule || {};
        setSchedule(scheduleData);
      } else {
        console.error('Failed to fetch schedule:', scheduleRes.status, await scheduleRes.text());
      }

      // 始终初始化 inputValues
      const initialValues = initializeInputValues(examData.exams, scheduleData);
      setInputValues(initialValues);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewExam = async (exam: ExamInfo) => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      setPreviewExam(null);
      setPreviewVersions([]);

      // 如果是多版本考试
      if (exam.hasMultipleVersions && exam.id === 'final_exam') {
        const versions = ['final_exam_A', 'final_exam_B', 'final_exam_C'];
        const versionData: ExamDetail[] = [];

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
        const response = await fetch(`/data/exam/${exam.id}.json`);
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

  const handleInputChange = (examId: string, field: 'startTime' | 'endTime' | 'duration', value: string) => {
    setInputValues(prev => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        [field]: value
      }
    }));
  };

  const handleSave = async (examId: string) => {
    setSaving(examId);
    setMessage(null);

    const inputs = inputValues[examId];
    if (!inputs) {
      setMessage({ type: 'error', text: '获取输入值失败，请刷新页面重试' });
      setSaving(null);
      return;
    }

    const parseLocalDateTime = (dateTimeStr: string | undefined): string | null => {
      if (!dateTimeStr) return null;
      const [datePart, timePart] = dateTimeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      return localDate.toISOString();
    };

    const startTime = parseLocalDateTime(inputs.startTime);
    const endTime = parseLocalDateTime(inputs.endTime);
    const duration = inputs.duration ? parseInt(inputs.duration, 10) : null;

    console.log('Saving exam schedule:', { examId, startTime, endTime, duration });
    console.log('Original input values:', inputs);

    try {
      const response = await fetch('/api/exam-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: JSON.stringify({ examId, startTime, endTime, duration }),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log('API response:', response.status, responseData);

      if (response.ok && responseData.ok) {
        setSchedule(prev => ({
          ...prev,
          [examId]: { startTime, endTime, duration }
        }));
        setMessage({ type: 'success', text: `${exams.find(e => e.id === examId)?.title || '考试'}设置已保存` });
      } else {
        setMessage({ type: 'error', text: responseData.error || `保存失败 (${response.status})` });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: '保存失败: ' + (error as Error).message });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleClear = async (examId: string) => {
    if (window.confirm('确定要清除此考试的时间限制吗？（考试时长不会清除）')) {
      const exam = exams.find(e => e.id === examId);
      // 清空时间输入但保留时长
      setInputValues(prev => ({
        ...prev,
        [examId]: {
          startTime: '',
          endTime: '',
          duration: exam ? String(exam.duration) : prev[examId]?.duration || ''
        }
      }));
      await handleSave(examId);
    }
  };

  const checkExamStatus = (examSchedule: ExamSchedule | undefined) => {
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
          const inputs = inputValues[exam.id] || { startTime: '', endTime: '' };
          const status = checkExamStatus(examSchedule);

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

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={inputs.startTime}
                    onChange={(e) => handleInputChange(exam.id, 'startTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  {examSchedule?.startTime && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(examSchedule.startTime).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    value={inputs.endTime}
                    onChange={(e) => handleInputChange(exam.id, 'endTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  {examSchedule?.endTime && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(examSchedule.endTime).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    考试时长（分钟）
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputs.duration}
                    onChange={(e) => handleInputChange(exam.id, 'duration', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    默认：{exam.duration} 分钟
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleSave(exam.id)}
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
                <button
                  onClick={() => handlePreviewExam(exam)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>👁️</span>
                  <span>预览内容</span>
                </button>
              </div>
            </div>
          );
        })}
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