# 验证逻辑深度分析报告

## 发现的问题

### 问题1：练习模式下验证结果不完整

**问题描述：**
- 在 `evaluateOutput`、`evaluateInteractive`、`evaluateFunction` 函数中，当验证通过时，只返回 passed:true，没有在 details 中包含 expected 和 actual
- 练习页面应该展示完整的验证过程，让用户看到期望输出和实际输出的对比

**问题代码：**
在 `pyodide-executor.ts` 中：
```typescript
if (matched) {
  return {
    passed: true,
    score: config.weight ?? 1,
    message: 'All test cases passed!'
  };
}
```

### 问题2：没有明确的考试/练习模式区分

**问题描述：**
- 验证逻辑通过是否有 examId 来区分，但不够明确
- 练习模式应该展示完整的验证信息，考试模式应该隐藏期望输出

### 问题3：Terminal 组件展示逻辑有限

**问题描述：**
- Terminal 组件只在 details.expected 和 details.actual 存在时才展示
- 应该更明确地控制展示内容
