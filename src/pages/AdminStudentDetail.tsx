import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

interface User {
  id: string;
  name: string;
  created_at: number;
}

interface PracticeStats {
  totalAttempts: number;
  avgScore: number;
  chapterStats: {
    chapterId: string;
    attempts: number;
    avgScore: number;
  }[];
}

interface ExamStats {
  totalAttempts: number;
  avgScore: number;
  passRate: number;
  examStats: {
    examId: string;
    attempts: number;
    score: number;
    date: string;
  }[];
}

interface StudentDetailResponse {
  ok: boolean;
  user?: User;
  practiceStats?: PracticeStats;
  examStats?: ExamStats;
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

export function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      if (data.ok) {
        setStudent(data);
      } else {
        setError(data.error || '获取学生信息失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="学生详情">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="学生详情">
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
          <Link to="/admin/users" className="mt-4 btn btn-primary inline-block">
            返回用户列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!student || !student.user) {
    return (
      <AdminLayout title="学生详情">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400">学生信息不存在</p>
          <Link to="/admin/users" className="mt-4 btn btn-primary inline-block">
            返回用户列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="学生详情">
      <div className="mb-6">
        <Link to="/admin/users" className="btn btn-secondary mb-4">
          ← 返回用户列表
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {student.user.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">学生ID</h3>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{student.user.id}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">创建时间</h3>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {new Date(student.user.created_at).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">状态</h3>
              <p className="text-lg font-medium text-green-600">活跃</p>
            </div>
          </div>
        </div>

        {/* 练习统计 */}
        {student.practiceStats && student.practiceStats.totalAttempts > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">练习统计</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总练习次数</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.practiceStats.totalAttempts}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均得分</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.practiceStats.avgScore}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">练习章节数</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.practiceStats.chapterStats.length}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      章节ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      练习次数
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      平均得分
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {student.practiceStats.chapterStats.map((chapter) => (
                    <tr key={chapter.chapterId} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{chapter.chapterId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{chapter.attempts}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${chapter.avgScore >= 70 ? 'bg-green-100 text-green-800' : chapter.avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {chapter.avgScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 考试统计 */}
        {student.examStats && student.examStats.totalAttempts > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">考试统计</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总考试次数</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.examStats.totalAttempts}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均得分</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.examStats.avgScore}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">通过率</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.examStats.passRate}%
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      考试ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      考试名称
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      得分
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      考试时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {student.examStats.examStats.map((exam) => (
                    <tr key={`${exam.examId}-${exam.date}`} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{exam.examId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {examTitles[exam.examId] || exam.examId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${exam.score >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {exam.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{exam.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 无记录提示 */}
        {(!student.practiceStats || student.practiceStats.totalAttempts === 0) && 
         (!student.examStats || student.examStats.totalAttempts === 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center flex-col py-8">
              <span className="text-4xl mb-4">📊</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无记录</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                该学生尚未完成任何练习或考试
              </p>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
    );
}
