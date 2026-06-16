# 文件操作

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>文件操作允许程序读取和写入文件，实现数据的持久化存储。本章将深入学习 Python 文件操作的各个方面，包括文本文件、二进制文件、JSON、CSV 以及文件系统操作。</p>
</div>

## 文件打开模式详解

Python 的 `open()` 函数支持多种文件打开模式，通过模式字符串控制文件的读写方式。

### 基本模式

| 模式 | 说明 | 文件不存在时 | 文件存在时 |
|------|------|-------------|-----------|
| `r` | 只读模式（默认） | 抛出 FileNotFoundError | 从文件开头读取 |
| `w` | 只写模式 | 创建新文件 | 清空文件内容 |
| `a` | 追加模式 | 创建新文件 | 在文件末尾追加 |
| `x` | 独占创建模式 | 创建新文件 | 抛出 FileExistsError |

### 扩展模式

| 模式 | 说明 |
|------|------|
| `b` | 二进制模式 |
| `+` | 读写模式（更新模式） |
| `t` | 文本模式（默认） |

### 常用组合模式

```python
# 'r' - 只读模式（默认）
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 'w' - 只写模式，会清空文件
with open("file.txt", "w", encoding="utf-8") as f:
    f.write("新内容")  # 原有内容被清空

# 'a' - 追加模式，在文件末尾添加
with open("file.txt", "a", encoding="utf-8") as f:
    f.write("追加内容")  # 保留原有内容

# 'x' - 独占创建模式，文件已存在则报错
try:
    with open("new_file.txt", "x", encoding="utf-8") as f:
        f.write("创建新文件")
except FileExistsError:
    print("文件已存在，无法创建")

# 'rb' - 二进制只读模式
with open("image.png", "rb") as f:
    data = f.read()

# 'wb' - 二进制只写模式
with open("output.bin", "wb") as f:
    f.write(b'\x00\x01\x02\x03')

# 'r+' - 读写模式，文件必须存在
with open("file.txt", "r+", encoding="utf-8") as f:
    content = f.read()
    f.seek(0)  # 移动到文件开头
    f.write("更新内容")

# 'w+' - 读写模式，会清空文件
with open("file.txt", "w+", encoding="utf-8") as f:
    f.write("新内容")
    f.seek(0)  # 移动到文件开头才能读取
    content = f.read()

# 'a+' - 追加读写模式
with open("file.txt", "a+", encoding="utf-8") as f:
    f.write("追加内容")
    f.seek(0)  # 需要移动指针才能读取
    content = f.read()
```

### 模式选择建议

```python
# 场景1：读取配置文件
with open("config.ini", "r", encoding="utf-8") as f:
    config = f.read()

# 场景2：写入日志文件（追加）
with open("app.log", "a", encoding="utf-8") as f:
    f.write("新的日志条目\n")

# 场景3：创建新文件，确保不覆盖已有文件
try:
    with open("data.txt", "x", encoding="utf-8") as f:
        f.write("初始数据")
except FileExistsError:
    print("文件已存在，跳过创建")

# 场景4：处理图片等二进制文件
with open("photo.jpg", "rb") as src:
    with open("copy.jpg", "wb") as dst:
        dst.write(src.read())
```

## 文件读取方法详解

### read() - 读取全部或指定字节数

```python
# 读取全部内容
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()  # 返回整个文件的字符串
    print(content)

# 读取指定字符数
with open("file.txt", "r", encoding="utf-8") as f:
    first_10 = f.read(10)   # 读取前10个字符
    next_10 = f.read(10)    # 继续读取接下来的10个字符
    print(f"前10个字符: {first_10}")
    print(f"接下来的10个字符: {next_10}")

# 读取大文件时分块处理
def read_in_chunks(file_path, chunk_size=1024):
    """分块读取大文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:  # 读到文件末尾返回空字符串
                break
            yield chunk

# 使用示例
for chunk in read_in_chunks("large_file.txt"):
    process(chunk)  # 处理每个块
```

### readline() - 逐行读取

```python
# 每次读取一行
with open("file.txt", "r", encoding="utf-8") as f:
    line1 = f.readline()  # 读取第一行
    line2 = f.readline()  # 读取第二行
    line3 = f.readline()  # 读取第三行
    print(line1, line2, line3)

# 读取所有行直到文件末尾
with open("file.txt", "r", encoding="utf-8") as f:
    while True:
        line = f.readline()
        if not line:  # 读到文件末尾返回空字符串
            break
        print(line.rstrip())  # rstrip() 移除末尾的换行符

# 结合 strip() 处理每行
with open("file.txt", "r", encoding="utf-8") as f:
    line = f.readline()
    while line:
        line = line.strip()  # 移除首尾空白字符
        if line:  # 跳过空行
            print(line)
        line = f.readline()
```

### readlines() - 读取所有行为列表

```python
# 读取所有行到列表
with open("file.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()  # 返回列表，每个元素是一行（包含换行符）
    print(f"共 {len(lines)} 行")
    for i, line in enumerate(lines, 1):
        print(f"第{i}行: {line.rstrip()}")

# 处理大文件时注意内存
# 不推荐：大文件会占用大量内存
# lines = f.readlines()  # 所有行都加载到内存

# 推荐：使用列表推导式处理后再存储
with open("file.txt", "r", encoding="utf-8") as f:
    # 只保留非空行
    lines = [line.strip() for line in f.readlines() if line.strip()]

# 读取时同时处理
with open("file.txt", "r", encoding="utf-8") as f:
    lines = [line.rstrip('\n') for line in f.readlines()]
```

### 迭代读取（推荐方式）

```python
# 直接迭代文件对象（内存效率最高）
with open("file.txt", "r", encoding="utf-8") as f:
    for line in f:  # 文件对象是可迭代的
        print(line.rstrip())  # 每次只加载一行到内存

# 带行号的迭代
with open("file.txt", "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        print(f"{line_num}: {line.rstrip()}")

# 使用 enumerate 的 start 参数
with open("file.txt", "r", encoding="utf-8") as f:
    for idx, line in enumerate(f, start=1):
        if idx > 10:  # 只读取前10行
            break
        print(f"行{idx}: {line.strip()}")

# 过滤特定行
with open("file.txt", "r", encoding="utf-8") as f:
    # 只处理以 # 开头的注释行
    for line in f:
        if line.startswith('#'):
            print(line.rstrip())

# 统计文件信息
with open("file.txt", "r", encoding="utf-8") as f:
    line_count = 0
    char_count = 0
    word_count = 0
    
    for line in f:
        line_count += 1
        char_count += len(line)
        word_count += len(line.split())
    
    print(f"行数: {line_count}")
    print(f"字符数: {char_count}")
    print(f"单词数: {word_count}")
```

### 读取方法对比

```python
# 对比不同读取方式的适用场景

# 1. read() - 小文件，需要全部内容
with open("small.txt", "r") as f:
    content = f.read()
    # 适合：配置文件、小型数据文件

# 2. readline() - 需要精确控制读取过程
with open("file.txt", "r") as f:
    header = f.readline()  # 先读取头部
    # 然后逐行处理剩余内容
    # 适合：有固定格式的文件

# 3. readlines() - 需要随机访问行
with open("file.txt", "r") as f:
    lines = f.readlines()
    # 可以随机访问 lines[5], lines[10] 等
    # 适合：需要多次访问、行数不多的文件

# 4. 迭代读取 - 大文件，逐行处理
with open("large.txt", "r") as f:
    for line in f:
        process(line)
    # 适合：日志文件、大数据文件
```

## 文件写入方法详解

### write() - 写入字符串

```python
# 基本写入
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("第一行\n")
    f.write("第二行\n")
    # 注意：write() 不会自动添加换行符

# write() 返回写入的字符数
with open("output.txt", "w", encoding="utf-8") as f:
    count = f.write("Hello, World!")
    print(f"写入了 {count} 个字符")

# 写入多行文本
lines = ["第一行", "第二行", "第三行"]
with open("output.txt", "w", encoding="utf-8") as f:
    for line in lines:
        f.write(line + "\n")  # 手动添加换行符

# 使用 join() 高效写入
lines = ["第一行", "第二行", "第三行"]
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

# 格式化写入
name = "Alice"
age = 25
score = 95.5
with open("output.txt", "w", encoding="utf-8") as f:
    f.write(f"姓名: {name}\n")
    f.write(f"年龄: {age}\n")
    f.write(f"分数: {score:.2f}\n")

# 写入二进制数据
with open("binary.bin", "wb") as f:
    f.write(b'\x00\x01\x02\x03')
    f.write(bytes([4, 5, 6, 7]))
    f.write(bytearray([8, 9, 10]))
```

### writelines() - 写入字符串列表

```python
# writelines() 写入字符串列表
lines = ["第一行\n", "第二行\n", "第三行\n"]
with open("output.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)  # 不会自动添加换行符

# 如果列表中没有换行符，需要手动处理
lines = ["第一行", "第二行", "第三行"]
with open("output.txt", "w", encoding="utf-8") as f:
    # 方法1：使用列表推导式
    f.writelines([line + "\n" for line in lines])
    
    # 方法2：使用 map 函数
    # f.writelines(map(lambda x: x + "\n", lines))

# writelines() 返回 None，不返回写入数量
with open("output.txt", "w", encoding="utf-8") as f:
    result = f.writelines(["a", "b", "c"])
    print(result)  # None

# 写入大量数据时 writelines 更高效
data = [f"行{i}\n" for i in range(10000)]
with open("large.txt", "w", encoding="utf-8") as f:
    f.writelines(data)  # 比 for 循环 write 更快
```

### write() vs writelines() 对比

```python
# write() - 写入单个字符串
with open("file.txt", "w") as f:
    f.write("单行文本\n")

# writelines() - 写入字符串列表
with open("file.txt", "w") as f:
    f.writelines(["行1\n", "行2\n", "行3\n"])

# 性能对比
import time

lines = [f"行{i}\n" for i in range(100000)]

# 方法1：循环 write
start = time.time()
with open("test1.txt", "w") as f:
    for line in lines:
        f.write(line)
time1 = time.time() - start

# 方法2：writelines
start = time.time()
with open("test2.txt", "w") as f:
    f.writelines(lines)
time2 = time.time() - start

print(f"循环 write: {time1:.4f}秒")
print(f"writelines: {time2:.4f}秒")
# writelines 通常更快
```

## 文件指针操作

### tell() - 获取当前位置

```python
with open("file.txt", "r", encoding="utf-8") as f:
    print(f"初始位置: {f.tell()}")  # 0
    
    content = f.read(5)
    print(f"读取5个字符后位置: {f.tell()}")
    
    content = f.read(3)
    print(f"再读取3个字符后位置: {f.tell()}")
```

### seek() - 移动文件指针

```python
# seek(offset, whence)
# offset: 偏移量
# whence: 参考位置
#   0 - 文件开头（默认）
#   1 - 当前位置
#   2 - 文件末尾

# 从文件开头移动
with open("file.txt", "r", encoding="utf-8") as f:
    f.seek(10)  # 移动到第10个字节
    content = f.read(5)
    print(content)

# 从当前位置移动（文本模式下只能用0）
with open("file.txt", "rb") as f:  # 二进制模式
    f.read(10)
    f.seek(5, 1)  # 从当前位置向后移动5字节
    content = f.read()

# 从文件末尾移动（二进制模式）
with open("file.txt", "rb") as f:
    f.seek(-10, 2)  # 从末尾向前移动10字节
    content = f.read()  # 读取最后10字节

# 回到文件开头
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    f.seek(0)  # 回到开头
    content_again = f.read()  # 可以再次读取
```

### 文件指针应用示例

```python
# 示例：读取文件头部和尾部
def read_head_and_tail(file_path, head_lines=5, tail_lines=5):
    """读取文件头部和尾部"""
    with open(file_path, "r", encoding="utf-8") as f:
        # 读取头部
        head = []
        for i, line in enumerate(f):
            if i >= head_lines:
                break
            head.append(line.rstrip())
        
        # 读取尾部（需要重新打开或使用其他方法）
        f.seek(0)  # 回到开头
        all_lines = f.readlines()
        tail = [line.rstrip() for line in all_lines[-tail_lines:]]
    
    return head, tail

# 示例：修改文件特定位置（二进制模式更安全）
with open("data.bin", "r+b") as f:
    # 读取前4字节
    header = f.read(4)
    
    # 修改某个位置的数据
    f.seek(10)  # 移动到位置10
    f.write(b'\xFF\xFF')  # 写入2字节

# 示例：实现简单的日志追加
def append_log(file_path, message):
    """追加日志消息"""
    with open(file_path, "a+", encoding="utf-8") as f:
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {message}\n")

# 示例：读取固定大小记录
def read_records(file_path, record_size=100):
    """读取固定大小的记录"""
    records = []
    with open(file_path, "rb") as f:
        while True:
            record = f.read(record_size)
            if not record:
                break
            if len(record) == record_size:
                records.append(record)
    return records
```

### 文本模式 vs 二进制模式的指针操作

```python
# 文本模式的限制
with open("file.txt", "r", encoding="utf-8") as f:
    f.read(10)
    # f.seek(5, 1)  # 错误！文本模式不能从当前位置移动
    # f.seek(-5, 2)  # 错误！文本模式不能从末尾移动
    f.seek(0)  # 正确：只能从开头移动

# 二进制模式更灵活
with open("file.txt", "rb") as f:
    f.read(10)
    f.seek(5, 1)  # 正确：可以从当前位置移动
    f.seek(-5, 2)  # 正确：可以从末尾移动

# 注意：文本模式下 seek 可能因编码问题产生意外结果
# UTF-8 编码的中文，一个字符可能占3字节
with open("chinese.txt", "r", encoding="utf-8") as f:
    f.seek(3)  # 可能指向一个中文字符的中间位置
    # 这可能导致读取错误
```

## 上下文管理器详解

### 基本原理

```python
# with 语句的工作原理
with open("file.txt", "r") as f:
    content = f.read()
# 等价于：
f = open("file.txt", "r")
try:
    content = f.read()
finally:
    f.close()  # 确保文件关闭

# with 语句保证：
# 1. 无论是否发生异常，文件都会被正确关闭
# 2. 代码更简洁，更易读
# 3. 自动处理资源清理
```

### 自定义上下文管理器

```python
# 方法1：使用类实现
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        """进入上下文时调用"""
        self.file = open(self.filename, self.mode, encoding="utf-8")
        print(f"打开文件: {self.filename}")
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出上下文时调用"""
        if self.file:
            self.file.close()
            print(f"关闭文件: {self.filename}")
        # 返回 False 表示异常会继续传播
        # 返回 True 表示异常被处理
        if exc_type:
            print(f"发生异常: {exc_type.__name__}: {exc_val}")
        return False

# 使用自定义上下文管理器
with FileManager("file.txt", "r") as f:
    content = f.read()

# 方法2：使用 contextlib
from contextlib import contextmanager

@contextmanager
def open_file(filename, mode):
    """使用装饰器创建上下文管理器"""
    f = open(filename, mode, encoding="utf-8")
    try:
        print(f"打开文件: {filename}")
        yield f  # yield 之前的代码相当于 __enter__
    finally:
        print(f"关闭文件: {filename}")
        f.close()  # yield 之后的代码相当于 __exit__

with open_file("file.txt", "r") as f:
    content = f.read()
```

### 同时管理多个资源

```python
# 同时打开多个文件
with open("source.txt", "r", encoding="utf-8") as src, \
     open("dest.txt", "w", encoding="utf-8") as dst:
    content = src.read()
    dst.write(content)

# Python 3.10+ 可以使用括号
with (
    open("file1.txt", "r") as f1,
    open("file2.txt", "r") as f2,
    open("output.txt", "w") as out
):
    content1 = f1.read()
    content2 = f2.read()
    out.write(content1 + content2)

# 使用嵌套 with 语句
with open("file1.txt", "r", encoding="utf-8") as f1:
    with open("file2.txt", "r", encoding="utf-8") as f2:
        with open("output.txt", "w", encoding="utf-8") as out:
            out.write(f1.read() + f2.read())
```

### 上下文管理器最佳实践

```python
# 推荐：总是使用 with 语句
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
# 文件自动关闭，即使发生异常

# 不推荐：手动关闭
f = open("file.txt", "r", encoding="utf-8")
try:
    content = f.read()
finally:
    f.close()  # 代码冗长，容易忘记

# 处理文件操作中的异常
try:
    with open("file.txt", "r", encoding="utf-8") as f:
        content = f.read()
        # 处理内容
except FileNotFoundError:
    print("文件不存在")
except PermissionError:
    print("没有权限访问文件")
except UnicodeDecodeError:
    print("文件编码错误")

# 计时上下文管理器
import time
from contextlib import contextmanager

@contextmanager
def timer(name):
    start = time.time()
    yield
    end = time.time()
    print(f"{name} 耗时: {end - start:.4f}秒")

with timer("文件读取"):
    with open("large_file.txt", "r", encoding="utf-8") as f:
        content = f.read()
```

## JSON 文件操作详解

### JSON 基础操作

```python
import json

# Python 对象转 JSON 字符串
data = {
    "name": "张三",
    "age": 25,
    "scores": [95, 88, 92],
    "active": True,
    "address": None
}

# 基本转换
json_str = json.dumps(data)
print(json_str)

# 格式化输出
json_str = json.dumps(data, indent=2)  # 缩进2空格
print(json_str)

# 保留中文字符（不转义为 Unicode）
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print(json_str)

# 排序键
json_str = json.dumps(data, sort_keys=True, indent=2)
print(json_str)

# JSON 字符串转 Python 对象
parsed = json.loads(json_str)
print(type(parsed))  # <class 'dict'>
print(parsed["name"])
```

### JSON 文件读写

```python
import json

# 写入 JSON 文件
data = {
    "users": [
        {"name": "Alice", "age": 25},
        {"name": "Bob", "age": 30}
    ],
    "total": 2
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 读取 JSON 文件
with open("data.json", "r", encoding="utf-8") as f:
    loaded_data = json.load(f)
    print(loaded_data)

# 追加到 JSON 数组文件
def append_to_json_array(file_path, new_item):
    """向 JSON 数组文件追加元素"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []
    
    data.append(new_item)
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 使用示例
append_to_json_array("users.json", {"name": "Charlie", "age": 35})
```

### JSON 类型映射

```python
import json

# Python -> JSON 类型映射
python_data = {
    "dict": {"key": "value"},      # -> JSON object
    "list": [1, 2, 3],             # -> JSON array
    "tuple": (1, 2, 3),            # -> JSON array (元组变数组)
    "str": "hello",                # -> JSON string
    "int": 42,                     # -> JSON number
    "float": 3.14,                 # -> JSON number
    "bool_true": True,             # -> JSON true
    "bool_false": False,           # -> JSON false
    "none": None,                  # -> JSON null
}

json_str = json.dumps(python_data, indent=2)
print(json_str)

# JSON -> Python 类型映射
json_data = '''
{
    "object": {"key": "value"},
    "array": [1, 2, 3],
    "string": "hello",
    "number_int": 42,
    "number_float": 3.14,
    "true": true,
    "false": false,
    "null": null
}
'''

python_obj = json.loads(json_data)
print(type(python_obj["object"]))      # <class 'dict'>
print(type(python_obj["array"]))       # <class 'list'>
print(type(python_obj["number_int"]))  # <class 'int'>
print(type(python_obj["true"]))        # <class 'bool'>
print(type(python_obj["null"]))        # <class 'NoneType'>
```

### 自定义 JSON 序列化

```python
import json
from datetime import datetime, date
from decimal import Decimal

# 自定义编码器
class CustomEncoder(json.JSONEncoder):
    """自定义 JSON 编码器"""
    
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        elif isinstance(obj, Decimal):
            return float(obj)
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

# 使用自定义编码器
data = {
    "name": "Alice",
    "created_at": datetime.now(),
    "birthday": date(1990, 5, 15),
    "price": Decimal("19.99")
}

json_str = json.dumps(data, cls=CustomEncoder, ensure_ascii=False, indent=2)
print(json_str)

# 自定义解码函数
def custom_decoder(dct):
    """自定义解码函数"""
    for key, value in dct.items():
        if isinstance(value, str):
            # 尝试解析日期时间
            try:
                dct[key] = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    dct[key] = datetime.strptime(value, "%Y-%m-%d").date()
                except ValueError:
                    pass
    return dct

# 使用 object_hook 解码
parsed = json.loads(json_str, object_hook=custom_decoder)
```

### JSON 处理最佳实践

```python
import json

# 1. 处理大 JSON 文件
def process_large_json(file_path):
    """逐块处理大 JSON 文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        # 对于大文件，考虑使用 ijson 库
        # pip install ijson
        import ijson
        
        # 流式解析
        for item in ijson.items(f, "item"):
            process(item)

# 2. 美化 JSON 输出
def pretty_print_json(data):
    """美化打印 JSON"""
    print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))

# 3. 安全的 JSON 解析
def safe_json_loads(json_str, default=None):
    """安全的 JSON 解析"""
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON 解析错误: {e}")
        return default

# 4. 验证 JSON 格式
def validate_json(file_path):
    """验证 JSON 文件格式"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            json.load(f)
        return True, "JSON 格式正确"
    except json.JSONDecodeError as e:
        return False, f"JSON 格式错误: {e}"
    except FileNotFoundError:
        return False, "文件不存在"

# 5. 合并多个 JSON 对象
def merge_json_objects(*dicts):
    """合并多个字典"""
    result = {}
    for d in dicts:
        result.update(d)
    return result

# 使用示例
data1 = {"a": 1, "b": 2}
data2 = {"c": 3, "d": 4}
merged = merge_json_objects(data1, data2)
print(json.dumps(merged))
```

## CSV 文件操作详解

### CSV 基础操作

```python
import csv

# 写入 CSV 文件
data = [
    ["姓名", "年龄", "城市"],
    ["张三", 25, "北京"],
    ["李四", 30, "上海"],
    ["王五", 28, "广州"]
]

with open("data.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 读取 CSV 文件
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 逐行写入
with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["姓名", "年龄", "城市"])  # 写入表头
    writer.writerow(["张三", 25, "北京"])       # 写入数据行
```

### 使用 DictReader 和 DictWriter

```python
import csv

# DictReader - 将每行读取为字典
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)  # {'姓名': '张三', '年龄': '25', '城市': '北京'}
        print(row["姓名"], row["年龄"])

# 指定字段名
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f, fieldnames=["name", "age", "city"])
    for row in reader:
        print(row)

# DictWriter - 将字典写入 CSV
data = [
    {"name": "张三", "age": 25, "city": "北京"},
    {"name": "李四", "age": 30, "city": "上海"},
    {"name": "王五", "age": 28, "city": "广州"}
]

with open("output.csv", "w", encoding="utf-8", newline="") as f:
    fieldnames = ["name", "age", "city"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    
    writer.writeheader()  # 写入表头
    writer.writerows(data)  # 写入所有行
    
    # 或逐行写入
    # writer.writerow({"name": "赵六", "age": 35, "city": "深圳"})

# 处理缺失值
data = [
    {"name": "张三", "age": 25, "city": "北京"},
    {"name": "李四", "age": 30},  # 缺少 city
    {"name": "王五", "city": "广州"}  # 缺少 age
]

with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age", "city"], extrasaction="ignore")
    writer.writeheader()
    writer.writerows(data)
```

### CSV 格式配置

```python
import csv

# 自定义分隔符和引用
data = [
    ["姓名", "年龄", "描述"],
    ["张三", 25, "这是一个,包含逗号的描述"],
    ["李四", 30, "这是一个\"带引号\"的描述"]
]

# 使用不同的分隔符
with open("data.tsv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter="\t")  # 制表符分隔
    writer.writerows(data)

# 处理包含特殊字符的数据
with open("quoted.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(
        f,
        delimiter=",",           # 分隔符
        quotechar='"',            # 引用字符
        quoting=csv.QUOTE_ALL,   # 引用所有字段
        escapechar='\\'          # 转义字符
    )
    writer.writerows(data)

# quoting 选项：
# csv.QUOTE_ALL     - 引用所有字段
# csv.QUOTE_MINIMAL - 只引用包含特殊字符的字段（默认）
# csv.QUOTE_NONNUMERIC - 引用非数字字段
# csv.QUOTE_NONE    - 不引用字段

# 读取带配置的 CSV
with open("quoted.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f, quotechar='"')
    for row in reader:
        print(row)
```

### CSV 处理最佳实践

```python
import csv

# 1. 处理大 CSV 文件
def process_large_csv(file_path, batch_size=1000):
    """分批处理大 CSV 文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        batch = []
        
        for row in reader:
            batch.append(row)
            if len(batch) >= batch_size:
                process_batch(batch)
                batch = []
        
        # 处理最后一批
        if batch:
            process_batch(batch)

def process_batch(batch):
    """处理一批数据"""
    print(f"处理 {len(batch)} 条记录")

# 2. 过滤 CSV 数据
def filter_csv(input_file, output_file, filter_func):
    """过滤 CSV 数据"""
    with open(input_file, "r", encoding="utf-8") as fin, \
         open(output_file, "w", encoding="utf-8", newline="") as fout:
        
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=reader.fieldnames)
        writer.writeheader()
        
        for row in reader:
            if filter_func(row):
                writer.writerow(row)

# 使用示例：只保留年龄大于25的记录
filter_csv(
    "input.csv",
    "output.csv",
    lambda row: int(row["年龄"]) > 25
)

# 3. CSV 数据转换
def transform_csv(input_file, output_file, transform_func):
    """转换 CSV 数据"""
    with open(input_file, "r", encoding="utf-8") as fin, \
         open(output_file, "w", encoding="utf-8", newline="") as fout:
        
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=reader.fieldnames)
        writer.writeheader()
        
        for row in reader:
            transformed = transform_func(row)
            writer.writerow(transformed)

# 4. 合并多个 CSV 文件
def merge_csv_files(output_file, *input_files):
    """合并多个 CSV 文件"""
    first_file = True
    
    with open(output_file, "w", encoding="utf-8", newline="") as fout:
        writer = None
        
        for input_file in input_files:
            with open(input_file, "r", encoding="utf-8") as fin:
                reader = csv.DictReader(fin)
                
                if first_file:
                    writer = csv.DictWriter(fout, fieldnames=reader.fieldnames)
                    writer.writeheader()
                    first_file = False
                
                for row in reader:
                    writer.writerow(row)

# 5. 统计 CSV 数据
def analyze_csv(file_path):
    """分析 CSV 文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
        print(f"总行数: {len(rows)}")
        print(f"字段: {reader.fieldnames}")
        
        # 统计数值字段
        for field in reader.fieldnames:
            try:
                values = [float(row[field]) for row in rows if row[field]]
                if values:
                    print(f"{field}: 平均值={sum(values)/len(values):.2f}, "
                          f"最小值={min(values)}, 最大值={max(values)}")
            except ValueError:
                pass
```

## pickle 序列化

### pickle 基础操作

```python
import pickle

# 序列化 Python 对象
data = {
    "name": "张三",
    "age": 25,
    "scores": [95, 88, 92],
    "active": True
}

# 序列化为字节
bytes_data = pickle.dumps(data)
print(f"序列化后: {len(bytes_data)} 字节")

# 反序列化
loaded_data = pickle.loads(bytes_data)
print(loaded_data)

# 序列化到文件
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

# 从文件反序列化
with open("data.pkl", "rb") as f:
    loaded_data = pickle.load(f)
    print(loaded_data)

# 序列化多个对象
data1 = {"a": 1}
data2 = [1, 2, 3]
data3 = "hello"

with open("multi.pkl", "wb") as f:
    pickle.dump(data1, f)
    pickle.dump(data2, f)
    pickle.dump(data3, f)

with open("multi.pkl", "rb") as f:
    obj1 = pickle.load(f)
    obj2 = pickle.load(f)
    obj3 = pickle.load(f)
    print(obj1, obj2, obj3)
```

### pickle 支持的类型

```python
import pickle
from datetime import datetime

# pickle 支持多种 Python 类型
data = {
    # 基本类型
    "int": 42,
    "float": 3.14,
    "str": "hello",
    "bool": True,
    "none": None,
    
    # 容器类型
    "list": [1, 2, 3],
    "tuple": (1, 2, 3),
    "dict": {"key": "value"},
    "set": {1, 2, 3},
    
    # 嵌套结构
    "nested": {
        "list": [{"a": 1}, {"b": 2}],
        "tuple": ((1, 2), (3, 4))
    },
    
    # 特殊对象
    "datetime": datetime.now(),
    "bytes": b"binary data",
    
    # 函数引用（不是函数调用结果）
    "func_ref": len,  # 保存函数引用
}

# 序列化和反序列化
serialized = pickle.dumps(data)
deserialized = pickle.loads(serialized)

print(deserialized["datetime"])  # datetime 对象
print(deserialized["func_ref"]([1, 2, 3]))  # 调用 len 函数

# 自定义类的序列化
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __repr__(self):
        return f"Person(name={self.name}, age={self.age})"

person = Person("张三", 25)
serialized = pickle.dumps(person)
loaded = pickle.loads(serialized)
print(loaded)  # Person(name=张三, age=25)
```

### pickle 协议版本

```python
import pickle

data = {"name": "张三", "age": 25}

# 不同协议版本
for protocol in range(pickle.HIGHEST_PROTOCOL + 1):
    serialized = pickle.dumps(data, protocol=protocol)
    print(f"协议 {protocol}: {len(serialized)} 字节")

# 推荐使用最高版本
serialized = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)

# 查看当前支持的最高协议
print(f"最高协议版本: {pickle.HIGHEST_PROTOCOL}")
```

### pickle 安全注意事项

```python
import pickle

# ⚠️ 危险：不要反序列化不可信的数据
# pickle 可以执行任意代码！

# 危险示例（不要运行）
# malicious = pickle.loads(untrusted_data)  # 可能执行恶意代码

# 安全替代方案
import json

# 使用 JSON 处理不可信数据
def safe_deserialize(data_str):
    """安全地反序列化数据"""
    try:
        return json.loads(data_str)
    except json.JSONDecodeError:
        raise ValueError("无效的数据格式")

# 如果必须使用 pickle，限制反序列化的类
import pickle
from typing import Any

class RestrictedUnpickler(pickle.Unpickler):
    """限制反序列化的类"""
    
    ALLOWED_CLASSES = {
        ('builtins', 'dict'): dict,
        ('builtins', 'list'): list,
        ('builtins', 'tuple'): tuple,
        ('builtins', 'str'): str,
        ('builtins', 'int'): int,
        ('builtins', 'float'): float,
        ('builtins', 'bool'): bool,
        ('builtins', 'NoneType'): type(None),
    }
    
    def find_class(self, module, name):
        """只允许特定的类被反序列化"""
        key = (module, name)
        if key in self.ALLOWED_CLASSES:
            return self.ALLOWED_CLASSES[key]
        raise pickle.UnpicklingError(f"不允许反序列化 {module}.{name}")

def safe_loads(data):
    """安全的 pickle 反序列化"""
    return RestrictedUnpickler(data).load()
```

### pickle vs JSON 对比

```python
import pickle
import json
from datetime import datetime

# 对比 pickle 和 JSON

data = {
    "name": "张三",
    "age": 25,
    "scores": [95, 88, 92],
    "datetime": datetime.now(),  # pickle 支持，JSON 不支持
}

# pickle
pickle_data = pickle.dumps(data)
print(f"pickle 大小: {len(pickle_data)} 字节")

# JSON（需要处理 datetime）
json_data = json.dumps(data, default=str, ensure_ascii=False)
print(f"JSON 大小: {len(json_data.encode())} 字节")

# 对比表
print("""
| 特性 | pickle | JSON |
|------|--------|------|
| 支持类型 | 所有 Python 类型 | 基本类型 |
| 跨语言 | 仅 Python | 跨语言 |
| 安全性 | 不安全 | 安全 |
| 可读性 | 二进制，不可读 | 文本，可读 |
| 效率 | 较高 | 较低 |
| 适用场景 | Python 内部数据交换 | 跨语言数据交换 |
""")
```

## 文件和目录操作

### os 模块

```python
import os

# 当前目录
print(f"当前目录: {os.getcwd()}")
os.chdir("/tmp")  # 切换目录
print(f"切换后目录: {os.getcwd()}")

# 目录操作
os.mkdir("new_folder")           # 创建目录
os.makedirs("a/b/c", exist_ok=True)  # 递归创建目录

# 列出目录内容
for item in os.listdir("."):
    print(item)

# 文件信息
print(f"文件大小: {os.path.getsize('file.txt')} 字节")
print(f"修改时间: {os.path.getmtime('file.txt')}")

# 路径操作
path = "/home/user/documents/file.txt"
print(f"目录名: {os.path.dirname(path)}")
print(f"文件名: {os.path.basename(path)}")
print(f"扩展名: {os.path.splitext(path)}")
print(f"绝对路径: {os.path.abspath('file.txt')}")
print(f"路径是否存在: {os.path.exists('file.txt')}")
print(f"是否是文件: {os.path.isfile('file.txt')}")
print(f"是否是目录: {os.path.isdir('folder')}")

# 文件操作
os.rename("old.txt", "new.txt")  # 重命名
os.remove("file.txt")             # 删除文件
os.rmdir("empty_folder")           # 删除空目录

# 环境变量
print(f"HOME: {os.environ.get('HOME')}")
print(f"PATH: {os.environ.get('PATH')}")

# 遍历目录树
for root, dirs, files in os.walk("."):
    print(f"目录: {root}")
    print(f"子目录: {dirs}")
    print(f"文件: {files}")
```

### pathlib 模块（推荐）

```python
from pathlib import Path

# 创建 Path 对象
p = Path(".")
print(f"当前目录: {p.resolve()}")

# 路径拼接（推荐使用 / 运算符）
data_dir = Path("data")
file_path = data_dir / "files" / "test.txt"
print(f"文件路径: {file_path}")

# 路径属性
file_path = Path("/home/user/documents/file.txt")
print(f"父目录: {file_path.parent}")
print(f"文件名: {file_path.name}")
print(f"文件名（无扩展名）: {file_path.stem}")
print(f"扩展名: {file_path.suffix}")
print(f"所有扩展名: {file_path.suffixes}")
print(f"绝对路径: {file_path.resolve()}")

# 路径检查
p = Path("file.txt")
print(f"存在: {p.exists()}")
print(f"是文件: {p.is_file()}")
print(f"是目录: {p.is_dir()}")

# 创建目录
Path("new_folder").mkdir(exist_ok=True)
Path("a/b/c").mkdir(parents=True, exist_ok=True)

# 读写文件
p = Path("test.txt")
p.write_text("Hello, World!", encoding="utf-8")
content = p.read_text(encoding="utf-8")
print(content)

# 二进制读写
p.write_bytes(b"\x00\x01\x02\x03")
data = p.read_bytes()

# 列出目录
for item in Path(".").iterdir():
    print(item)

# 使用 glob 匹配文件
for txt_file in Path(".").glob("*.txt"):
    print(txt_file)

# 递归匹配
for py_file in Path(".").rglob("*.py"):
    print(py_file)

# 重命名和删除
p = Path("old.txt")
p.rename("new.txt")
p.unlink()  # 删除文件

# 目录操作
p = Path("empty_folder")
p.rmdir()  # 删除空目录

# 遍历目录树
for root, dirs, files in Path(".").walk():
    print(f"目录: {root}")
    for f in files:
        print(f"  文件: {f}")
```

### os vs pathlib 对比

```python
import os
from pathlib import Path

# 获取当前目录
# os
current_dir = os.getcwd()
# pathlib
current_dir = Path.cwd()

# 路径拼接
# os
path = os.path.join("data", "files", "test.txt")
# pathlib
path = Path("data") / "files" / "test.txt"

# 获取文件名
# os
filename = os.path.basename("/path/to/file.txt")
# pathlib
filename = Path("/path/to/file.txt").name

# 获取扩展名
# os
ext = os.path.splitext("/path/to/file.txt")[1]
# pathlib
ext = Path("/path/to/file.txt").suffix

# 创建目录
# os
os.makedirs("a/b/c", exist_ok=True)
# pathlib
Path("a/b/c").mkdir(parents=True, exist_ok=True)

# 列出目录
# os
items = os.listdir(".")
# pathlib
items = list(Path(".").iterdir())

# pathlib 更简洁、更面向对象，推荐使用
```

### 文件操作实用函数

```python
import os
import shutil
from pathlib import Path

# 复制文件
shutil.copy("source.txt", "dest.txt")       # 复制文件内容
shutil.copy2("source.txt", "dest.txt")       # 复制文件内容和元数据

# 复制目录
shutil.copytree("source_dir", "dest_dir")

# 删除目录（包括内容）
shutil.rmtree("folder")

# 移动文件或目录
shutil.move("source.txt", "dest.txt")
shutil.move("old_folder", "new_folder")

# 获取文件大小
def get_file_size(file_path):
    """获取文件大小（人类可读格式）"""
    size = os.path.getsize(file_path)
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} PB"

print(get_file_size("large_file.txt"))

# 批量重命名
def batch_rename(directory, pattern, replacement):
    """批量重命名文件"""
    for file_path in Path(directory).glob(pattern):
        new_name = file_path.name.replace(pattern.replace("*", ""), replacement)
        file_path.rename(file_path.parent / new_name)

# 查找重复文件
def find_duplicates(directory):
    """查找重复文件（基于大小）"""
    size_map = {}
    for file_path in Path(directory).rglob("*"):
        if file_path.is_file():
            size = file_path.stat().st_size
            if size not in size_map:
                size_map[size] = []
            size_map[size].append(file_path)
    
    return {k: v for k, v in size_map.items() if len(v) > 1}

# 清理空目录
def clean_empty_dirs(directory):
    """删除所有空目录"""
    for root, dirs, files in os.walk(directory, topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)
                print(f"删除空目录: {dir_path}")
```

## 文件编码处理

### 常见编码问题

```python
# 常见编码错误
# 错误示例：使用错误的编码读取文件
try:
    with open("chinese.txt", "r", encoding="ascii") as f:
        content = f.read()
except UnicodeDecodeError as e:
    print(f"编码错误: {e}")

# 常见编码
# UTF-8: 最常用，支持所有 Unicode 字符
# GBK/GB2312: 中文编码
# ASCII: 只支持英文字符
# Latin-1: 西欧编码

# 正确指定编码
with open("chinese.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 处理编码错误
# errors 参数：
# 'strict' - 默认，抛出异常
# 'ignore' - 忽略错误字符
# 'replace' - 用 ? 替换错误字符
# 'backslashreplace' - 用 \xNN 替换

with open("file.txt", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

with open("file.txt", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# 自动检测编码
import chardet  # pip install chardet

def detect_encoding(file_path):
    """检测文件编码"""
    with open(file_path, "rb") as f:
        raw_data = f.read(10000)  # 读取部分数据
        result = chardet.detect(raw_data)
        return result["encoding"]

encoding = detect_encoding("unknown.txt")
print(f"检测到编码: {encoding}")

with open("unknown.txt", "r", encoding=encoding) as f:
    content = f.read()
```

### 编码转换

```python
# 文件编码转换
def convert_encoding(input_file, output_file, from_encoding, to_encoding="utf-8"):
    """转换文件编码"""
    with open(input_file, "r", encoding=from_encoding, errors="replace") as f:
        content = f.read()
    
    with open(output_file, "w", encoding=to_encoding) as f:
        f.write(content)

# GBK 转 UTF-8
convert_encoding("gbk.txt", "utf8.txt", "gbk", "utf-8")

# 字符串编码转换
text = "你好，世界"

# 字符串 -> 字节
utf8_bytes = text.encode("utf-8")
gbk_bytes = text.encode("gbk")

print(f"UTF-8 字节: {utf8_bytes}")
print(f"GBK 字节: {gbk_bytes}")

# 字节 -> 字符串
text_from_utf8 = utf8_bytes.decode("utf-8")
text_from_gbk = gbk_bytes.decode("gbk")

# 处理 BOM（字节顺序标记）
# UTF-8 BOM: \xef\xbb\xbf
# UTF-16 LE BOM: \xff\xfe
# UTF-16 BE BOM: \xfe\xff

# 读取带 BOM 的文件
with open("bom_file.txt", "r", encoding="utf-8-sig") as f:
    content = f.read()  # BOM 会被自动移除

# 写入带 BOM 的文件
with open("output.txt", "w", encoding="utf-8-sig") as f:
    f.write("Hello")  # 会自动添加 BOM
```

### 编码最佳实践

```python
# 1. 始终显式指定编码
# 推荐
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 不推荐（依赖系统默认编码）
with open("file.txt", "r") as f:
    content = f.read()

# 2. 使用 UTF-8 作为默认编码
import locale
import sys

# 查看系统默认编码
print(f"默认编码: {locale.getpreferredencoding()}")
print(f"文件系统编码: {sys.getfilesystemencoding()}")

# 3. 处理不同来源的文本
def safe_read_text(file_path, encodings=["utf-8", "gbk", "gb2312", "latin-1"]):
    """尝试多种编码读取文件"""
    for encoding in encodings:
        try:
            with open(file_path, "r", encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise ValueError(f"无法解码文件: {file_path}")

# 4. 写入时确保编码一致
def write_text(file_path, content, encoding="utf-8"):
    """写入文本文件"""
    with open(file_path, "w", encoding=encoding) as f:
        f.write(content)

# 5. 处理 CSV 编码
import csv

# 读取可能包含中文的 CSV
with open("data.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 写入 CSV
with open("output.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["姓名", "年龄", "城市"])
```

## 二进制文件操作

### 基本二进制操作

```python
# 读取二进制文件
with open("image.png", "rb") as f:
    data = f.read()
    print(f"文件大小: {len(data)} 字节")

# 写入二进制文件
with open("output.bin", "wb") as f:
    f.write(b"\x00\x01\x02\x03")
    f.write(bytes([4, 5, 6, 7]))
    f.write(bytearray([8, 9, 10]))

# 读取指定字节数
with open("file.bin", "rb") as f:
    header = f.read(4)      # 读取前4字节
    data = f.read(1024)     # 读取接下来的1024字节
    remaining = f.read()    # 读取剩余所有字节

# 分块读取大文件
def read_binary_in_chunks(file_path, chunk_size=8192):
    """分块读取二进制文件"""
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk

for chunk in read_binary_in_chunks("large_file.bin"):
    process(chunk)
```

### struct 模块 - 二进制数据打包

```python
import struct

# 打包数据为二进制
# 格式字符：
# b/B - 有符号/无符号 char (1字节)
# h/H - 有符号/无符号 short (2字节)
# i/I - 有符号/无符号 int (4字节)
# f - float (4字节)
# d - double (8字节)
# < - 小端序
# > - 大端序
# ! - 网络字节序（大端）

# 打包整数
packed = struct.pack("<i", 12345)  # 小端序，4字节整数
print(f"打包后: {packed}")
print(f"字节数: {len(packed)}")

# 解包整数
unpacked = struct.unpack("<i", packed)[0]
print(f"解包后: {unpacked}")

# 打包多个值
packed = struct.pack("<if", 42, 3.14)  # 整数 + 浮点数
print(f"打包后: {packed}")

# 解包多个值
values = struct.unpack("<if", packed)
print(f"解包后: {values}")

# 写入二进制结构
with open("data.bin", "wb") as f:
    # 写入文件头：魔数 + 版本 + 数据数量
    f.write(struct.pack("<4sii", b"DATA", 1, 100))
    
    # 写入数据
    for i in range(100):
        f.write(struct.pack("<if", i, float(i) * 0.1))

# 读取二进制结构
with open("data.bin", "rb") as f:
    # 读取文件头
    header = f.read(12)
    magic, version, count = struct.unpack("<4sii", header)
    print(f"魔数: {magic}, 版本: {version}, 数量: {count}")
    
    # 读取数据
    for _ in range(count):
        data = f.read(8)
        idx, value = struct.unpack("<if", data)
        print(f"索引: {idx}, 值: {value}")
```

### 二进制文件处理示例

```python
import struct

# 示例：读取 BMP 文件头
def read_bmp_header(file_path):
    """读取 BMP 文件头信息"""
    with open(file_path, "rb") as f:
        # BMP 文件头 (14字节)
        header = f.read(14)
        signature, file_size, reserved, offset = struct.unpack("<2sIHI", header)
        
        print(f"文件类型: {signature}")
        print(f"文件大小: {file_size} 字节")
        print(f"数据偏移: {offset} 字节")
        
        # DIB 头 (通常 40 字节)
        dib_header = f.read(40)
        (header_size, width, height, planes, bits_per_pixel,
         compression, image_size, x_resolution, y_resolution,
         colors, important_colors) = struct.unpack("<IiiHHIIiiII", dib_header)
        
        print(f"图像宽度: {width} 像素")
        print(f"图像高度: {height} 像素")
        print(f"位深度: {bits_per_pixel} 位")

# 示例：复制文件
def copy_file(src, dst):
    """复制文件"""
    with open(src, "rb") as f_src, open(dst, "wb") as f_dst:
        while True:
            chunk = f_src.read(8192)
            if not chunk:
                break
            f_dst.write(chunk)

# 示例：计算文件哈希
import hashlib

def calculate_hash(file_path, algorithm="md5"):
    """计算文件哈希值"""
    hash_func = getattr(hashlib, algorithm)()
    
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            hash_func.update(chunk)
    
    return hash_func.hexdigest()

print(f"MD5: {calculate_hash('file.txt', 'md5')}")
print(f"SHA256: {calculate_hash('file.txt', 'sha256')}")

# 示例：比较两个文件
def compare_files(file1, file2):
    """比较两个文件是否相同"""
    with open(file1, "rb") as f1, open(file2, "rb") as f2:
        while True:
            chunk1 = f1.read(8192)
            chunk2 = f2.read(8192)
            
            if chunk1 != chunk2:
                return False
            
            if not chunk1:  # 两个文件都结束
                return True

# 示例：文件分割与合并
def split_file(file_path, chunk_size):
    """分割文件"""
    with open(file_path, "rb") as f:
        part = 0
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            
            part_file = f"{file_path}.part{part}"
            with open(part_file, "wb") as pf:
                pf.write(chunk)
            
            part += 1
            print(f"创建: {part_file}")

def merge_files(output_file, *part_files):
    """合并文件"""
    with open(output_file, "wb") as f:
        for part_file in part_files:
            with open(part_file, "rb") as pf:
                f.write(pf.read())
```

## 注意事项和最佳实践

### 文件操作最佳实践

```python
# 1. 始终使用 with 语句
# 推荐
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 不推荐
f = open("file.txt", "r")
try:
    content = f.read()
finally:
    f.close()

# 2. 始终指定编码
# 推荐
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 不推荐（使用系统默认编码）
with open("file.txt", "r") as f:
    content = f.read()

# 3. 处理大文件时使用迭代
# 推荐
with open("large.txt", "r", encoding="utf-8") as f:
    for line in f:
        process(line)

# 不推荐
with open("large.txt", "r", encoding="utf-8") as f:
    content = f.read()  # 可能占用大量内存

# 4. 使用 pathlib 进行路径操作
# 推荐
from pathlib import Path
file_path = Path("data") / "files" / "test.txt"

# 不推荐
import os
file_path = os.path.join("data", "files", "test.txt")

# 5. 检查文件是否存在再操作
from pathlib import Path

file_path = Path("file.txt")
if file_path.exists():
    content = file_path.read_text(encoding="utf-8")
else:
    print("文件不存在")

# 6. 使用 try-except 处理异常
try:
    with open("file.txt", "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")
except PermissionError:
    print("没有权限访问文件")
except UnicodeDecodeError:
    print("文件编码错误")
except IOError as e:
    print(f"IO 错误: {e}")

# 7. 写入文件时考虑备份
import shutil
from pathlib import Path

def safe_write(file_path, content):
    """安全写入文件（带备份）"""
    file_path = Path(file_path)
    
    # 备份原文件
    if file_path.exists():
        backup_path = file_path.with_suffix(file_path.suffix + ".bak")
        shutil.copy2(file_path, backup_path)
    
    # 写入新文件
    temp_path = file_path.with_suffix(file_path.suffix + ".tmp")
    try:
        temp_path.write_text(content, encoding="utf-8")
        temp_path.replace(file_path)  # 原子操作
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        raise
```

### 性能优化建议

```python
# 1. 使用适当的缓冲区大小
# 默认缓冲区通常是 8KB，可以根据需要调整
with open("large.bin", "rb", buffering=65536) as f:  # 64KB 缓冲区
    data = f.read()

# 2. 批量写入而非逐行写入
# 推荐
lines = ["line1\n", "line2\n", "line3\n"]
with open("output.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)

# 不推荐
with open("output.txt", "w", encoding="utf-8") as f:
    for line in lines:
        f.write(line)  # 多次 I/O 操作

# 3. 使用生成器处理大文件
def process_large_file(file_path):
    """使用生成器处理大文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            yield line.strip()

# 使用
for line in process_large_file("large.txt"):
    process(line)

# 4. 避免重复打开文件
# 推荐
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    # 在同一个 with 块中处理所有操作
    lines = content.split("\n")
    word_count = len(content.split())

# 不推荐
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
with open("file.txt", "r", encoding="utf-8") as f:  # 重复打开
    lines = f.readlines()
```

## 常见错误示例

### 文件未关闭

```python
# 错误示例
f = open("file.txt", "w")
f.write("Hello")
# 忘记关闭文件！数据可能丢失

# 正确做法
with open("file.txt", "w") as f:
    f.write("Hello")
# 文件自动关闭
```

### 编码错误

```python
# 错误示例：未指定编码
with open("chinese.txt", "r") as f:  # 可能使用错误的编码
    content = f.read()  # 可能抛出 UnicodeDecodeError

# 正确做法
with open("chinese.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

### 文件不存在错误

```python
# 错误示例：未检查文件是否存在
with open("not_exist.txt", "r") as f:  # FileNotFoundError
    content = f.read()

# 正确做法
from pathlib import Path

file_path = Path("not_exist.txt")
if file_path.exists():
    content = file_path.read_text(encoding="utf-8")
else:
    print("文件不存在")

# 或使用异常处理
try:
    with open("not_exist.txt", "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")
```

### 写入模式覆盖文件

```python
# 错误示例：误用 "w" 模式
with open("important_data.txt", "w") as f:  # 文件内容被清空！
    f.write("新内容")

# 如果想追加内容
with open("important_data.txt", "a") as f:
    f.write("追加内容")

# 如果想避免覆盖
try:
    with open("important_data.txt", "x") as f:  # 文件存在则报错
        f.write("新内容")
except FileExistsError:
    print("文件已存在，无法创建")
```

### 文件指针问题

```python
# 错误示例：读取后无法再次读取
with open("file.txt", "r") as f:
    content1 = f.read()  # 读取全部内容
    content2 = f.read()  # 返回空字符串！指针已在末尾

# 正确做法
with open("file.txt", "r") as f:
    content1 = f.read()
    f.seek(0)  # 重置指针到开头
    content2 = f.read()

# 或者重新打开文件
with open("file.txt", "r") as f:
    content1 = f.read()
with open("file.txt", "r") as f:
    content2 = f.read()
```

### CSV 写入空行问题

```python
# 错误示例：Windows 下 CSV 文件出现空行
import csv

with open("data.csv", "w", encoding="utf-8") as f:  # 缺少 newline=""
    writer = csv.writer(f)
    writer.writerow(["a", "b", "c"])  # Windows 下会产生空行

# 正确做法
with open("data.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["a", "b", "c"])
```

### pickle 安全问题

```python
# 危险示例：反序列化不可信数据
import pickle

# 不要这样做！
# data = pickle.loads(untrusted_data)  # 可能执行恶意代码

# 安全替代方案
import json

# 使用 JSON 处理不可信数据
data = json.loads(untrusted_data)  # 安全
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch08_file_io) 完成以下任务：

1. **读取文件** - 读取一个文本文件并统计行数、字数、字符数
2. **JSON 处理** - 读写 JSON 格式的配置文件，实现增删改查
3. **CSV 数据处理** - 读取 CSV 文件，进行数据过滤和统计分析
4. **批量重命名** - 批量重命名文件夹中的文件
5. **文件编码转换** - 将 GBK 编码的文件转换为 UTF-8 编码
6. **二进制文件处理** - 读取并解析简单的二进制文件格式

---

**[下一章预告]** → 异常处理：处理程序运行中的错误