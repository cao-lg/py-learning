# 字符串处理

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>字符串是 Python 中最常用的数据类型之一。本章学习字符串的常用操作和方法。</p>
</div>

## 字符串基本操作

```python
# 字符串连接
s1 = "Hello"
s2 = "World"
print(s1 + " " + s2)  # "Hello World"

# 字符串重复
print("-" * 20)  # "--------------------"

# 字符串长度
print(len("Python"))  # 6

# 字符串索引
s = "Python"
print(s[0])   # 'P'
print(s[-1])  # 'n'
```

## 字符串切片

```python
s = "Hello, World!"

print(s[0:5])      # "Hello"（索引 0-4）
print(s[7:12])     # "World"
print(s[:5])       # "Hello"（从头开始）
print(s[7:])       # "World!"（到末尾）
print(s[::2])       # "Hlo ol!"（步长为2）
print(s[::-1])      # "!dlroW ,olleH"（反转）
```

## 字符串方法

```python
s = "  Hello, World!  "

# 大小写转换
s.upper()          # "  HELLO, WORLD!  "
s.lower()          # "  hello, world!  "
s.capitalize()     # "  hello, world!  "（首字母大写）
s.title()          # "  Hello, World!  "（每个词首字母大写）
s.swapcase()       # "  hELLO, wORLD!  "

# 去除空白
s.strip()          # "Hello, World!"（去除两端）
s.lstrip()          # "Hello, World!  "（去除左端）
s.rstrip()          # "  Hello, World!"（去除右端）

# 查找和替换
s.find("World")     # 9（找不到返回 -1）
s.count("o")        # 2（计数）
s.replace("World", "Python")  # "  Hello, Python!  "

# 分割和连接
s = "apple,banana,orange"
s.split(",")        # ['apple', 'banana', 'orange']
words = ["Hello", "World"]
"-".join(words)     # "Hello-World"
```

## 字符串格式化

```python
name = "Alice"
age = 20

# f-string（推荐）
print(f"My name is {name}, I'm {age} years old.")

# format() 方法
print("My name is {}, I'm {} years old.".format(name, age))
print("My name is {0}, I'm {1} years old. {0} is my name.".format(name, age))

# % 运算符（旧式）
print("My name is %s, I'm %d years old." % (name, age))
```

## 字符串判断

```python
s = "Hello123"

s.isdigit()      # False（是否全是数字）
s.isalpha()      # False（是否全是字母）
s.isalnum()      # True（是否全是字母或数字）
s.isupper()      # False（是否全是大写）
s.islower()      # False（是否全是小写）
s.isspace()      # False（是否全是空白）
s.startswith("Hello")  # True
s.endswith("123")      # True
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch07_strings) 完成以下任务：

1. **字符串切片** - 提取字符串中的子串
2. **词频统计** - 统计一段文字中每个词出现的次数
3. **格式转换** - 将用户输入的名字格式化为"姓.名"的形式

---

**[下一章预告]** → 文件操作：读写文件和 JSON 数据处理
