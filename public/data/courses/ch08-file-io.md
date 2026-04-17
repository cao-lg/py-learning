# 文件操作

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>文件操作允许程序读取和写入文件，实现数据的持久化存储。</p>
</div>

## 读写文本文件

```python
# 读取文件
with open("example.txt", "r", encoding="utf-8") as f:
    content = f.read()          # 读取全部内容
    # 或逐行读取
    # lines = f.readlines()
    # 或
    # for line in f:
    #     print(line)

# 写入文件
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")
    f.write("第二行内容")

# 追加内容
with open("output.txt", "a", encoding="utf-8") as f:
    f.write("\n这是追加的内容")
```

## JSON 数据处理

```python
import json

# Python 对象转 JSON 字符串
data = {"name": "Alice", "age": 20, "scores": [95, 88, 92]}
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print(json_str)

# JSON 字符串转 Python 对象
parsed = json.loads(json_str)
print(parsed["name"])  # "Alice"

# 直接读写 JSON 文件
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

## 上下文管理器

使用 `with` 语句确保文件正确关闭：

```python
# 推荐写法
with open("file.txt", "r") as f:
    content = f.read()
# 文件在这里自动关闭

# 不推荐的写法
f = open("file.txt", "r")
content = f.read()
f.close()  # 容易忘记，而且可能出异常时不执行
```

## 文件操作函数

```python
import os

os.path.exists("file.txt")      # 文件是否存在
os.path.isfile("file.txt")      # 是否是文件
os.path.isdir("folder")         # 是否是目录
os.path.getsize("file.txt")     # 文件大小（字节）
os.path.getmtime("file.txt")    # 修改时间（时间戳）

# 目录操作
os.listdir(".")                 # 列出目录内容
os.mkdir("new_folder")         # 创建目录
os.makedirs("a/b/c")            # 递归创建目录
os.remove("file.txt")           # 删除文件
os.rmdir("empty_folder")        # 删除空目录
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch08_file_io) 完成以下任务：

1. **读取文件** - 读取一个文本文件并统计行数
2. **JSON 处理** - 读写 JSON 格式的配置文件
3. **批量重命名** - 批量重命名文件夹中的文件

---

**[下一章预告]** → 异常处理：处理程序运行中的错误
