import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { FloatingCodeRunner } from '../components/FloatingCodeRunner';

interface Chapter {
  id: string;
  title: string;
  order: number;
  path: string;
  duration?: string;
  objectives?: string[];
}

interface CourseIndex {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

export function LearnPage() {
  const { courseId, chapterId } = useParams<{ courseId?: string; chapterId?: string }>();
  const [courseIndex, setCourseIndex] = useState<CourseIndex | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState<Record<string, boolean>>({});

  const resolvedCourseId = courseId || 'python-basics';

  const loadCourseIndex = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/data/courses/${resolvedCourseId}.json`);
      if (!response.ok) throw new Error('Failed to load course');
      const data: CourseIndex = await response.json();
      setCourseIndex(data);
      setChapters(data.chapters.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [resolvedCourseId]);

  const loadChapter = useCallback(async (chapter: Chapter) => {
    setCurrentChapter(chapter);
    try {
      const response = await fetch(`/data/courses/${chapter.path}`);
      if (response.ok) {
        const text = await response.text();
        setContent(text);
        setReadProgress(prev => ({ ...prev, [chapter.id]: true }));
      }
    } catch (e) {
      console.error('Failed to load chapter:', e);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadCourseIndex();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [loadCourseIndex]);

  useEffect(() => {
    if (courseIndex && chapters.length > 0) {
      const targetChapter = chapterId 
        ? chapters.find(c => c.id === chapterId) 
        : chapters[0];
      if (targetChapter) {
        /* eslint-disable react-hooks/set-state-in-effect */
        loadChapter(targetChapter);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    }
  }, [courseIndex, chapters, chapterId, loadChapter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!courseIndex) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">课程加载失败</p>
        <Link to="/" className="btn btn-primary mt-4 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  const completedCount = Object.values(readProgress).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / chapters.length) * 100);

  const sidebarContent = (
    <aside className="w-80 flex-shrink-0 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">📚</span>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">{courseIndex.title}</h2>
            <p className="text-white/80 text-sm">{courseIndex.description}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-white/90 text-sm mb-1">
            <span>学习进度</span>
            <span>{completedCount}/{chapters.length} 章节</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
          课程章节
        </h3>
        <nav className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = currentChapter?.id === chapter.id;
            const isDone = readProgress[chapter.id];
            return (
              <button
                key={chapter.id}
                onClick={() => loadChapter(chapter)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800'
                  }`}>
                    {isDone ? '✓' : chapter.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      isActive ? 'text-purple-700 dark:text-purple-300' : ''
                    }`}>
                      {chapter.title}
                    </p>
                    {chapter.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        ⏱ {chapter.duration}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );

  const chapterContent = currentChapter ? (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 px-8 py-6 text-white">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/learn" className="hover:text-purple-400 transition-colors">课程</Link>
          <span>/</span>
          <span className="text-purple-400">第{currentChapter.order}章</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">{currentChapter.title}</h1>
        <div className="flex items-center gap-4">
          {currentChapter.duration && (
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              <span>⏱</span> {currentChapter.duration}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-gray-300">
            <span>📖</span> 预计阅读
          </span>
        </div>
        {currentChapter.objectives && currentChapter.objectives.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-purple-300 mb-2">学习目标</p>
            <div className="flex flex-wrap gap-2">
              {currentChapter.objectives.map((obj, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-gray-200">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-8">
        <article className="prose prose-lg dark:prose-invert max-w-none text-left
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:text-left
          prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
          prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:shadow-lg
          prose-blockquote:border-l-purple-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-1
          prose-ul:my-4 prose-li:text-gray-600 dark:prose-li:text-gray-300
          prose-strong:text-gray-900 dark:prose-strong:text-white
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              a: ({ href, children }: any) => {
                if (href?.startsWith('/')) {
                  return (
                    <Link to={href} className="text-purple-600 hover:text-purple-700 font-medium">
                      {children}
                    </Link>
                  );
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                    {children}
                  </a>
                );
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              code: ({ className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600 dark:text-purple-400" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {chapters.find(c => c.order === currentChapter.order - 1) && (
                <button
                  onClick={() => loadChapter(chapters.find(c => c.order === currentChapter.order - 1)!)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <span>←</span> 上一章
                </button>
              )}
            </div>
            {chapters.find(c => c.order === currentChapter.order + 1) && (
              <button
                onClick={() => loadChapter(chapters.find(c => c.order === currentChapter.order + 1)!)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                下一章 <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        选择一个章节开始学习
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        点击左侧列表中的章节开始学习
      </p>
    </div>
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {sidebarContent}
      <main className="flex-1 overflow-y-auto">
        {chapterContent}
      </main>
      <FloatingCodeRunner />
    </div>
  );
}
