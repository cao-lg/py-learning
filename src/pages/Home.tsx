export function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
        Python 基础学练测评考平台
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        面向高校/培训机构的 Python 基础教学闭环平台，覆盖"学-练-测-评"全流程
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <a
          href="/learn"
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">学 (Learn)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            静态 Markdown 课程章节，配套代码高亮与随堂练习
          </p>
        </a>

        <a
          href="/practice"
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-4">💻</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">练 (Practice)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            即时评测，多题型支持，实时反馈，代码本地持久化
          </p>
        </a>

        <a
          href="/exam"
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">考 (Exam)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            完全隔离模式，确定性打乱，断网保护，审计日志
          </p>
        </a>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
          技术栈
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['React 18', 'TypeScript', 'Vite', 'Pyodide', 'Tailwind CSS', 'Cloudflare Workers'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
