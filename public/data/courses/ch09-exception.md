# 异常处理

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>程序运行中难免出错，异常处理让我们能够优雅地应对错误，而不是让程序崩溃。</p>
</div>

## 基本的 try-except

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("错误：除数不能为零！")
except ValueError:
    print("错误：值类型不正确！")
```

## 捕获异常对象

```python
try:
    num = int(input("请输入一个数字："))
except ValueError as e:
    print(f"输入错误：{e}")
```

## 完整的异常处理结构

```python
try:
    # 可能出错的代码
    risky_operation()
except SomeError:
    # 处理特定异常
    handle_error()
except Exception as e:
    # 捕获其他所有异常
    print(f"未知错误：{e}")
else:
    # 没有异常时执行
    print("操作成功！")
finally:
    # 无论是否有异常都执行
    cleanup()
```

## 常见的异常类型

| 异常类型 | 说明 |
|---------|------|
| `ZeroDivisionError` | 除数为零 |
| `ValueError` | 值类型错误 |
| `TypeError` | 类型错误 |
| `IndexError` | 索引超出范围 |
| `KeyError` | 字典键不存在 |
| `FileNotFoundError` | 文件不存在 |
| `AttributeError` | 属性不存在 |

## 自定义异常

```python
class AgeError(Exception):
    """年龄异常"""
    pass

def set_age(age):
    if age < 0 or age > 150:
        raise AgeError(f"无效的年龄：{age}")
    print(f"年龄设置为：{age}")

try:
    set_age(200)
except AgeError as e:
    print(f"捕获到异常：{e}")
```

## 异常处理的最佳实践

```python
# ❌ 不推荐的写法（捕获所有异常）
try:
    risky_operation()
except:
    pass

# ✅ 推荐写法（具体明确）
try:
    with open("file.txt", "r") as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")
except PermissionError:
    print("没有读取权限")
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch09_exception) 完成以下任务：

1. **除法计算器** - 处理除法运算的零除错误
2. **类型转换** - 安全地将用户输入转换为整数
3. **自定义异常** - 创建一个用于验证密码的异常

---

**[下一章预告]** → 面向对象编程：类和对象
