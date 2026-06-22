#!/usr/bin/env node
/**
 * 为考试题添加隐藏测试用例
 * 运行方式：node scripts/add-hidden-cases.js
 */

const fs = require('fs');
const path = require('path');

// 考试JSON文件目录
const EXAM_DATA_DIR = path.join(__dirname, '../public/data/exam');

// 定义隐藏测试用例生成规则
const hiddenTestCaseRules = {
  // 输出题：根据已有expected生成不同变体
  output: (question, existingExpected) => {
    const hiddenCases = [];
    
    // 简单输出题：生成1-2个不同的期望输出
    if (existingExpected && existingExpected.length < 100) {
      // 可以添加一些边界测试
      if (existingExpected.includes('Hello')) {
        hiddenCases.push({ expected: 'World' });
      }
    }
    
    return hiddenCases;
  },
  
  // 交互题：生成不同输入序列
  interactive: (question) => {
    const hiddenCases = [];
    const mockInputs = question.testConfig?.mockInputs || [];
    
    // 为交互题生成不同的输入序列
    if (mockInputs.length > 0) {
      // 生成一个简单的测试用例
      const firstInput = mockInputs[0];
      if (typeof firstInput === 'string' && firstInput.length > 0) {
        // 可以添加边界输入
      }
    }
    
    return hiddenCases;
  },
  
  // 函数题：添加更多测试参数
  function: (question) => {
    const hiddenCases = [];
    const mockInputs = question.testConfig?.mockInputs || [];
    
    // 函数题可以添加更多测试用例
    if (mockInputs.length > 0 && mockInputs.length < 5) {
      // 根据已有测试用例生成类似的边界测试
      const firstCase = mockInputs[0];
      if (firstCase && firstCase.expected) {
        // 添加一个边界测试用例
        if (typeof firstCase.args === 'object' && Array.isArray(firstCase.args)) {
          const newArgs = firstCase.args.map(arg => {
            if (typeof arg === 'number') return arg + 1;
            if (typeof arg === 'string') return arg.length > 0 ? arg[0] : '';
            return arg;
          });
          hiddenCases.push({
            expected: firstCase.expected // 简化处理
          });
        }
      }
    }
    
    return hiddenCases;
  }
};

// 处理单个题目
function addHiddenCasesToQuestion(question) {
  const existingExpected = question.testConfig?.expected;
  const questionType = question.type;
  
  // 根据题目类型添加隐藏测试用例
  if (hiddenTestCaseRules[questionType]) {
    const hiddenCases = hiddenTestCaseRules[questionType](question, existingExpected);
    
    if (hiddenCases.length > 0) {
      question.testConfig.hiddenCases = hiddenCases;
      return true;
    }
  }
  
  return false;
}

// 处理单个考试文件
function processExamFile(filePath) {
  const filename = path.basename(filePath);
  console.log(`📁 处理文件: ${filename}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const examData = JSON.parse(content);
    
    if (!examData.questions || !Array.isArray(examData.questions)) {
      console.log(`   ⚠️ 跳过：没有questions数组`);
      return { total: 0, added: 0 };
    }
    
    let added = 0;
    
    for (const question of examData.questions) {
      if (addHiddenCasesToQuestion(question)) {
        added++;
      }
    }
    
    if (added > 0) {
      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(examData, null, 2));
      console.log(`   ✅ 添加了 ${added} 个隐藏测试用例`);
    } else {
      console.log(`   ℹ️ 没有添加新的隐藏测试用例`);
    }
    
    return { total: examData.questions.length, added };
    
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    return { total: 0, added: 0, error: error.message };
  }
}

// 主函数
async function main() {
  console.log('🔍 开始分析考试题目的隐藏测试用例...\n');
  
  const files = fs.readdirSync(EXAM_DATA_DIR)
    .filter(f => f.endsWith('.json') && f !== '_index.json')
    .map(f => path.join(EXAM_DATA_DIR, f));
  
  let totalQuestions = 0;
  let totalAdded = 0;
  
  for (const file of files) {
    const result = processExamFile(file);
    totalQuestions += result.total;
    totalAdded += result.added;
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log(`📊 统计结果:`);
  console.log(`   - 处理文件数: ${files.length}`);
  console.log(`   - 总题目数: ${totalQuestions}`);
  console.log(`   - 添加隐藏用例数: ${totalAdded}`);
  console.log('='.repeat(50));
  
  if (totalAdded > 0) {
    console.log('\n✨ 完成！已为考试题添加隐藏测试用例。');
    console.log('\n⚠️ 注意:');
    console.log('1. 建议运行迁移脚本将数据导入D1');
    console.log('2. 隐藏测试用例需要根据实际题目逻辑调整');
    console.log('3. 当前脚本生成的用例可能需要人工审核');
  }
}

// 运行
main().catch(console.error);
