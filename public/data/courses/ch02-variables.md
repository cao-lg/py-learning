# 变量和数据类型

<div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 mb-6">
  <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">📖 章节导学</h3>
  <p class="text-gray-600 dark:text-gray-300">变量是编程的基础，用于存储和操作数据。本章将介绍 Python 的基本数据类型和如何声明使用变量。</p>
</div>

## 什么是变量？

变量是存储数据的**容器**，类似于数学中的未知数 x，但可以存储任何类型的数据。

```
┌─────────────┐         ┌─────────────────────┐
│   变量名     │   ───   │      值             │
│   name      │   =     │      "Alice"        │
└─────────────┘         └─────────────────────┘
      ↑                        ↑
    标签                   实际存储的数据
```

## 变量命名规则

```python
# 合法的变量名
name = "Alice"
age = 20
_name = "Bob"          # 可以用下划线开头
userName = "Charlie"  # 驼峰命名法
user_name = "David"    # 下划线命名法

# ⚠️ 非法的变量名（会报错）
# 2name = "Test"      # 不能以数字开头
# my-name = "Test"    # 不能使用连字符
# my name = "Test"    # 不能包含空格
```

> 💡 **命名建议**：变量名应具有描述性，让人一眼就能看出变量的用途。

## 基本数据类型

Python 有 6 种基本数据类型：

| 类型 | 示例 | 说明 |
|------|------|------|
| `str` | `"Hello"` | 字符串（文本） |
| `int` | `42` | 整数 |
| `float` | `3.14` | 浮点数（小数） |
| `bool` | `True` / `False` | 布尔值 |
| `list` | `[1, 2, 3]` | 列表 |
| `dict` | `{"name": "Alice"}` | 字典 |

### 字符串 (str)

```python
# 创建字符串
name = "Alice"
greeting = 'Hello'

# 多行字符串
text = """这是一个
可以跨多行的
字符串"""

# 字符串拼接
full_name = "Alice" + " " + "Smith"  # "Alice Smith"

# 字符串重复
echo = "Ha" * 3  # "HaHaHa"

# 字符串长度
length = len("Python")  # 6
```

### 整数 (int)

```python
# 基本运算
a = 10
b = 3

print(a + b)   # 13 加法
print(a - b)   # 7  减法
print(a * b)   # 30 乘法
print(a / b)   # 3.333... 除法（总是返回浮点数）
print(a // b)  # 3  整除
print(a % b)   # 1  取余
print(a ** b)  # 1000 幂运算
```

### 浮点数 (float)

```python
# 浮点数运算
pi = 3.14159
radius = 5

area = pi * radius ** 2  # 78.53975

# 四舍五入
round(area, 2)  # 78.54
```

### 布尔值 (bool)

```python
# 布尔值只有两个：True 和 False
is_student = True
is_raining = False

# 布尔运算
print(True and False)   # False  与
print(True or False)    # True   或
print(not True)         # False  非
```

## 类型转换

不同类型之间可以相互转换：

```python
# 转换为整数
int("42")        # 42
int(3.14)        # 3
int(True)        # 1

# 转换为浮点数
float("3.14")    # 3.14
float(42)        # 42.0

# 转换为字符串
str(42)          # "42"
str(3.14)        # "3.14"

# 转换为布尔值
bool(0)          # False
bool(1)          # True
bool("")         # False
bool("hello")    # True
```

## 变量赋值与更新

```python
# 多次赋值
x = 10
print(x)  # 10

x = 20
print(x)  # 20

# 增量赋值
count = 0
count += 1    # 等同于 count = count + 1
count *= 2    # 等同于 count = count * 2
```

## 常量约定

Python 没有真正的常量，但约定用全大写表示不应改变的量：

```python
MAX_SIZE = 100
PI = 3.14159
```

---

<div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 mt-8">
  <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">📝 随堂练习</h3>
  <p class="text-gray-600 dark:text-gray-300 mb-3">学完本章内容，来检验一下学习成果吧！</p>
  <p class="text-gray-600 dark:text-gray-300">前往 <a href="/practice/ch02_variables" class="text-purple-600 hover:text-purple-700 font-medium">练习页面</a> 完成以下任务：</p>
  <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 mt-2 space-y-1">
    <li><strong>变量存储</strong> - 创建变量存储你的名字和年龄</li>
    <li><strong>类型识别</strong> - 判断不同值的类型</li>
    <li><strong>温度转换</strong> - 将摄氏温度转换为华氏温度</li>
  </ul>
</div>

---

**[下一章预告]** → 运算符：学习算术、比较和逻辑运算
