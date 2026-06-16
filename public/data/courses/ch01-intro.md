# Python 简介

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>Python 是一门简洁、优雅且功能强大的编程语言。本章将介绍 Python 的历史、特点、安装方法以及基本语法，帮助你快速入门。</p>
</div>

## Python 的历史与特点

### 发展历史

Python 由 **Guido van Rossum**（吉多·范罗苏姆）于 1989 年底发明，1991 年首次发布：

- **Python 2.x**：2000 年发布，2020 年停止支持
- **Python 3.x**：2008 年发布，当前主流版本（推荐使用 3.10+）

> 💡 **为什么叫 Python？** 作者喜欢英国喜剧团体 Monty Python，故以此命名。

### Python 的核心特点

| 特点 | 说明 |
|-----|------|
| **简洁易读** | 语法清晰，接近自然语言，代码可读性高 |
| **跨平台** | 支持 Windows、Linux、Mac 等主流操作系统 |
| **丰富的库** | 拥有海量第三方库，覆盖 Web、AI、数据分析等领域 |
| **动态类型** | 变量无需声明类型，灵活方便 |
| **解释执行** | 无需编译，直接运行，开发效率高 |
| **面向对象** | 完整支持 OOP，代码组织更清晰 |

### Python 的应用领域

```text
🌐 Web 开发      → Django, Flask, FastAPI
🤖 人工智能      → TensorFlow, PyTorch, scikit-learn
📊 数据分析      → Pandas, NumPy, Matplotlib
🔧 自动化运维    → Ansible, SaltStack
🎮 游戏开发      → Pygame
📱 桌面应用      → PyQt, Tkinter
🔬 科学计算      → SciPy, SymPy
```

---

## 安装 Python

### Windows 安装

1. 访问 [python.org](https://www.python.org/downloads/)
2. 下载最新版本安装包
3. **勾选 "Add Python to PATH"**（重要！）
4. 点击 Install Now

### Linux/Mac 安装

```bash
# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip

# Mac (使用 Homebrew)
brew install python3
```

### 验证安装

```bash
# 查看版本
python --version    # 或 python3 --version

# 查看安装路径
where python        # Windows
which python3       # Linux/Mac
```

---

## Python 开发工具

### 推荐的 IDE/编辑器

| 工具 | 特点 | 适用场景 |
|-----|------|---------|
| **VS Code** | 免费、轻量、插件丰富 | 通用开发（推荐） |
| **PyCharm** | 专业、功能强大 | 大型项目开发 |
| **Jupyter Notebook** | 交互式编程 | 数据分析、教学 |
| **IDLE** | Python 自带 | 初学者入门 |
| **Thonny** | 简单易用 | 教学场景 |

### VS Code 推荐插件

```text
✅ Python (Microsoft)      - 核心插件
✅ Pylance                 - 智能代码补全
✅ Python Indent           - 自动缩进
✅ autoDocstring           - 自动生成文档字符串
✅ Code Runner             - 快速运行代码
```

---

## 第一个 Python 程序

### Hello World

```python
# 第一个 Python 程序
print("Hello, World!")
```

### 程序解析

```python
print("Hello, World!")
# ↓
# print  → 函数名（打印输出）
# ()     → 函数调用
# "..."  → 字符串（用双引号或单引号包裹）
# Hello, World! → 字符串内容
```

### 多种输出方式

```python
# 基本输出
print("Hello, World!")

# 输出多个内容
print("Hello", "World", "!")  # Hello World !

# 使用分隔符
print("2024", "01", "15", sep="-")  # 2024-01-15

# 使用结尾符
print("Loading...", end=" ")
print("Done!")  # Loading... Done!

# 输出到文件
with open("output.txt", "w") as f:
    print("Hello, File!", file=f)
```

---

## 注释

注释是代码中的说明文字，不会被执行。

### 单行注释

```python
# 这是单行注释
print("Hello")  # 注释也可以写在代码后面
```

### 多行注释

```python
"""
这是多行注释
可以写很多行
通常用于函数或类的文档说明
"""

'''
单引号也可以
用于多行注释
'''
```

### 注释的最佳实践

```python
# ❌ 不好的注释（废话）
x = x + 1  # x 加 1

# ✅ 好的注释（解释原因）
x = x + 1  # 补偿边界偏移，见算法文档第 3.2 节

# ✅ 好的注释（复杂逻辑说明）
# 使用二分查找优化搜索效率，时间复杂度 O(log n)
def binary_search(arr, target):
    ...
```

---

## 基本语法规则

### 缩进（重要！）

Python 使用缩进表示代码块，**必须统一**：

```python
# ✅ 正确：使用 4 个空格（推荐）
if True:
    print("Yes")
    print("Indent matters")

# ❌ 错误：混用空格和 Tab
if True:
    print("Yes")  # 4 空格
	print("No")   # Tab（会报错！）

# ❌ 错误：缩进不一致
if True:
  print("Yes")    # 2 空格
    print("No")   # 4 空格（会报错！）
```

> ⚠️ **重要**：Python 强制要求缩进一致，推荐使用 **4 个空格**。

### 语句换行

```python
# 长语句可以换行
result = (100 + 200 + 300 +
          400 + 500 + 600)

# 使用反斜杠换行（不推荐）
total = 100 + 200 + 300 \
        + 400 + 500 + 600

# 在括号内换行（推荐）
names = [
    "Alice",
    "Bob",
    "Charlie"
]
```

### 多语句同行

```python
# 使用分号分隔（不推荐）
x = 1; y = 2; z = 3

# 推荐分开写
x = 1
y = 2
z = 3
```

---

## 编码规范（PEP 8）

### 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 变量 | 小写 + 下划线 | `user_name`, `total_count` |
| 函数 | 小写 + 下划线 | `get_data()`, `calculate_sum()` |
| 类 | 驼峰命名 | `MyClass`, `HttpRequest` |
| 常量 | 全大写 + 下划线 | `MAX_SIZE`, `PI` |
| 私有属性 | 单下划线前缀 | `_private_var` |

### 代码风格

```python
# ✅ 好的风格
def calculate_average(numbers):
    """计算平均值"""
    if not numbers:
        return 0
    
    total = sum(numbers)
    count = len(numbers)
    return total / count


# ❌ 不好的风格
def calc_avg(n):
    if not n: return 0
    t=sum(n);c=len(n)
    return t/c
```

### 空行规范

```python
# 类之间：2 个空行
class Person:
    pass


class Student:
    pass


# 方法之间：1 个空行
class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
```

---

## 输入与输出

### input() 函数

```python
# 基本输入
name = input("请输入姓名：")
print(f"你好，{name}！")

# 输入数字（需要转换）
age = int(input("请输入年龄："))
height = float(input("请输入身高（米）："))

# 输入多个值
a, b = input("输入两个数（空格分隔）：").split()
a, b = int(a), int(b)
```

### 格式化输出

```python
name = "Alice"
age = 20
score = 95.5

# f-string（推荐，Python 3.6+）
print(f"姓名：{name}, 年龄：{age}, 成绩：{score}")
print(f"成绩保留两位：{score:.2f}")  # 95.50

# format() 方法
print("姓名：{}, 年龄：{}".format(name, age))
print("姓名：{0}, 年龄：{1}, {0}很优秀".format(name, age))

# % 格式化（旧式，不推荐）
print("姓名：%s, 年龄：%d" % (name, age))
```

---

## 常见错误与调试

### 常见错误类型

```python
# SyntaxError - 语法错误
print("Hello"  # 缺少右括号

# NameError - 变量未定义
print(unknown_var)

# TypeError - 类型错误
"hello" + 123  # 字符串不能和数字相加

# IndentationError - 缩进错误
if True:
print("Yes")  # 缺少缩进
```

### 调试技巧

```python
# 使用 print 调试
def calculate(x, y):
    print(f"调试：x={x}, y={y}")  # 调试信息
    result = x * y + 10
    print(f"调试：result={result}")  # 调试信息
    return result

# 使用 assert 断言
def divide(a, b):
    assert b != 0, "除数不能为零"  # 条件检查
    return a / b

# 使用 try-except 捕获错误
try:
    result = risky_operation()
except Exception as e:
    print(f"错误：{e}")
```

---

## Python 执行方式

### 交互式模式

```bash
$ python
>>> print("Hello")
Hello
>>> 2 + 3
5
>>> exit()  # 退出
```

### 脚本文件执行

```bash
# 创建 hello.py
print("Hello, World!")

# 执行
python hello.py
```

### 直接执行（Linux/Mac）

```python
#!/usr/bin/env python3
# hello.py

print("Hello, World!")
```

```bash
chmod +x hello.py
./hello.py
```

---

## 实用技巧

### 查看帮助

```python
# 查看函数帮助
help(print)

# 查看对象的方法
dir("hello")  # 返回字符串的所有方法

# 查看类型
type(123)     # <class 'int'>
type("hello") # <class 'str'>
```

### 常用内置函数

```python
# 数学相关
abs(-5)       # 5（绝对值）
max(1, 2, 3)  # 3（最大值）
min(1, 2, 3)  # 1（最小值）
sum([1, 2, 3])# 6（求和）
pow(2, 10)    # 1024（幂运算）

# 类型转换
int("123")    # 123
float("3.14") # 3.14
str(123)      # "123"
list("abc")   # ['a', 'b', 'c']

# 其他常用
len("hello")  # 5（长度）
round(3.14159, 2)  # 3.14（四舍五入）
sorted([3, 1, 2])  # [1, 2, 3]（排序）
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch01_basics) 完成以下任务：

1. **Hello World** - 输出你的第一个 Python 程序
2. **多行输出** - 使用一条 print 输出多行内容
3. **表达式计算** - 计算数学表达式的结果
4. **格式化输出** - 使用 f-string 格式化输出

---

## 📚 扩展阅读

- [Python 官方文档](https://docs.python.org/zh-cn/3/)
- [PEP 8 编码规范](https://pep8.org/)
- [Python 教程 - 廖雪峰](https://www.liaoxuefeng.com/wiki/1016959663602400)

---

**[下一章预告]** → 变量和数据类型：深入理解 Python 的数据类型系统