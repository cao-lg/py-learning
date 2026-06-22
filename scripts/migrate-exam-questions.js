#!/usr/bin/env node
/**
 * 迁移脚本：将考试JSON数据导入D1数据库
 * 运行方式：node scripts/migrate-exam-questions.js
 */

const fs = require('fs');
const path = require('path');
const { D1Database } = require('@cloudflare/workers-types');

// 考试JSON文件目录
const EXAM_DATA_DIR = path.join(__dirname, '../public/data/exam');

// 获取所有考试JSON文件
function getExamFiles() {
  const files = fs.readdirSync(EXAM_DATA_DIR);
  return files
    .filter(f => f.endsWith('.json') && f !== '_index.json')
    .map(f => path.join(EXAM_DATA_DIR, f));
}

// 解析版本号（从文件名或内容中）
function getVersion(filename, data) {
  if (filename.includes('_A.json') || data.version === 'A') return 'A';
  if (filename.includes('_B.json') || data.version === 'B') return 'B';
  if (filename.includes('_C.json') || data.version === 'C') return 'C';
  return null;
}

// 生成唯一ID
function generateId(examId, questionId, version) {
  const versionSuffix = version ? `_${version}` : '';
  return `${examId}_${questionId}${versionSuffix}`;
}

// 转换题目数据
function transformQuestion(examId, question, version = null) {
  const questionId = question.id;
  const id = generateId(examId, questionId, version);

  // 处理 testConfig
  const testConfig = {
    timeout_ms: question.testConfig?.timeout_ms || 5000,
    weight: question.testConfig?.weight || 1
  };

  // 处理 hints
  const hints = question.hints ? JSON.stringify(question.hints) : null;

  // 处理 mockInputs
  const mockInputs = question.testConfig?.mockInputs
    ? JSON.stringify(question.testConfig.mockInputs)
    : null;

  // 处理 hiddenCases
  const hiddenCases = question.testConfig?.hiddenCases
    ? JSON.stringify(question.testConfig.hiddenCases)
    : null;

  return {
    id,
    exam_id: examId,
    question_id: questionId,
    version,
    type: question.type,
    title: question.title,
    instruction: question.instruction,
    initial_code: question.initialCode || '',
    expected: question.testConfig?.expected || null,
    mock_inputs: mockInputs,
    hidden_cases: hiddenCases,
    hints,
    test_config: JSON.stringify(testConfig),
    score: question.testConfig?.weight || 10,
    created_at: Date.now()
  };
}

// 主迁移函数
async function migrate() {
  console.log('🚀 开始迁移考试数据到D1...\n');

  const examFiles = getExamFiles();
  console.log(`📁 找到 ${examFiles.length} 个考试文件\n`);

  const allQuestions = [];
  const errors = [];

  for (const file of examFiles) {
    const filename = path.basename(file);
    console.log(`📖 处理文件: ${filename}`);

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const examData = JSON.parse(content);

      const examId = examData.id;
      const version = getVersion(filename, examData);

      console.log(`   - 考试ID: ${examId}`);
      console.log(`   - 版本: ${version || '单一'}`);
      console.log(`   - 题目数: ${examData.questions?.length || 0}`);

      if (examData.questions) {
        for (const question of examData.questions) {
          const transformed = transformQuestion(examId, question, version);
          allQuestions.push(transformed);
        }
      }

      console.log(`   ✅ 成功处理\n`);
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}\n`);
      errors.push({ file: filename, error: error.message });
    }
  }

  console.log('='.repeat(50));
  console.log(`📊 迁移统计:`);
  console.log(`   - 总题目数: ${allQuestions.length}`);
  console.log(`   - 错误文件: ${errors.length}`);
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n❌ 错误详情:');
    errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
  }

  // 生成SQL插入语句
  if (allQuestions.length > 0) {
    console.log('\n📝 生成SQL语句...');

    const sqlStatements = allQuestions.map(q => {
      return `INSERT OR REPLACE INTO exam_questions (
        id, exam_id, question_id, version, type, title, instruction,
        initial_code, expected, mock_inputs, hidden_cases, hints,
        test_config, score, created_at
      ) VALUES (
        '${q.id}',
        '${q.exam_id}',
        '${q.question_id}',
        ${q.version ? `'${q.version}'` : 'NULL'},
        '${q.type}',
        '${q.title.replace(/'/g, "''")}',
        '${q.instruction.replace(/'/g, "''")}',
        '${q.initial_code.replace(/'/g, "''")}',
        ${q.expected ? `'${q.expected.replace(/'/g, "''")}'` : 'NULL'},
        ${q.mock_inputs ? `'${q.mock_inputs.replace(/'/g, "''")}'` : 'NULL'},
        ${q.hidden_cases ? `'${q.hidden_cases.replace(/'/g, "''")}'` : 'NULL'},
        ${q.hints ? `'${q.hints.replace(/'/g, "''")}'` : 'NULL'},
        '${q.test_config.replace(/'/g, "''")}',
        ${q.score},
        ${q.created_at}
      );`;
    });

    // 输出SQL文件
    const sqlOutput = sqlStatements.join('\n');
    const sqlFile = path.join(__dirname, '../migrations/0003_exam_questions_data.sql');

    // 添加表创建语句
    const tableCreation = fs.readFileSync(
      path.join(__dirname, '../migrations/0003_exam_questions.sql'),
      'utf-8'
    );

    fs.writeFileSync(sqlFile, `${tableCreation}\n\n-- Exam questions data\n${sqlOutput}`);
    console.log(`✅ SQL文件已生成: ${sqlFile}`);

    // 同时输出JSON格式的数据（供API使用）
    const jsonOutput = path.join(__dirname, '../migrations/exam_questions_data.json');
    fs.writeFileSync(jsonOutput, JSON.stringify(allQuestions, null, 2));
    console.log(`✅ JSON数据已生成: ${jsonOutput}`);
  }

  console.log('\n✨ 迁移完成！');
  console.log('\n下一步:');
  console.log('1. 运行 wrangler d1 execute py-learning-db --file=migrations/0003_exam_questions.sql');
  console.log('2. 部署更新后的API');
}

// 运行迁移
migrate().catch(console.error);
