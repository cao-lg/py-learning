import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ExamIndex {
  exams: ExamInfo[];
}

export function ExamListPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/exam/_index.json')
      .then(res => res.json())
      .then((data: ExamIndex) => setExams(data.exams))
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
        {exams.map((exam) => (
          <Link
            key={exam.id}
            to={`/exam/${exam.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {exam.title}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                    {getDifficultyText(exam.difficulty)}
                  </span>
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
                </div>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">考试须知</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 考试采用完全隔离模式，确保公平性</li>
          <li>• 题目顺序会根据你的身份信息随机打乱</li>
          <li>• 切换标签页或复制粘贴会被记录审计</li>
          <li>• 考试时间结束会自动提交</li>
          <li>• 断网情况下答案会本地保存</li>
        </ul>
      </div>
    </div>
  );
}
