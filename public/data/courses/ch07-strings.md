# 字符串处理

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>字符串是 Python 中最常用的数据类型之一。本章将全面学习字符串的创建方式、编码原理、索引切片、常用方法、格式化技巧以及正则表达式基础。</p>
</div>

## 字符串创建方式详解

### 1. 单引号和双引号

```python
# 单引号创建字符串
s1 = 'Hello World'
print(s1)  # Hello World

# 双引号创建字符串
s2 = "Hello World"
print(s2)  # Hello World

# 单引号和双引号在 Python 中功能相同
# 选择建议：根据字符串内容选择，避免过多转义
s3 = "It's a beautiful day"    # 双引号中包含单引号，无需转义
s4 = 'He said "Hello"'          # 单引号中包含双引号，无需转义

# 如果需要在同类型引号中使用相同引号，需要转义
s5 = 'It\'s a beautiful day'    # 使用转义字符
s6 = "He said \"Hello\""        # 使用转义字符
```

### 2. 三引号（多行字符串）

```python
# 三引号可以创建多行字符串
# 三个单引号
s1 = '''这是第一行
这是第二行
这是第三行'''
print(s1)

# 三个双引号
s2 = """这也是第一行
这也是第二行
这也是第三行"""
print(s2)

# 三引号保留原始格式（包括换行和缩进）
poem = """
    静夜思
    李白
床前明月光，
疑是地上霜。
"""
print(poem)

# 三引号常用于文档字符串（docstring）
def greet(name):
    """
    这是一个问候函数。
    
    参数:
        name: 用户名称
    
    返回:
        问候语字符串
    """
    return f"Hello, {name}!"
```

### 3. 转义字符详解

```python
# 常用转义字符
print("Hello\nWorld")       # \n - 换行
print("Hello\tWorld")       # \t - 制表符（Tab）
print("Hello\\World")       # \\ - 反斜杠
print("Hello\"World")       # \" - 双引号
print("Hello\'World")       # \' - 单引号
print("Hello\rWorld")       # \r - 回车（光标移到行首）
print("Hello\bWorld")       # \b - 退格

# 原始字符串（raw string）- 不转义
# 在字符串前加 r 或 R
path = r"C:\Users\name\Documents"
print(path)  # C:\Users\name\Documents（反斜杠不会被转义）

# 原始字符串常用于正则表达式和文件路径
regex = r"\d+\.\d+"  # 匹配数字
filepath = r"D:\project\test.py"

# 注意：原始字符串不能以奇数个反斜杠结尾
# s = r"\"  # 错误！
# s = r"\\"  # 正确，两个反斜杠
```

### 4. 字符串创建的最佳实践

```python
# ✅ 推荐：根据内容选择引号类型
s1 = "It's a test"           # 包含单引号，用双引号
s2 = 'He said "yes"'         # 包含双引号，用单引号

# ✅ 推荐：多行文本使用三引号
sql = """
SELECT id, name, email
FROM users
WHERE status = 'active'
"""

# ✅ 推荐：文件路径和正则使用原始字符串
path = r"C:\Users\Documents"
pattern = r"\b\w+\b"

# ❌ 避免：不必要的转义
s3 = 'It\'s a test'          # 不推荐，应该用双引号

# ❌ 避免：在简单字符串中使用三引号
s4 = """Hello"""             # 不推荐，简单字符串用单/双引号即可
```

---

## 字符串编码详解

### 1. 编码基础知识

```python
# 计算机只能处理数字，字符需要编码为数字
# ASCII：美国信息交换标准代码，只能表示128个字符（0-127）
# Unicode：统一码，包含世界上所有字符，每个字符有唯一编号（码点）
# UTF-8：Unicode 的变长编码实现，1-4字节表示一个字符

# 查看字符的 Unicode 码点
print(ord('A'))      # 65
print(ord('中'))     # 20013
print(ord('😀'))     # 128512

# 根据码点获取字符
print(chr(65))       # 'A'
print(chr(20013))    # '中'
print(chr(128512))   # '😀'
```

### 2. encode() 和 decode() 方法

```python
# encode() - 将字符串编码为字节
s = "Hello, 世界！"

# 编码为 UTF-8（推荐，最常用）
b1 = s.encode('utf-8')
print(b1)  # b'Hello, \xe4\xb8\x96\xe7\x95\x8c\xef\xbc\x81'

# 编码为 GBK（中文编码）
b2 = s.encode('gbk')
print(b2)  # b'Hello, \xca\xc0\xbd\xe7\xa3\xa1'

# 编码为 ASCII（只能编码英文字符）
s2 = "Hello"
b3 = s2.encode('ascii')
print(b3)  # b'Hello'

# ❌ 错误：中文字符无法用 ASCII 编码
# s.encode('ascii')  # UnicodeEncodeError

# 使用 errors 参数处理编码错误
s3 = "Hello, 世界！"
# 忽略无法编码的字符
print(s3.encode('ascii', errors='ignore'))   # b'Hello, !'
# 用问号替代无法编码的字符
print(s3.encode('ascii', errors='replace'))  # b'Hello, ??!'
# 用 XML 实体替代
print(s3.encode('ascii', errors='xmlcharrefreplace'))  # b'Hello, &#19990;&#30028;&#65281;'

# decode() - 将字节解码为字符串
b = b'Hello, \xe4\xb8\x96\xe7\x95\x8c\xef\xbc\x81'
s = b.decode('utf-8')
print(s)  # Hello, 世界！

# ❌ 常见错误：编码和解码使用不同编码
# b.decode('gbk')  # 可能得到乱码或 UnicodeDecodeError
```

### 3. 字节类型（bytes）

```python
# bytes 类型 - 不可变的字节序列
b1 = b'Hello'
print(type(b1))  # <class 'bytes'>

# 创建 bytes 对象
b2 = bytes('Hello', 'utf-8')
b3 = bytes([72, 101, 108, 108, 111])  # 从整数列表创建

# bytearray 类型 - 可变的字节序列
ba = bytearray(b'Hello')
ba[0] = 74  # 可以修改
print(ba)  # bytearray(b'Jello')

# bytes 和 str 的区别
s = 'Hello'          # str 类型，Unicode 字符串
b = b'Hello'         # bytes 类型，字节序列

# str 和 bytes 转换
s_to_b = s.encode('utf-8')   # str -> bytes
b_to_s = b.decode('utf-8')    # bytes -> str
```

### 4. 编码检测与处理

```python
# 读取文件时指定编码
# with open('file.txt', 'r', encoding='utf-8') as f:
#     content = f.read()

# 写入文件时指定编码
# with open('file.txt', 'w', encoding='utf-8') as f:
#     f.write('Hello, 世界！')

# 处理编码错误
try:
    b = b'\xff\xfe'  # 无效的 UTF-8 字节
    s = b.decode('utf-8')
except UnicodeDecodeError as e:
    print(f"解码错误: {e}")
    # 尝试其他编码或使用 errors 参数
    s = b.decode('utf-8', errors='replace')
    print(s)  # 输出替换字符
```

### 5. 编码最佳实践

```python
# ✅ 推荐：统一使用 UTF-8 编码
# 在文件开头添加编码声明（Python 3 默认 UTF-8，但声明是好习惯）
# -*- coding: utf-8 -*-

# ✅ 推荐：处理文件时明确指定编码
# with open('data.txt', 'r', encoding='utf-8') as f:
#     data = f.read()

# ✅ 推荐：网络传输时使用 UTF-8
# data = "Hello, 世界！".encode('utf-8')

# ❌ 避免：在不同系统间使用不同编码
# Windows 默认 GBK，Linux/Mac 默认 UTF-8
# 可能导致乱码问题

# ❌ 避免：混用 str 和 bytes
# s = 'Hello' + b'World'  # TypeError
s = 'Hello' + b'World'.decode('utf-8')  # 正确
```

---

## 字符串索引和切片详解

### 1. 字符串索引

```python
s = "Python"

# 正向索引（从 0 开始）
#  P  y  t  h  o  n
#  0  1  2  3  4  5
print(s[0])  # 'P'
print(s[1])  # 'y'
print(s[5])  # 'n'

# 负向索引（从 -1 开始，从右往左）
#   P   y   t   h   o   n
#  -6  -5  -4  -3  -2  -1
print(s[-1])  # 'n'
print(s[-2])  # 'o'
print(s[-6])  # 'P'

# 索引图示
"""
字符串:  P   y   t   h   o   n
正向:    0   1   2   3   4   5
负向:   -6  -5  -4  -3  -2  -1
"""

# ❌ 常见错误：索引越界
# print(s[6])   # IndexError: string index out of range
# print(s[-7])  # IndexError: string index out of range

# 安全获取字符的方法
def safe_get(s, index):
    """安全获取字符串中指定索引的字符"""
    if -len(s) <= index < len(s):
        return s[index]
    return None

print(safe_get("Python", 10))  # None
```

### 2. 字符串切片

```python
s = "Hello, World!"

# 切片语法: s[start:end:step]
# start: 起始索引（包含，默认 0）
# end: 结束索引（不包含，默认 len(s)）
# step: 步长（默认 1）

# 基本切片
print(s[0:5])    # 'Hello'（索引 0-4）
print(s[7:12])   # 'World'（索引 7-11）
print(s[:5])     # 'Hello'（从头开始到索引 4）
print(s[7:])     # 'World!'（从索引 7 到末尾）
print(s[:])      # 'Hello, World!'（完整复制）

# 使用负索引切片
print(s[-6:-1])  # 'World'（索引 -6 到 -2）
print(s[-6:])    # 'World!'（从索引 -6 到末尾）
print(s[:-1])    # 'Hello, World'（去掉最后一个字符）

# 步长切片
print(s[::2])    # 'Hlo ol!'（每隔一个字符取一个）
print(s[::3])    # 'Hl r!'（每隔两个字符取一个）
print(s[1::2])   # 'el,Wrd'（从索引 1 开始，每隔一个取一个）

# 反转字符串
print(s[::-1])   # '!dlroW ,olleH'（反转）
print(s[::-2])   # '!or ,olH'（反转后每隔一个取一个）

# 切片获取子串的技巧
# 获取最后 n 个字符
def last_n_chars(s, n):
    return s[-n:] if n > 0 else s

print(last_n_chars("Python", 3))  # 'hon'

# 去掉首尾字符
def trim_first_last(s):
    return s[1:-1] if len(s) > 2 else ''

print(trim_first_last("Hello"))  # 'ell'
```

### 3. 切片的高级应用

```python
# 提取文件名和扩展名
filename = "document.pdf"
name = filename[:filename.rfind('.')]  # 'document'
ext = filename[filename.rfind('.')+1:]   # 'pdf'

# 提取 URL 的各个部分
url = "https://www.example.com/path/to/page"
protocol = url[:url.find('://')]        # 'https'
domain = url[url.find('://')+3:url.find('/', 8)]  # 'www.example.com'

# 字符串分组
s = "abcdefghij"
# 每两个字符一组
groups = [s[i:i+2] for i in range(0, len(s), 2)]
print(groups)  # ['ab', 'cd', 'ef', 'gh', 'ij']

# 隔字符取值
s = "0a1b2c3d4e5f"
numbers = s[::2]   # '012345'
letters = s[1::2]  # 'abcdef'

# 切片不会引发索引错误
s = "Python"
print(s[10:20])  # ''（空字符串，不会报错）
print(s[100:])   # ''（空字符串，不会报错）

# 利用切片实现 trim 功能
def custom_strip(s, chars=' '):
    """自定义去除首尾指定字符"""
    # 去除首部
    start = 0
    while start < len(s) and s[start] in chars:
        start += 1
    # 去除尾部
    end = len(s)
    while end > start and s[end-1] in chars:
        end -= 1
    return s[start:end]

print(custom_strip("xxHello Worldxx", 'x'))  # 'Hello World'
```

### 4. 索引和切片注意事项

```python
# ⚠️ 注意：字符串是不可变的
s = "Python"
# s[0] = 'J'  # TypeError: 'str' object does not support item assignment

# 修改字符串需要创建新字符串
s = 'J' + s[1:]  # 'Jython'

# ⚠️ 注意：切片返回新字符串，原字符串不变
s = "Hello"
new_s = s[1:4]
print(s)      # 'Hello'（原字符串不变）
print(new_s)  # 'ell'

# ✅ 最佳实践：使用切片而不是循环
# ❌ 不推荐
result = ''
for i in range(0, len(s), 2):
    result += s[i]
    
# ✅ 推荐
result = s[::2]

# ✅ 最佳实践：使用切片检查回文
def is_palindrome(s):
    """检查字符串是否为回文"""
    s = s.lower().replace(' ', '')  # 忽略大小写和空格
    return s == s[::-1]

print(is_palindrome("A man a plan a canal Panama"))  # True
```

---

## 字符串方法详解

### 1. 大小写转换方法

```python
s = "Hello, World!"

# upper() - 转换为大写
print(s.upper())        # 'HELLO, WORLD!'

# lower() - 转换为小写
print(s.lower())        # 'hello, world!'

# capitalize() - 首字母大写，其余小写
print("hello world".capitalize())   # 'Hello world'
print("HELLO WORLD".capitalize())   # 'Hello world'

# title() - 每个单词首字母大写
print("hello world".title())        # 'Hello World'
print("hello-world_test".title())   # 'Hello-World_Test'

# swapcase() - 大小写互换
print("Hello World".swapcase())     # 'hELLO wORLD'

# casefold() - 更激进的小写转换（用于国际化比较）
print("Straße".casefold())           # 'strasse'
print("Straße".lower())              # 'straße'

# ⚠️ 注意：这些方法都返回新字符串，原字符串不变
original = "Hello"
new = original.upper()
print(original)  # 'Hello'（原字符串不变）
print(new)       # 'HELLO'

# 大小写不敏感比较
s1 = "Hello"
s2 = "HELLO"
# ❌ 不推荐
if s1.lower() == s2.lower():
    print("相等")
# ✅ 推荐（处理更多国际字符）
if s1.casefold() == s2.casefold():
    print("相等")
```

### 2. 查找方法

```python
s = "Hello, World! Hello, Python!"

# find() - 从左查找，返回第一个匹配的索引，找不到返回 -1
print(s.find("Hello"))      # 0
print(s.find("World"))      # 7
print(s.find("Java"))       # -1
print(s.find("Hello", 1))   # 14（从索引 1 开始查找）

# rfind() - 从右查找，返回最后一个匹配的索引
print(s.rfind("Hello"))     # 14

# index() - 与 find() 类似，但找不到会抛出异常
print(s.index("World"))     # 7
# print(s.index("Java"))    # ValueError: substring not found

# rindex() - 从右查找，找不到抛出异常
print(s.rindex("Hello"))    # 14

# count() - 统计子串出现次数
print(s.count("Hello"))     # 2
print(s.count("o"))         # 4
print(s.count("Hello", 0, 10))  # 1（在索引 0-9 范围内统计）

# startswith() - 检查是否以指定字符串开头
print(s.startswith("Hello"))     # True
print(s.startswith("World"))      # False
print(s.startswith(("Hello", "Hi")))  # True（元组参数）

# endswith() - 检查是否以指定字符串结尾
print(s.endswith("!"))            # True
print(s.endswith("Python!"))      # True
print(s.endswith((".txt", ".pdf")))  # 检查文件扩展名

# 查找所有匹配位置
def find_all(s, sub):
    """查找子串所有出现的位置"""
    positions = []
    start = 0
    while True:
        pos = s.find(sub, start)
        if pos == -1:
            break
        positions.append(pos)
        start = pos + 1
    return positions

print(find_all("abababab", "ab"))  # [0, 2, 4, 6]
```

### 3. 替换方法

```python
s = "Hello, World! Hello, Python!"

# replace() - 替换子串
print(s.replace("Hello", "Hi"))           # 'Hi, World! Hi, Python!'
print(s.replace("Hello", "Hi", 1))        # 'Hi, World! Hello, Python!'（只替换第一个）

# replace() 常用于删除字符
print(s.replace("Hello", ""))             # ', World! , Python!'
print("Hello World".replace(" ", ""))      # 'HelloWorld'（删除空格）

# 批量替换
def multi_replace(s, replacements):
    """批量替换多个子串"""
    for old, new in replacements.items():
        s = s.replace(old, new)
    return s

text = "Hello World"
print(multi_replace(text, {"Hello": "Hi", "World": "Python"}))  # 'Hi Python'

# 使用 translate() 进行字符映射替换
# 创建转换表
table = str.maketrans("aeiou", "12345")
print("Hello World".translate(table))  # 'H2ll4 W4rld'

# 删除指定字符
table = str.maketrans("", "", "aeiou")  # 第三个参数指定要删除的字符
print("Hello World".translate(table))   # 'Hll Wrld'

# translate() 性能更好，适合大量替换
import string
# 删除所有标点符号
table = str.maketrans("", "", string.punctuation)
print("Hello, World!".translate(table))  # 'Hello World'
```

### 4. 分割和连接方法

```python
# split() - 分割字符串为列表
s = "apple,banana,orange,grape"
print(s.split(","))           # ['apple', 'banana', 'orange', 'grape']
print(s.split(",", 2))         # ['apple', 'banana', 'orange,grape']（最多分割 2 次）

# split() 默认按空白字符分割
s = "Hello   World\nPython\t\tProgramming"
print(s.split())              # ['Hello', 'World', 'Python', 'Programming']

# rsplit() - 从右边开始分割
s = "a.b.c.d"
print(s.split(".", 2))        # ['a', 'b', 'c.d']
print(s.rsplit(".", 2))       # ['a.b', 'c', 'd']

# splitlines() - 按行分割
text = "Line 1\nLine 2\nLine 3"
print(text.splitlines())      # ['Line 1', 'Line 2', 'Line 3']
print(text.splitlines(True))  # ['Line 1\n', 'Line 2\n', 'Line 3']（保留换行符）

# partition() - 分割为三部分（分隔符前、分隔符、分隔符后）
s = "Hello, World!"
print(s.partition(", "))      # ('Hello', ', ', 'World!')
print(s.partition("Python"))  # ('Hello, World!', '', '')

# rpartition() - 从右边开始分割
url = "https://www.example.com/path/to/page"
print(url.rpartition("/"))    # ('https://www.example.com/path/to', '/', 'page')

# join() - 连接列表为字符串
words = ["Hello", "World", "Python"]
print(" ".join(words))        # 'Hello World Python'
print("-".join(words))        # 'Hello-World-Python'
print("".join(words))         # 'HelloWorldPython'

# join() 常见应用
# 路径拼接
import os
paths = ["home", "user", "documents"]
print("/".join(paths))        # 'home/user/documents'
# print(os.path.join(*paths))  # 使用 os.path.join 更安全

# CSV 行生成
row = ["Alice", "25", "New York"]
print(",".join(row))          # 'Alice,25,New York'

# ⚠️ 注意：join() 只能连接字符串
# nums = [1, 2, 3]
# "-".join(nums)  # TypeError
nums = [1, 2, 3]
print("-".join(map(str, nums)))  # '1-2-3'（先转换为字符串）

# 分割和连接的组合应用
s = "Hello World Python"
# 将空格替换为下划线
result = "_".join(s.split())
print(result)  # 'Hello_World_Python'
```

### 5. 去除空白方法

```python
s = "   Hello, World!   "

# strip() - 去除两端空白字符
print(s.strip())        # 'Hello, World!'

# lstrip() - 去除左端空白字符
print(s.lstrip())       # 'Hello, World!   '

# rstrip() - 去除右端空白字符
print(s.rstrip())       # '   Hello, World!'

# 去除指定字符
s = "xxHello Worldxx"
print(s.strip('x'))     # 'Hello World'
print(s.lstrip('x'))    # 'Hello Worldxx'
print(s.rstrip('x'))    # 'xxHello World'

# 去除多种字符
s = "##Hello World!!##"
print(s.strip('#!'))    # 'Hello World'
print(s.strip('#! '))   # 'Hello World'（同时去除 # ! 和空格）

# 常见应用
# 清理用户输入
user_input = "  alice@example.com  "
email = user_input.strip()

# 读取文件时去除换行符
# with open('file.txt') as f:
#     lines = [line.strip() for line in f]

# 去除所有空白字符
s = "  Hello   World  \n\t "
print(s.strip())        # 'Hello   World'（只去除两端）

# 去除所有空白（包括中间）
s = "  Hello   World  "
print(" ".join(s.split()))  # 'Hello World'

# 自定义去除函数
def strip_custom(s, chars=None, left=True, right=True):
    """自定义去除字符"""
    if left:
        s = s.lstrip(chars)
    if right:
        s = s.rstrip(chars)
    return s

print(strip_custom("xxHelloxx", 'x', left=True, right=False))  # 'Helloxx'
```

### 6. 判断方法

```python
# 判断字符串内容类型
print("12345".isdigit())       # True（是否全是数字字符）
print("123.45".isdigit())      # False（小数点不是数字）
print("①②③".isdigit())        # True（Unicode 数字字符）

print("Hello".isalpha())       # True（是否全是字母）
print("Hello123".isalpha())    # False

print("Hello123".isalnum())    # True（是否全是字母或数字）
print("Hello 123".isalnum())   # False（包含空格）

print("Hello World".isascii()) # True（是否全是 ASCII 字符）
print("你好".isascii())         # False

# 判断大小写
print("HELLO".isupper())       # True（是否全是大写）
print("Hello".isupper())       # False
print("123".isupper())         # False（没有字母）

print("hello".islower())       # True（是否全是小写）
print("Hello".islower())       # False

# 判断空白字符
print("   ".isspace())         # True（是否全是空白）
print("\t\n".isspace())        # True
print("".isspace())            # False（空字符串）

# 判断标题格式
print("Hello World".istitle()) # True（是否是标题格式）
print("Hello world".istitle()) # False

# 判断是否可打印
print("Hello".isprintable())   # True
print("Hello\n".isprintable()) # False（包含换行符）

# 判断数字的多种方法
print("123".isnumeric())       # True（Unicode 数字）
print("①②③".isnumeric())      # True
print("一二三".isnumeric())    # True（中文数字）

print("123".isdecimal())       # True（十进制数字）
print("①②③".isdecimal())      # False

# 判断开头和结尾
s = "Hello, World!"
print(s.startswith("Hello"))   # True
print(s.startswith(("Hi", "Hello")))  # True（元组参数）
print(s.endswith("!"))         # True
print(s.endswith(("?", "!")))   # True

# 实际应用
def validate_username(username):
    """验证用户名：只包含字母数字下划线，以字母开头"""
    if not username:
        return False
    if not username[0].isalpha():
        return False
    return all(c.isalnum() or c == '_' for c in username)

print(validate_username("Alice_123"))  # True
print(validate_username("123Alice"))    # False

def is_valid_email(email):
    """简单邮箱验证"""
    return '@' in email and email.count('@') == 1 and \
           email.startswith('@') == False and \
           email.endswith('@') == False

print(is_valid_email("alice@example.com"))  # True
```

### 7. 对齐和填充方法

```python
# center() - 居中对齐
s = "Hello"
print(s.center(20))        # '       Hello        '（默认空格填充）
print(s.center(20, '-'))  # '-------Hello--------'

# ljust() - 左对齐
print(s.ljust(20))         # 'Hello               '
print(s.ljust(20, '*'))    # 'Hello***************'

# rjust() - 右对齐
print(s.rjust(20))         # '               Hello'
print(s.rjust(20, '*'))    # '***************Hello'

# zfill() - 左侧填充零
print("42".zfill(5))       # '00042'
print("-42".zfill(5))      # '-0042'（负号在零之前）
print("+42".zfill(5))      # '+0042'（正号在零之前）

# 实际应用
# 格式化表格
def format_table_row(name, score, total):
    return f"{name.ljust(15)}{str(score).rjust(5)}/{str(total).rjust(5)}"

print(format_table_row("Alice", 95, 100))   # 'Alice             95/  100'
print(format_table_row("Bob", 88, 100))     # 'Bob               88/  100'

# 格式化数字
def format_number(n, width=10):
    """格式化数字，右对齐"""
    return str(n).rjust(width)

print(format_number(123))      # '       123'
print(format_number(123456))   # '    123456'

# 格式化进度条
def progress_bar(current, total, width=50):
    """显示进度条"""
    percent = current / total
    filled = int(width * percent)
    bar = '█' * filled + '░' * (width - filled)
    return f"[{bar}] {percent:.1%}"

print(progress_bar(75, 100))  # '[████████████████████████████████████░░░░░░░░░░░░] 75.0%'

# 格式化金额
def format_currency(amount, symbol='$'):
    """格式化金额"""
    return f"{symbol}{amount:,.2f}"

print(format_currency(1234567.89))  # '$1,234,567.89'

# 对齐注意事项
# ⚠️ 注意：中文字符宽度问题
s = "你好"
print(s.center(10, '-'))  # '----你好----'（可能显示不正确）
# 中文字符通常占两个显示宽度，但 Python 按字符数计算
```

### 8. 其他实用方法

```python
# len() - 字符串长度
print(len("Hello"))        # 5
print(len("你好世界"))     # 4（中文字符每个算 1）

# in 操作符 - 检查子串
print("ell" in "Hello")    # True
print("xyz" in "Hello")    # False

# 字符串比较
print("apple" < "banana")  # True（字典序比较）
print("Apple" < "apple")    # True（大写字母 ASCII 值更小）

# max() 和 min() - 最大最小字符
print(max("Hello"))         # 'o'（ASCII 值最大）
print(min("Hello"))         # 'H'（ASCII 值最小）

# sorted() - 排序字符
print(sorted("hello"))     # ['e', 'h', 'l', 'l', 'o']

# reversed() - 反转
print(''.join(reversed("Hello")))  # 'olleH'

# 字符串乘法
print("Ha" * 3)             # 'HaHaHa'
print("-" * 20)             # '--------------------'

# 成员检查
vowels = "aeiouAEIOU"
char = 'e'
if char in vowels:
    print(f"{char} is a vowel")

# 字符串不可变性
s = "Hello"
# 创建新字符串
s = s.replace('H', 'J')  # 'Jello'
s = s.upper()             # 'JELLO'

# 链式调用
s = "  Hello, World!  "
result = s.strip().upper().replace("WORLD", "PYTHON")
print(result)  # 'HELLO, PYTHON!'
```

---

## 字符串格式化详解

### 1. f-string 格式化（推荐）

```python
# f-string 是 Python 3.6+ 推荐的格式化方式
name = "Alice"
age = 25
score = 95.5

# 基本用法
print(f"My name is {name}")                    # My name is Alice
print(f"I'm {age} years old")                   # I'm 25 years old
print(f"Score: {score}")                        # Score: 95.5

# 表达式计算
print(f"Next year, I'll be {age + 1}")          # Next year, I'll be 26
print(f"Sum: {1 + 2 + 3}")                       # Sum: 6
print(f"Upper: {name.upper()}")                  # Upper: ALICE
print(f"Length: {len(name)}")                    # Length: 5

# 格式化数字
pi = 3.14159265
print(f"Pi: {pi:.2f}")           # Pi: 3.14（保留 2 位小数）
print(f"Pi: {pi:.4f}")           # Pi: 3.1416（保留 4 位小数）
print(f"Number: {1000:,}")       # Number: 1,000（千位分隔符）
print(f"Number: {1000:,.2f}")    # Number: 1,000.00
print(f"Percent: {0.856:.1%}")   # Percent: 85.6%（百分比）
print(f"Scientific: {1000:.2e}") # Scientific: 1.00e+03（科学计数法）

# 对齐和填充
print(f"{'Hello':<10}")          # 'Hello     '（左对齐，宽度 10）
print(f"{'Hello':>10}")          # '     Hello'（右对齐，宽度 10）
print(f"{'Hello':^10}")          # '  Hello   '（居中对齐，宽度 10）
print(f"{'Hello':*^10}")         # '**Hello***'（居中，用 * 填充）
print(f"{42:05d}")                # '00042'（数字前补零）
print(f"{42:+5d}")                # '  +42'（显示正号）

# 进制转换
num = 42
print(f"Binary: {num:b}")        # Binary: 101010
print(f"Octal: {num:o}")          # Octal: 52
print(f"Hex: {num:x}")            # Hex: 2a
print(f"Hex: {num:X}")            # Hex: 2A（大写）
print(f"Binary: {num:#b}")       # Binary: 0b101010（带前缀）

# 字典和对象
person = {"name": "Alice", "age": 25}
print(f"Name: {person['name']}")  # Name: Alice

class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    
    def __str__(self):
        return f"{self.name}: {self.score}"

s = Student("Bob", 90)
print(f"Student: {s}")            # Student: Bob: 90

# 嵌套格式化
width = 10
precision = 2
value = 3.14159
print(f"Value: {value:{width}.{precision}f}")  # Value:       3.14

# 日期时间格式化
from datetime import datetime
now = datetime.now()
print(f"Date: {now:%Y-%m-%d}")           # Date: 2024-01-15
print(f"Time: {now:%H:%M:%S}")           # Time: 14:30:25
print(f"DateTime: {now:%Y-%m-%d %H:%M:%S}")  # DateTime: 2024-01-15 14:30:25

# 多行 f-string
name = "Alice"
message = f"""
Hello, {name}!
Welcome to Python.
Today is {datetime.now():%Y-%m-%d}.
"""
print(message)

# f-string 转义
print(f"Use {{ and }} for literal braces")  # Use { and } for literal braces
print(f"{{name}}")                            # {name}

# f-string 调试（Python 3.8+）
x = 10
y = 20
print(f"{x = }, {y = }")        # x = 10, y = 20
print(f"{x + y = }")            # x + y = 30
```

### 2. format() 方法

```python
# 基本用法
name = "Alice"
age = 25

# 位置参数
print("Hello, {}".format(name))                      # Hello, Alice
print("Name: {}, Age: {}".format(name, age))         # Name: Alice, Age: 25
print("{0} is {1} years old. {0} is happy.".format(name, age))
# Alice is 25 years old. Alice is happy.

# 关键字参数
print("Name: {name}, Age: {age}".format(name="Alice", age=25))
print("{name}'s age is {age}".format(name="Bob", age=30))

# 混合使用
print("{0} is {age} years old. {0} likes {1}.".format("Alice", "Python", age=25))

# 访问属性和索引
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Alice", 25)
print("Name: {0.name}, Age: {0.age}".format(p))

items = ["apple", "banana", "orange"]
print("First: {0[0]}, Second: {0[1]}".format(items))

# 格式化数字
pi = 3.14159265
print("Pi: {:.2f}".format(pi))           # Pi: 3.14
print("Number: {:,}".format(1000000))    # Number: 1,000,000
print("Percent: {:.1%}".format(0.856))   # Percent: 85.6%

# 对齐
print("{:<10}".format("Hello"))          # 'Hello     '
print("{:>10}".format("Hello"))          # '     Hello'
print("{:^10}".format("Hello"))          # '  Hello   '
print("{:*^10}".format("Hello"))         # '**Hello***'

# 数字格式化
print("{:05d}".format(42))                # '00042'
print("{:+d}".format(42))                # '+42'
print("{: d}".format(42))                # ' 42'

# 进制转换
print("{:b}".format(42))                  # '101010'
print("{:#b}".format(42))                 # '0b101010'
print("{:x}".format(42))                  # '2a'
print("{:#x}".format(42))                 # '0x2a'

# 嵌套格式化
width = 10
precision = 2
value = 3.14159
print("Value: {:{width}.{precision}f}".format(value, width=width, precision=precision))
# Value:       3.14
```

### 3. % 格式化（旧式）

```python
# % 格式化是 Python 早期的方式，现在不推荐使用
name = "Alice"
age = 25
score = 95.5

# 基本用法
print("Name: %s" % name)                    # Name: Alice
print("Age: %d" % age)                      # Age: 25
print("Score: %.1f" % score)                # Score: 95.5

# 多个参数（使用元组）
print("Name: %s, Age: %d" % (name, age))   # Name: Alice, Age: 25

# 使用字典
data = {"name": "Alice", "age": 25}
print("Name: %(name)s, Age: %(age)d" % data)  # Name: Alice, Age: 25

# 格式化符号
# %s - 字符串
# %d, %i - 整数
# %f - 浮点数
# %e, %E - 科学计数法
# %x, %X - 十六进制
# %o - 八进制
# %c - 字符
# %r - repr()

# 宽度和精度
print("%10s" % "Hello")                    # '     Hello'（宽度 10）
print("%-10s" % "Hello")                   # 'Hello     '（左对齐）
print("%.2f" % 3.14159)                    # '3.14'（精度 2）
print("%10.2f" % 3.14159)                  # '      3.14'（宽度 10，精度 2）

# 数字前补零
print("%05d" % 42)                         # '00042'

# 显示正负号
print("%+d" % 42)                          # '+42'
print("%+d" % -42)                         # '-42'
```

### 4. 格式化方法对比

```python
# 三种格式化方法对比
name = "Alice"
age = 25
score = 95.5

# f-string（推荐，Python 3.6+）
print(f"Name: {name}, Age: {age}, Score: {score:.1f}")

# format() 方法（Python 2.6+）
print("Name: {}, Age: {}, Score: {:.1f}".format(name, age, score))

# % 格式化（旧式，不推荐）
print("Name: %s, Age: %d, Score: %.1f" % (name, age, score))

# 性能对比（f-string 最快）
import timeit

# f-string
time_f = timeit.timeit('f"Name: {name}, Age: {age}"', 
                       globals={'name': 'Alice', 'age': 25}, 
                       number=100000)

# format()
time_format = timeit.timeit('"Name: {}, Age: {}".format(name, age)', 
                            globals={'name': 'Alice', 'age': 25}, 
                            number=100000)

# % 格式化
time_percent = timeit.timeit('"Name: %s, Age: %d" % (name, age)', 
                              globals={'name': 'Alice', 'age': 25}, 
                              number=100000)

print(f"f-string: {time_f:.4f}s")
print(f"format(): {time_format:.4f}s")
print(f"% 格式化: {time_percent:.4f}s")

# 最佳实践
# ✅ 推荐：使用 f-string（可读性好，性能最佳）
# ✅ 可接受：使用 format()（兼容旧版本）
# ❌ 避免：使用 % 格式化（已过时）
```

---

## 正则表达式基础

### 1. 正则表达式入门

```python
import re

# 正则表达式是处理字符串的强大工具
# 用于模式匹配、搜索、替换等

# 基本匹配
text = "Hello, World!"

# re.match() - 从字符串开头匹配
result = re.match("Hello", text)
print(result)              # <re.Match object>
print(result.group())      # 'Hello'
print(result.span())       # (0, 5)

# re.match() 只匹配开头
result = re.match("World", text)
print(result)              # None（不匹配）

# re.search() - 搜索整个字符串
result = re.search("World", text)
print(result.group())      # 'World'

# re.findall() - 找到所有匹配
text = "The quick brown fox jumps over the lazy dog"
words = re.findall(r"\b\w{3}\b", text)  # 找出所有 3 个字母的单词
print(words)               # ['The', 'fox', 'the', 'dog']

# re.finditer() - 返回迭代器
for match in re.finditer(r"\b\w{3}\b", text):
    print(f"Found '{match.group()}' at position {match.start()}")
```

### 2. 正则表达式语法

```python
import re

# 元字符
# .   匹配任意字符（除换行符）
# ^   匹配字符串开头
# $   匹配字符串结尾
# *   匹配 0 次或多次
# +   匹配 1 次或多次
# ?   匹配 0 次或 1 次
# |   或运算
# []  字符集
# ()  分组
# \   转义字符

# 字符集
print(re.findall("[aeiou]", "Hello World"))      # ['e', 'o', 'o']
print(re.findall("[a-z]", "Hello World"))         # ['e', 'l', 'l', 'o', 'o', 'r', 'l', 'd']
print(re.findall("[A-Z]", "Hello World"))         # ['H', 'W']
print(re.findall("[0-9]", "abc123def"))            # ['1', '2', '3']
print(re.findall("[^aeiou]", "Hello World"))      # ['H', 'l', 'l', ' ', 'W', 'r', 'l', 'd']（非元音）

# 预定义字符类
# \d  数字 [0-9]
# \D  非数字 [^0-9]
# \w  单词字符 [a-zA-Z0-9_]
# \W  非单词字符
# \s  空白字符 [ \t\n\r\f\v]
# \S  非空白字符
# \b  单词边界

print(re.findall(r"\d", "abc123def"))              # ['1', '2', '3']
print(re.findall(r"\w+", "Hello World"))           # ['Hello', 'World']
print(re.findall(r"\s+", "Hello   World"))         # ['   ']

# 量词
# {n}    匹配 n 次
# {n,}   匹配至少 n 次
# {n,m}  匹配 n 到 m 次

print(re.findall(r"a{3}", "aaa bbb aaaa"))         # ['aaa', 'aaa']
print(re.findall(r"a{2,}", "a aa aaa aaaa"))       # ['aa', 'aaa', 'aaaa']
print(re.findall(r"a{2,4}", "a aa aaa aaaa"))      # ['aa', 'aaa', 'aaaa']

# 贪婪 vs 非贪婪
text = "<div>Hello</div><div>World</div>"
# 贪婪匹配（默认）
print(re.findall(r"<div>.*</div>", text))         # ['<div>Hello</div><div>World</div>']
# 非贪婪匹配（加 ?）
print(re.findall(r"<div>.*?</div>", text))        # ['<div>Hello</div>', '<div>World</div>']
```

### 3. 常用正则函数

```python
import re

# re.match() - 从开头匹配
result = re.match(r"Hello", "Hello World")
print(result.group() if result else None)  # 'Hello'

# re.search() - 搜索第一个匹配
result = re.search(r"\d+", "abc123def456")
print(result.group())  # '123'

# re.findall() - 找到所有匹配
results = re.findall(r"\d+", "abc123def456")
print(results)  # ['123', '456']

# re.finditer() - 返回匹配对象的迭代器
for match in re.finditer(r"\d+", "abc123def456"):
    print(f"Found {match.group()} at {match.span()}")

# re.sub() - 替换
text = "Hello 123 World 456"
result = re.sub(r"\d+", "NUM", text)
print(result)  # 'Hello NUM World NUM'

# 使用函数替换
def double_num(match):
    return str(int(match.group()) * 2)

result = re.sub(r"\d+", double_num, text)
print(result)  # 'Hello 246 World 912'

# re.split() - 分割
text = "Hello,World;Python"
result = re.split(r"[,;]", text)
print(result)  # ['Hello', 'World', 'Python']

# re.compile() - 编译正则表达式（提高性能）
pattern = re.compile(r"\d+")
print(pattern.findall("abc123def456"))  # ['123', '456']
print(pattern.search("xyz789"))         # <re.Match object>
```

### 4. 分组和捕获

```python
import re

# 普通分组
text = "2024-01-15"
pattern = r"(\d{4})-(\d{2})-(\d{2})"
match = re.search(pattern, text)
if match:
    print(match.group())     # '2024-01-15'（整个匹配）
    print(match.group(1))    # '2024'（第一个分组）
    print(match.group(2))    # '01'（第二个分组）
    print(match.group(3))    # '15'（第三个分组）
    print(match.groups())    # ('2024', '01', '15')

# 命名分组
pattern = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
match = re.search(pattern, text)
if match:
    print(match.group('year'))   # '2024'
    print(match.group('month'))  # '01'
    print(match.groupdict())     # {'year': '2024', 'month': '01', 'day': '15'}

# 非捕获分组 (?:...)
text = "Hello World"
pattern = r"(?:Hello|Hi) (World)"
match = re.search(pattern, text)
if match:
    print(match.groups())    # ('World',)（只有捕获分组）

# 分组引用
# 在正则表达式中引用前面的分组
text = "hello hello world world"
pattern = r"(\w+) \1"  # \1 引用第一个分组
print(re.findall(pattern, text))  # [('hello',), ('world',)]

# 替换中使用分组引用
text = "Hello World"
result = re.sub(r"(\w+) (\w+)", r"\2 \1", text)
print(result)  # 'World Hello'

# 命名分组引用
text = "2024-01-15"
result = re.sub(r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})", 
                r"\g<month>/\g<day>/\g<year>", text)
print(result)  # '01/15/2024'
```

### 5. 常用正则表达式示例

```python
import re

# 邮箱验证
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

print(is_valid_email("alice@example.com"))    # True
print(is_valid_email("invalid-email"))        # False

# 手机号验证（中国）
def is_valid_phone(phone):
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))

print(is_valid_phone("13812345678"))  # True
print(is_valid_phone("12345678901"))   # False

# 身份证号验证（中国）
def is_valid_id_card(id_card):
    pattern = r'^\d{17}[\dXx]$'
    return bool(re.match(pattern, id_card))

print(is_valid_id_card("110101199001011234"))  # True

# URL 验证
def is_valid_url(url):
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))

print(is_valid_url("https://www.example.com"))  # True

# IP 地址验证
def is_valid_ip(ip):
    pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    if not re.match(pattern, ip):
        return False
    parts = ip.split('.')
    return all(0 <= int(part) <= 255 for part in parts)

print(is_valid_ip("192.168.1.1"))    # True
print(is_valid_ip("256.1.1.1"))       # False

# 提取 HTML 标签内容
html = "<div>Hello</div><p>World</p>"
contents = re.findall(r"<(\w+)>(.*?)</\1>", html)
print(contents)  # [('div', 'Hello'), ('p', 'World')]

# 提取所有数字
text = "Price: $123.45, Quantity: 10, Total: $1234.50"
numbers = re.findall(r"\d+\.?\d*", text)
print(numbers)  # ['123.45', '10', '1234.50']

# 提取所有单词
text = "Hello, World! Python3 is great."
words = re.findall(r"\b[a-zA-Z]+\b", text)
print(words)  # ['Hello', 'World', 'is', 'great']

# 密码强度验证
def check_password_strength(password):
    """检查密码强度"""
    if len(password) < 8:
        return "弱：密码长度至少8位"
    
    has_lower = re.search(r"[a-z]", password)
    has_upper = re.search(r"[A-Z]", password)
    has_digit = re.search(r"\d", password)
    has_special = re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    
    strength = sum([bool(has_lower), bool(has_upper), 
                   bool(has_digit), bool(has_special)])
    
    if strength == 4:
        return "强"
    elif strength >= 2:
        return "中"
    else:
        return "弱"
```

### 6. 正则表达式标志

```python
import re

# re.IGNORECASE (re.I) - 忽略大小写
text = "Hello World"
print(re.findall(r"hello", text, re.I))  # ['Hello']

# re.MULTILINE (re.M) - 多行模式
text = """Hello World
Python Programming
Regular Expressions"""
print(re.findall(r"^\w+", text, re.M))  # ['Hello', 'Python', 'Regular']

# re.DOTALL (re.S) - . 匹配包括换行符
text = "Hello\nWorld"
print(re.findall(r"Hello.World", text))       # []
print(re.findall(r"Hello.World", text, re.S)) # ['Hello\nWorld']

# re.VERBOSE (re.X) - 详细模式，允许注释
pattern = r"""
    ^                   # 字符串开头
    [a-zA-Z0-9._%+-]+   # 用户名部分
    @                   # @ 符号
    [a-zA-Z0-9.-]+      # 域名部分
    \.                  # 点号
    [a-zA-Z]{2,}        # 顶级域名
    $                   # 字符串结尾
"""
text = "alice@example.com"
print(bool(re.match(pattern, text, re.VERBOSE)))  # True

# 组合多个标志
text = """Hello World
hello python
HELLO REGEX"""
print(re.findall(r"^hello", text, re.I | re.M))  # ['Hello', 'hello', 'HELLO']
```

---

## 多行字符串处理

### 1. 多行字符串创建

```python
# 使用三引号创建多行字符串
text1 = """这是第一行
这是第二行
这是第三行"""

text2 = '''
这也是第一行
这也是第二行
这也是第三行
'''

# 使用括号隐式连接
text3 = (
    "这是第一行\n"
    "这是第二行\n"
    "这是第三行"
)

# 使用反斜杠
text4 = "这是第一行\n" \
        "这是第二行\n" \
        "这是第三行"

# 使用 join()
lines = ["第一行", "第二行", "第三行"]
text5 = "\n".join(lines)
```

### 2. 多行字符串处理方法

```python
text = """Hello World
Python Programming
Regular Expressions"""

# splitlines() - 按行分割
lines = text.splitlines()
print(lines)  # ['Hello World', 'Python Programming', 'Regular Expressions']

# splitlines(keepends=True) - 保留换行符
lines = text.splitlines(True)
print(lines)  # ['Hello World\n', 'Python Programming\n', 'Regular Expressions']

# 逐行处理
for line in text.splitlines():
    print(f"Line: {line}")

# 使用 split('\n')
lines = text.split('\n')
print(lines)  # ['Hello World', 'Python Programming', 'Regular Expressions']

# 注意：split('\n') 和 splitlines() 的区别
text = "Line 1\nLine 2\n"
print(text.split('\n'))      # ['Line 1', 'Line 2', '']（末尾有空元素）
print(text.splitlines())     # ['Line 1', 'Line 2']（末尾无空元素）

# 去除每行的空白
text = """
  Line 1  
  Line 2  
  Line 3  
"""
lines = [line.strip() for line in text.splitlines() if line.strip()]
print(lines)  # ['Line 1', 'Line 2', 'Line 3']

# 添加行号
for i, line in enumerate(text.splitlines(), 1):
    print(f"{i}: {line}")
```

### 3. 文本块处理

```python
# textwrap 模块
import textwrap

# 填充文本
text = "This is a long text that needs to be wrapped to fit within a certain width."
wrapped = textwrap.fill(text, width=30)
print(wrapped)
# This is a long text that
# needs to be wrapped to fit
# within a certain width.

# 缩进文本
text = "Hello\nWorld\nPython"
indented = textwrap.indent(text, "  ")
print(indented)
#   Hello
#   World
#   Python

# 缩进多行字符串
def indent_text(text, prefix="    "):
    """给每行添加前缀"""
    return "\n".join(prefix + line for line in text.splitlines())

text = "Line 1\nLine 2\nLine 3"
print(indent_text(text, ">>> "))
# >>> Line 1
# >>> Line 2
# >>> Line 3

# 去除缩进
text = """
    Line 1
    Line 2
    Line 3
"""
dedented = textwrap.dedent(text)
print(dedented)
# Line 1
# Line 2
# Line 3

# 截断文本
text = "This is a long text that will be truncated."
truncated = textwrap.shorten(text, width=20, placeholder="...")
print(truncated)  # This is a long...

# 计算文本宽度（考虑中文字符）
def display_width(text):
    """计算显示宽度（中文字符算 2 个宽度）"""
    width = 0
    for char in text:
        if '\u4e00' <= char <= '\u9fff':  # 中文字符范围
            width += 2
        else:
            width += 1
    return width

print(display_width("Hello"))      # 5
print(display_width("你好"))        # 4
print(display_width("Hello你好"))   # 9
```

### 4. 字符串模板

```python
from string import Template

# 使用 Template 进行简单替换
template = Template("Hello, $name! Welcome to $place.")
result = template.substitute(name="Alice", place="Python World")
print(result)  # Hello, Alice! Welcome to Python World.

# 使用字典替换
data = {"name": "Bob", "place": "the Party"}
result = template.substitute(data)
print(result)  # Hello, Bob! Welcome to the Party.

# safe_substitute - 不会因缺少变量而报错
template = Template("Name: $name, Age: $age")
result = template.safe_substitute(name="Alice")
print(result)  # Name: Alice, Age: $age

# substitute - 缺少变量会报错
# result = template.substitute(name="Alice")  # KeyError

# 自定义分隔符
class MyTemplate(Template):
    delimiter = '#'

template = MyTemplate("Hello, #name!")
result = template.substitute(name="Alice")
print(result)  # Hello, Alice!
```

---

## 注意事项和最佳实践

### 1. 字符串不可变性

```python
# 字符串是不可变的，所有操作都返回新字符串
s = "Hello"
# s[0] = 'J'  # TypeError: 'str' object does not support item assignment

# 正确做法：创建新字符串
s = 'J' + s[1:]  # 'Jello'

# 多次修改字符串时，使用列表
# ❌ 不推荐：字符串拼接效率低
result = ""
for i in range(1000):
    result += str(i)

# ✅ 推荐：使用列表和 join
parts = []
for i in range(1000):
    parts.append(str(i))
result = "".join(parts)

# ✅ 更推荐：使用列表推导式
result = "".join(str(i) for i in range(1000))
```

### 2. 编码问题

```python
# ✅ 推荐：统一使用 UTF-8 编码
# 文件开头声明编码（Python 3 默认 UTF-8）
# -*- coding: utf-8 -*-

# ✅ 推荐：处理文件时明确指定编码
# with open('file.txt', 'r', encoding='utf-8') as f:
#     content = f.read()

# ✅ 推荐：网络传输使用 UTF-8
# data = "你好".encode('utf-8')

# ⚠️ 注意：Windows 默认编码可能是 GBK
# 在不同系统间传输文件时要注意编码一致性

# ✅ 推荐：处理编码错误
try:
    text = b'\xff\xfe'.decode('utf-8')
except UnicodeDecodeError:
    text = b'\xff\xfe'.decode('utf-8', errors='replace')
```

### 3. 性能优化

```python
import timeit

# 字符串拼接性能对比
def concat_plus():
    result = ""
    for i in range(1000):
        result += str(i)
    return result

def concat_join():
    return "".join(str(i) for i in range(1000))

def concat_fstring():
    return f"{list(range(1000))}"  # 不推荐，仅演示

# join 性能最佳
print(timeit.timeit(concat_plus, number=100))    # 较慢
print(timeit.timeit(concat_join, number=100))   # 最快

# 格式化性能对比
name, age = "Alice", 25

def format_fstring():
    return f"Name: {name}, Age: {age}"

def format_method():
    return "Name: {}, Age: {}".format(name, age)

def format_percent():
    return "Name: %s, Age: %d" % (name, age)

print(timeit.timeit(format_fstring, number=100000))   # 最快
print(timeit.timeit(format_method, number=100000))    # 中等
print(timeit.timeit(format_percent, number=100000))   # 较慢

# 成员检查性能
# ✅ 推荐：大量检查时使用集合
vowels_set = set("aeiouAEIOU")
vowels_str = "aeiouAEIOU"

def check_set(char):
    return char in vowels_set

def check_str(char):
    return char in vowels_str

# 集合查找 O(1)，字符串查找 O(n)
print(timeit.timeit(lambda: check_set('e'), number=100000))   # 更快
print(timeit.timeit(lambda: check_str('e'), number=100000))   # 较慢
```

### 4. 安全考虑

```python
# ⚠️ 注意：格式化字符串注入
user_input = "{__import__('os').system('ls')}"

# ❌ 危险：直接使用用户输入的格式字符串
# print(user_input.format())  # 可能执行恶意代码

# ✅ 安全：使用固定格式字符串
template = "User input: {}"
print(template.format(user_input))  # 安全

# ✅ 安全：使用 f-string 或 format()，不要让用户控制格式字符串

# SQL 注入防护
# ❌ 危险：字符串拼接 SQL
# user_id = "1 OR 1=1"
# sql = f"SELECT * FROM users WHERE id = {user_id}"  # SQL 注入

# ✅ 安全：使用参数化查询
# cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

# 正则表达式拒绝服务（ReDoS）
# ❌ 危险：可能导致灾难性回溯的正则
# pattern = r"(a+)+$"  # 对于 "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!" 会非常慢

# ✅ 安全：使用原子分组或限制回溯
# pattern = r"(?>a+)+$"  # 原子分组
# 或限制输入长度
```

---

## 常见错误示例

### 1. 索引越界错误

```python
s = "Hello"

# ❌ 错误：索引越界
# print(s[5])   # IndexError: string index out of range
# print(s[-6])  # IndexError: string index out of range

# ✅ 正确：检查索引范围
def safe_index(s, index):
    if -len(s) <= index < len(s):
        return s[index]
    return None

print(safe_index(s, 5))   # None
print(safe_index(s, -6))  # None

# ✅ 正确：使用切片（不会越界）
print(s[5:10])  # ''（空字符串）
```

### 2. 字符串不可变错误

```python
s = "Hello"

# ❌ 错误：尝试修改字符串
# s[0] = 'J'  # TypeError: 'str' object does not support item assignment

# ✅ 正确：创建新字符串
s = 'J' + s[1:]
print(s)  # 'Jello'

# ✅ 正确：使用 replace
s = "Hello".replace('H', 'J')
print(s)  # 'Jello'

# ✅ 正确：转换为列表修改
chars = list("Hello")
chars[0] = 'J'
s = ''.join(chars)
print(s)  # 'Jello'
```

### 3. 编码解码错误

```python
# ❌ 错误：编码不匹配
b = b'\xe4\xb8\x96\xe7\x95\x8c'  # UTF-8 编码的"世界"
# s = b.decode('gbk')  # UnicodeDecodeError 或乱码

# ✅ 正确：使用正确的编码
s = b.decode('utf-8')
print(s)  # '世界'

# ❌ 错误：无法编码的字符
s = "世界"
# b = s.encode('ascii')  # UnicodeEncodeError

# ✅ 正确：处理编码错误
b = s.encode('ascii', errors='replace')
print(b)  # b'??'

# ✅ 正确：使用支持所有字符的编码
b = s.encode('utf-8')
print(b)  # b'\xe4\xb8\x96\xe7\x95\x8c'
```

### 4. 字符串和字节混用错误

```python
# ❌ 错误：混用 str 和 bytes
# result = "Hello" + b"World"  # TypeError

# ✅ 正确：统一类型
result = "Hello" + b"World".decode('utf-8')
print(result)  # 'HelloWorld'

# 或
result = "Hello".encode('utf-8') + b"World"
print(result)  # b'HelloWorld'

# ❌ 错误：错误的字符串比较
print("Hello" == b"Hello")  # False（类型不同）

# ✅ 正确：统一类型后比较
print("Hello" == b"Hello".decode('utf-8'))  # True
```

### 5. 格式化错误

```python
name = "Alice"
age = 25

# ❌ 错误：格式化类型不匹配
# print("Age: %s" % age)  # 虽然能工作，但不规范
# print("Name: %d" % name)  # TypeError

# ✅ 正确：使用正确的格式化类型
print("Name: %s, Age: %d" % (name, age))

# ❌ 错误：f-string 中使用引号
# print(f"Name: {name["first"]}")  # SyntaxError

# ✅ 正确：使用不同的引号
data = {"first": "Alice"}
print(f"Name: {data['first']}")  # Name: Alice

# ✅ 正确：使用转义
print(f"Name: {name!r}")  # Name: 'Alice'（使用 repr）
```

### 6. 正则表达式错误

```python
import re

# ❌ 错误：忘记原始字符串
# pattern = "\d+"  # \d 会被解释为普通字符
# print(re.findall(pattern, "abc123"))  # []

# ✅ 正确：使用原始字符串
pattern = r"\d+"
print(re.findall(pattern, "abc123"))  # ['123']

# ❌ 错误：贪婪匹配导致意外结果
text = "<div>Hello</div><div>World</div>"
# pattern = r"<div>.*</div>"  # 贪婪匹配
# print(re.findall(pattern, text))  # ['<div>Hello</div><div>World</div>']

# ✅ 正确：使用非贪婪匹配
pattern = r"<div>.*?</div>"
print(re.findall(pattern, text))  # ['<div>Hello</div>', '<div>World</div>']

# ❌ 错误：忘记转义特殊字符
# pattern = r"a.b"  # . 匹配任意字符
# print(re.findall(pattern, "aXb aYb a.b"))  # ['aXb', 'aYb', 'a.b']

# ✅ 正确：转义特殊字符
pattern = r"a\.b"
print(re.findall(pattern, "aXb aYb a.b"))  # ['a.b']

# ❌ 错误：正则表达式语法错误
# pattern = r"[a-z"  # 缺少右括号
# re.compile(pattern)  # re.error: unterminated character set

# ✅ 正确：检查正则表达式语法
pattern = r"[a-z]"
print(re.findall(pattern, "Hello"))  # ['e', 'l', 'l', 'o']
```

### 7. 字符串方法链式调用错误

```python
s = "  Hello, World!  "

# ❌ 错误：忘记字符串方法返回新字符串
# s.strip().upper()
# print(s)  # '  Hello, World!  '（原字符串未改变）

# ✅ 正确：保存结果
result = s.strip().upper()
print(result)  # 'HELLO, WORLD!'

# ❌ 错误：链式调用返回 None 的方法
# s = "Hello World"
# result = s.split().append("Python")  # append 返回 None
# print(result)  # None

# ✅ 正确：分步操作
s = "Hello World"
words = s.split()
words.append("Python")
print(words)  # ['Hello', 'World', 'Python']

# ✅ 正确：使用列表推导式
s = "Hello World"
words = s.split() + ["Python"]
print(words)  # ['Hello', 'World', 'Python']
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch07_strings) 完成以下任务：

1. **字符串切片** - 提取字符串中的子串
2. **词频统计** - 统计一段文字中每个词出现的次数
3. **格式转换** - 将用户输入的名字格式化为"姓.名"的形式
4. **邮箱验证** - 使用正则表达式验证邮箱格式
5. **文本处理** - 实现一个简单的文本分析工具

---

## 🔗 扩展阅读

- Python 官方文档：字符串方法
- Python 官方文档：正则表达式
- Python 官方文档：字符串格式化
- Unicode 编码详解

---

**[下一章预告]** → 文件操作：读写文件和 JSON 数据处理