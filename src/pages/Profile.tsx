import { useState } from 'react';
import { storage, type ExportData } from '../store/idb';
import { Button, Card, Alert, Typography, Space, message } from 'antd';
import { DownloadOutlined, UploadOutlined, TrashOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
      message.success('数据导出成功！');
    } catch (error) {
      message.error('导出失败：' + String(error));
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
      const data: ExportData = JSON.parse(text);
      
      if (data.version !== '1.0') {
        message.error('不支持的文件格式版本');
        return;
      }

      await storage.importData(data);
      message.success('数据导入成功！请刷新页面');
      setShowImportModal(false);
      setImportFile(null);
      loadDataInfo();
    } catch (error) {
      message.error('导入失败：' + String(error));
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('确定要清空所有本地数据吗？此操作不可恢复！')) {
      return;
    }

    try {
      await storage.clearAllData();
      message.success('数据已清空，请刷新页面');
      setDataInfo(null);
    } catch (error) {
      message.error('清空失败：' + String(error));
    }
  };

  const handleCopyData = async () => {
    try {
      const data = await storage.exportAllData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      message.success('数据已复制到剪贴板！');
    } catch (error) {
      message.error('复制失败：' + String(error));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        <UserOutlined /> 个人数据管理
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>数据概览</Title>
        <Space size="large" style={{ marginBottom: 24 }}>
          <div className="stat-item">
            <Text strong style={{ fontSize: 24, color: '#1890ff' }}>
              {dataInfo?.practiceCount ?? 0}
            </Text>
            <Paragraph style={{ margin: 0, color: '#666' }}>练习代码数量</Paragraph>
          </div>
          <div className="stat-item">
            <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
              {dataInfo?.examSessionCount ?? 0}
            </Text>
            <Paragraph style={{ margin: 0, color: '#666' }}>考试记录数量</Paragraph>
          </div>
        </Space>
        <Button type="link" onClick={loadDataInfo}>
          刷新统计
        </Button>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>数据导出</Title>
        <Alert
          message="导出说明"
          description="导出的文件包含您的所有练习代码、考试草稿和考试记录，可以迁移到其他设备使用。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            导出为文件
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={handleCopyData}
            disabled={exporting}
          >
            复制到剪贴板
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>数据导入</Title>
        <Alert
          message="导入说明"
          description="导入之前导出的JSON文件，将覆盖当前设备上的所有数据。请确保已备份当前数据。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => setShowImportModal(true)}
        >
          导入数据
        </Button>
      </Card>

      <Card>
        <Title level={3}>数据管理</Title>
        <Alert
          message="危险操作"
          description="以下操作将永久删除所有本地数据，请谨慎操作。"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button
          danger
          icon={<TrashOutlined />}
          onClick={handleClearData}
        >
          清空所有数据
        </Button>
      </Card>

      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowImportModal(false)}>
          <Card style={{ width: 400, background: '#fff' }} onClick={e => e.stopPropagation()}>
            <Title level={3}>导入数据</Title>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ marginBottom: 16 }}
            />
            <Space>
              <Button
                type="primary"
                onClick={handleImport}
                loading={importing}
                disabled={!importFile}
              >
                确认导入
              </Button>
              <Button onClick={() => setShowImportModal(false)}>
                取消
              </Button>
            </Space>
          </Card>
        </div>
      )}

      <style>{`
        .stat-item {
          text-align: center;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
          min-width: 150px;
        }
      `}</style>
    </div>
  );
}