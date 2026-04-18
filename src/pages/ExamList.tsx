import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkExamAvailability, formatDateTime, type ExamStatus } from '../utils/exam-schedule';

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  startTime?: string;
  endTime?: string;
}

interface ExamIndex {
  exams: ExamInfo[];
}

export function ExamListPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [examStatus, setExamStatus] = useState<Record<string, ExamStatus>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/data/exam/_index.json')
      .then(res => res.json())
      .then((data: ExamIndex) => {
        setExams(data.exams);
        const status: Record<string, ExamStatus> = {};
        data.exams.forEach(exam => {
          status[exam.id] = checkExamAvailability(exam).status;
        });
        setExamStatus(status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  const getStatusBadge = (exam: ExamInfo) => {
    const availability = checkExamAvailability(exam);
    switch (availability.status) {
      case 'not_started':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            未开始 · {formatDateTime(availability.startsAt!)}
          </span>
        );
      case 'ended':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            已结束
          </span>
        );
      case 'available':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            可参加
          </span>
        );
      case 'no_schedule':
        return null;
    }
  };

  const handleExamClick = (exam: ExamInfo) => {
    const availability = checkExamAvailability(exam);
    if (availability.status === 'not_started') {
      alert(`考试尚未开始\n开始时间：${formatDateTime(availability.startsAt!)}`);
      return;
    }
    if (availability.status === 'ended') {
      alert('考试已结束');
      return;
    }
    navigate(`/exam/${exam.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Python 考试中心
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          选择一场考试开始你的测评
        </p>
      </div>

      <div className="grid gap-6">
        {exams.map((exam) => {
          const isAvailable = examStatus[exam.id] === 'available' || examStatus[exam.id] === 'no_schedule';
          return (
            <div
              key={exam.id}
              onClick={() => handleExamClick(exam)}
              className={`block bg-white dark:bg-gray-800 rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer ${
                isAvailable 
                  ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {exam.title}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {getDifficultyText(exam.difficulty)}
                    </span>
                    {getStatusBadge(exam)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {exam.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span>⏱</span> {exam.duration} 分钟
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📝</span> {exam.questionCount} 题
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>🎯</span> 满分 {exam.totalScore} 分
                    </span>
                    {exam.startTime && exam.endTime && (
                      <span className="flex items-center gap-1.5">
                        <span>📅</span> {formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isAvailable 
                      ? 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <span className="text-2xl">📝</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">考试须知</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 考试采用完全隔离模式，确保公平性</li>
          <li>• 题目顺序会根据你的身份信息随机打乱</li>
          <li>• 切换标签页或复制粘贴会被记录审计</li>
          <li>• 考试时间结束会自动提交</li>
          <li>• 断网情况下答案会本地保存</li>
          <li>• 请在规定时间内完成考试</li>
        </ul>
      </div>
    </div>
  );
}
