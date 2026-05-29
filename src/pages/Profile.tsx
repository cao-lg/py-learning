import { useState, useEffect } from 'react';
import { storage } from '../store/idb';

export default function Profile() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dataInfo, setDataInfo] = useState<{
    practiceCount: number;
    examSessionCount: number;
  } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const loadDataInfo = async () => {
    const practiceCodes = await storage.getAllPracticeCodes();
    const data = await storage.exportAllData();
    setDataInfo({
      practiceCount: Object.keys(practiceCodes).length,
      examSessionCount: data.examSessions.length,
    });
  };

  useEffect(() => {
    loadDataInfo();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await storage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `py-learning-backup-${data.userName || 'user'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('数据导出成功！');
    } catch (error) {
      alert('导出失败：' + String(error));
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setImporting(true);
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      if (data.version !== '1.0') {
        alert('不支持的文件格式版本');
        return;
      }

      await storage.importData(data);
      alert('数据导入成功！请刷新页面');
      setShowImportModal(false);
      setImportFile(null);
      loadDataInfo();
    } catch (error) {
      alert('导入失败：' + String(error));
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('确定要清空所有本地数据吗？此操作不可恢复！')) {
      return;
    }

    try {
      await storage.clearAllData();
      alert('数据已清空，请刷新页面');
      setDataInfo(null);
    } catch (error) {
      alert('清空失败：' + String(error));
    }
  };

  const handleCopyData = async () => {
    try {
      const data = await storage.exportAllData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert('数据已复制到剪贴板！');
    } catch (error) {
      alert('复制失败：' + String(error));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        个人数据管理
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">数据概览</h2>
        <div className="flex gap-6 mb-4">
          <div className="flex-1 text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dataInfo?.practiceCount ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">练习代码数量</div>
          </div>
          <div className="flex-1 text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dataInfo?.examSessionCount ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">考试记录数量</div>
          </div>
        </div>
        <button
          onClick={loadDataInfo}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          刷新统计
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">数据导出</h2>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">导出说明</h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            导出的文件包含您的所有练习代码、考试草稿和考试记录，可以迁移到其他设备使用。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? '导出中...' : '导出为文件'}
          </button>
          <button
            onClick={handleCopyData}
            disabled={exporting}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            复制到剪贴板
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">数据导入</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">导入说明</h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            导入之前导出的JSON文件，将覆盖当前设备上的所有数据。请确保已备份当前数据。
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          导入数据
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">数据管理</h2>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">危险操作</h3>
          <p className="text-sm text-red-800 dark:text-red-300">
            以下操作将永久删除所有本地数据，请谨慎操作。
          </p>
        </div>
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          清空所有数据
        </button>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">导入数据</h2>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full mb-4 text-gray-900 dark:text-white"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? '导入中...' : '确认导入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
