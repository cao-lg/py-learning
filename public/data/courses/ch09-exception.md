# 异常处理

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>程序运行中难免出错，异常处理让我们能够优雅地应对错误，而不是让程序崩溃。本章将系统学习Python异常处理的完整知识体系，包括异常捕获、自定义异常、异常链、断言以及最佳实践。</p>
</div>

## 什么是异常

异常是程序运行时发生的错误事件，它会中断程序的正常执行流程。Python使用异常对象来表示错误，当发生异常时，Python会创建一个异常对象并"抛出"（raise）它。

```python
# 没有异常处理时，程序会崩溃
print(10 / 0)  # ZeroDivisionError: division by zero
print("这行代码不会执行")
```

```python
# 使用异常处理后，程序可以优雅地处理错误
try:
    print(10 / 0)
except ZeroDivisionError:
    print("除数不能为零！")
print("程序继续执行...")  # 这行代码会执行
```

## 基本的 try-except

最简单的异常处理结构：

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("错误：除数不能为零！")
```

### 捕获多个异常类型

当一段代码可能抛出多种异常时，可以分别处理：

```python
try:
    num = int(input("请输入一个数字："))
    result = 100 / num
    print(f"结果是：{result}")
except ValueError:
    print("错误：请输入有效的数字！")
except ZeroDivisionError:
    print("错误：除数不能为零！")
```

### 捕获多个异常（合并处理）

如果多种异常的处理逻辑相同，可以合并捕获：

```python
try:
    value = int(input("请输入一个整数："))
    index = int(input("请输入索引："))
    data = [1, 2, 3, 4, 5]
    print(data[index] / value)
except (ValueError, IndexError, ZeroDivisionError) as e:
    print(f"发生错误：{type(e).__name__} - {e}")
```

## 捕获异常对象

使用 `as` 关键字可以获取异常对象，访问详细的错误信息：

```python
try:
    num = int(input("请输入一个数字："))
except ValueError as e:
    print(f"输入错误：{e}")
    print(f"异常类型：{type(e).__name__}")
```

### 异常对象的属性和方法

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"异常信息：{e}")
    print(f"异常类型：{type(e)}")
    print(f"异常参数：{e.args}")
    print(f"字符串表示：{str(e)}")
    print(f"repr表示：{repr(e)}")
```

## 完整的异常处理结构（try-except-else-finally）

Python异常处理的完整语法包含四个部分：

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

### 详细示例

```python
def divide_numbers(a, b):
    """安全的除法函数"""
    result = None
    try:
        print(f"尝试计算 {a} / {b}")
        result = a / b
    except ZeroDivisionError as e:
        print(f"❌ 错误：{e}")
        result = None
    except TypeError as e:
        print(f"❌ 类型错误：{e}")
        result = None
    else:
        print("✅ 计算成功！")
    finally:
        print("📊 计算结束，执行清理工作...")
    return result

# 测试不同情况
print("--- 测试1：正常计算 ---")
print(f"结果：{divide_numbers(10, 2)}")

print("\n--- 测试2：除零错误 ---")
print(f"结果：{divide_numbers(10, 0)}")

print("\n--- 测试3：类型错误 ---")
print(f"结果：{divide_numbers(10, '2')}")
```

### else 和 finally 的使用场景

```python
def read_file(filename):
    """读取文件内容"""
    file = None
    try:
        file = open(filename, 'r', encoding='utf-8')
        content = file.read()
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
        return None
    except PermissionError:
        print(f"没有权限读取文件 {filename}")
        return None
    else:
        # 只有成功读取时才处理内容
        print(f"成功读取 {len(content)} 个字符")
        return content
    finally:
        # 无论成功与否，都要关闭文件
        if file:
            file.close()
            print("文件已关闭")

# 使用 with 语句更简洁（推荐）
def read_file_better(filename):
    """使用 with 语句读取文件"""
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()
        return content
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
        return None
```

### finally 的典型应用：资源清理

```python
class DatabaseConnection:
    def __init__(self):
        self.connected = False
    
    def connect(self):
        print("连接数据库...")
        self.connected = True
    
    def disconnect(self):
        print("断开数据库连接...")
        self.connected = False
    
    def query(self, sql):
        if not self.connected:
            raise RuntimeError("数据库未连接")
        print(f"执行查询：{sql}")
        return ["result1", "result2"]

def safe_query(sql):
    """安全的数据库查询"""
    db = DatabaseConnection()
    try:
        db.connect()
        result = db.query(sql)
        return result
    except Exception as e:
        print(f"查询失败：{e}")
        return None
    finally:
        # 确保连接被关闭
        db.disconnect()
```

## 常见的异常类型详解

### 异常层次结构

Python的异常形成一个层次结构，所有异常都继承自 `BaseException`：

```
BaseException
├── SystemExit                    # sys.exit() 触发
├── KeyboardInterrupt             # 用户按 Ctrl+C
├── GeneratorExit                 # 生成器关闭
└── Exception                     # 所有内置异常的基类
    ├── StopIteration            # 迭代结束
    ├── ArithmeticError          # 算术错误基类
    │   ├── ZeroDivisionError   # 除零错误
    │   ├── OverflowError       # 数值溢出
    │   └── FloatingPointError  # 浮点运算错误
    ├── LookupError              # 查找错误基类
    │   ├── IndexError          # 索引越界
    │   └── KeyError            # 键不存在
    ├── ValueError               # 值错误
    ├── TypeError                # 类型错误
    ├── AttributeError           # 属性不存在
    ├── FileNotFoundError        # 文件不存在
    ├── PermissionError          # 权限错误
    ├── ImportError              # 导入错误
    └── RuntimeError             # 运行时错误
```

### 1. SyntaxError（语法错误）

语法错误在代码解析阶段就会被发现，无法用 try-except 捕获：

```python
# ❌ 语法错误示例（这些代码无法运行）
# if True
#     print("缺少冒号")

# for i in range(10)
#     print("缺少冒号")

# print("缺少右括号"
```

```python
# 使用 eval() 或 exec() 时可以捕获语法错误
try:
    eval("if True print('语法错误')")
except SyntaxError as e:
    print(f"语法错误：{e}")
    print(f"文件名：{e.filename}")
    print(f"行号：{e.lineno}")
    print(f"偏移量：{e.offset}")
    print(f"错误文本：{e.text}")
```

### 2. TypeError（类型错误）

当操作或函数应用于不适当类型的对象时触发：

```python
# 类型错误示例
try:
    result = "hello" + 123  # 字符串不能与整数相加
except TypeError as e:
    print(f"TypeError: {e}")

try:
    result = len(123)  # 整数没有长度
except TypeError as e:
    print(f"TypeError: {e}")

try:
    result = [1, 2, 3][1.5]  # 列表索引必须是整数
except TypeError as e:
    print(f"TypeError: {e}")

try:
    result = int("hello") + "world"  # 类型不匹配
except TypeError as e:
    print(f"TypeError: {e}")
```

### 3. ValueError（值错误）

当操作或函数接收到正确类型但不适当的值时触发：

```python
# 值错误示例
try:
    num = int("abc")  # 无法将字符串转换为整数
except ValueError as e:
    print(f"ValueError: {e}")

try:
    num = int("3.14")  # 无法将浮点数字符串直接转为整数
except ValueError as e:
    print(f"ValueError: {e}")

try:
    result = math.sqrt(-1)  # 负数没有实数平方根
except ValueError as e:
    print(f"ValueError: {e}")

try:
    lst = [1, 2, 3]
    lst.remove(10)  # 列表中不存在该元素
except ValueError as e:
    print(f"ValueError: {e}")
```

### 4. IndexError（索引越界）

当序列索引超出范围时触发：

```python
# 索引越界示例
try:
    lst = [1, 2, 3]
    print(lst[10])  # 索引超出范围
except IndexError as e:
    print(f"IndexError: {e}")

try:
    s = "hello"
    print(s[100])  # 字符串索引越界
except IndexError as e:
    print(f"IndexError: {e}")

# 安全访问列表元素
def safe_get(lst, index, default=None):
    """安全获取列表元素"""
    try:
        return lst[index]
    except IndexError:
        return default

data = [1, 2, 3]
print(safe_get(data, 10, "默认值"))  # 输出：默认值
```

### 5. KeyError（键不存在）

当字典中访问不存在的键时触发：

```python
# 键不存在示例
try:
    d = {"name": "张三", "age": 25}
    print(d["gender"])  # 键不存在
except KeyError as e:
    print(f"KeyError: 键 '{e}' 不存在")

# 安全访问字典
d = {"name": "张三", "age": 25}

# 方法1：使用 get() 方法
print(d.get("gender", "未知"))  # 输出：未知

# 方法2：使用 setdefault() 方法
print(d.setdefault("gender", "男"))  # 输出：男
print(d)  # 字典已被修改

# 方法3：使用 in 检查
if "gender" in d:
    print(d["gender"])
else:
    print("键不存在")
```

### 6. FileNotFoundError（文件不存在）

当尝试打开不存在的文件时触发：

```python
# 文件不存在示例
try:
    with open("nonexistent.txt", "r") as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"FileNotFoundError: {e}")
except PermissionError as e:
    print(f"PermissionError: {e}")

# 文件操作的完整异常处理
def safe_read_file(filename):
    """安全读取文件"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"错误：文件 '{filename}' 不存在")
    except PermissionError:
        print(f"错误：没有权限读取文件 '{filename}'")
    except IsADirectoryError:
        print(f"错误：'{filename}' 是一个目录")
    except UnicodeDecodeError:
        print(f"错误：文件 '{filename}' 编码不正确")
    except OSError as e:
        print(f"错误：读取文件时发生系统错误 - {e}")
    return None
```

### 7. ZeroDivisionError（除零错误）

当除数为零时触发：

```python
# 除零错误示例
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"ZeroDivisionError: {e}")

try:
    result = 10 // 0  # 整除也会触发
except ZeroDivisionError as e:
    print(f"ZeroDivisionError: {e}")

try:
    result = 10 % 0  # 取模也会触发
except ZeroDivisionError as e:
    print(f"ZeroDivisionError: {e}")

# 安全除法函数
def safe_divide(a, b, default=None):
    """安全除法，避免除零错误"""
    try:
        return a / b
    except ZeroDivisionError:
        return default

print(safe_divide(10, 2))   # 输出：5.0
print(safe_divide(10, 0))   # 输出：None
print(safe_divide(10, 0, 0))  # 输出：0
```

### 8. AttributeError（属性不存在）

当访问对象不存在的属性或方法时触发：

```python
# 属性不存在示例
try:
    s = "hello"
    s.append("!")  # 字符串没有 append 方法
except AttributeError as e:
    print(f"AttributeError: {e}")

try:
    d = {"name": "张三"}
    d.sort()  # 字典没有 sort 方法
except AttributeError as e:
    print(f"AttributeError: {e}")

# 安全访问属性
class Person:
    def __init__(self, name):
        self.name = name

p = Person("张三")

# 方法1：使用 hasattr() 检查
if hasattr(p, 'age'):
    print(p.age)
else:
    print("属性不存在")

# 方法2：使用 getattr() 函数
print(getattr(p, 'age', '未知'))  # 输出：未知
print(getattr(p, 'name', '未知'))  # 输出：张三
```

### 9. ImportError（导入错误）

当导入模块失败时触发：

```python
# 导入错误示例
try:
    import nonexistent_module
except ImportError as e:
    print(f"ImportError: {e}")

# 导入模块中的特定对象
try:
    from math import cube_root  # math 模块没有这个函数
except ImportError as e:
    print(f"ImportError: {e}")

# 处理可选依赖
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    print("numpy 未安装，使用内置函数")

def sqrt(x):
    if HAS_NUMPY:
        return np.sqrt(x)
    else:
        return x ** 0.5
```

### 10. RuntimeError（运行时错误）

当发生不属于其他类别的错误时触发：

```python
# 运行时错误示例
try:
    # 递归深度过大
    def infinite_recursion():
        return infinite_recursion()
    infinite_recursion()
except RecursionError as e:  # RecursionError 是 RuntimeError 的子类
    print(f"RecursionError: {e}")

# 自定义运行时错误
class StateMachine:
    def __init__(self):
        self.state = "idle"
    
    def process(self, action):
        if self.state == "idle" and action == "run":
            self.state = "running"
        elif self.state == "running" and action == "stop":
            self.state = "idle"
        else:
            raise RuntimeError(f"无效状态转换：{self.state} -> {action}")

machine = StateMachine()
try:
    machine.process("stop")  # 在 idle 状态下不能 stop
except RuntimeError as e:
    print(f"RuntimeError: {e}")
```

### 异常类型汇总表

| 异常类型 | 说明 | 示例 |
|---------|------|------|
| `SyntaxError` | 语法错误 | `if True print()` |
| `TypeError` | 类型错误 | `"hello" + 123` |
| `ValueError` | 值错误 | `int("abc")` |
| `IndexError` | 索引越界 | `[1,2,3][10]` |
| `KeyError` | 键不存在 | `{"a":1}["b"]` |
| `FileNotFoundError` | 文件不存在 | `open("xxx.txt")` |
| `ZeroDivisionError` | 除零错误 | `10 / 0` |
| `AttributeError` | 属性不存在 | `"hello".append()` |
| `ImportError` | 导入错误 | `import nonexistent` |
| `RuntimeError` | 运行时错误 | 自定义运行时错误 |
| `PermissionError` | 权限错误 | 写入只读文件 |
| `StopIteration` | 迭代结束 | `next(iter([]))` |
| `OverflowError` | 数值溢出 | `math.exp(1000)` |
| `KeyboardInterrupt` | 用户中断 | Ctrl+C |
| `MemoryError` | 内存不足 | 创建超大列表 |

## 主动抛出异常（raise）

使用 `raise` 语句可以主动抛出异常：

```python
def set_age(age):
    """设置年龄"""
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if age < 0 or age > 150:
        raise ValueError("年龄必须在 0-150 之间")
    return age

try:
    set_age("二十")
except TypeError as e:
    print(f"类型错误：{e}")

try:
    set_age(200)
except ValueError as e:
    print(f"值错误：{e}")
```

### 重新抛出异常

```python
def process_data(data):
    try:
        result = complex_calculation(data)
    except ValueError as e:
        # 记录日志或执行其他操作
        print(f"处理数据时出错：{e}")
        # 重新抛出异常
        raise

try:
    process_data("invalid")
except ValueError:
    print("捕获到重新抛出的异常")
```

### 异常链（raise from）

使用 `raise ... from` 可以保留原始异常信息：

```python
def load_config(filename):
    try:
        with open(filename) as f:
            return json.load(f)
    except FileNotFoundError as e:
        # 使用 from 保留原始异常
        raise ConfigError(f"配置文件 {filename} 不存在") from e
    except json.JSONDecodeError as e:
        raise ConfigError(f"配置文件格式错误") from e

class ConfigError(Exception):
    """配置错误"""
    pass

try:
    config = load_config("config.json")
except ConfigError as e:
    print(f"配置错误：{e}")
    print(f"原始异常：{e.__cause__}")
```

### 隐式异常链

```python
def func_a():
    raise ValueError("原始错误")

def func_b():
    try:
        func_a()
    except ValueError:
        raise TypeError("新错误")

try:
    func_b()
except TypeError as e:
    print(f"当前异常：{e}")
    print(f"上下文异常：{e.__context__}")  # 自动记录的原始异常
```

## 异常传递和冒泡

异常会沿着调用栈向上传播，直到被捕获：

```python
def level_3():
    raise ValueError("最深层错误")

def level_2():
    level_3()  # 不捕获，继续向上传播

def level_1():
    try:
        level_2()
    except ValueError as e:
        print(f"在 level_1 捕获：{e}")

level_1()
```

### 异常传播过程

```python
def divide(a, b):
    return a / b  # 可能抛出 ZeroDivisionError

def calculate(x, y):
    return divide(x, y)  # 异常传播到这里

def main():
    try:
        result = calculate(10, 0)
    except ZeroDivisionError as e:
        print(f"在 main 中捕获异常：{e}")
        # 可以查看异常的追溯信息
        import traceback
        traceback.print_exc()

main()
```

### 获取异常追溯信息

```python
import traceback

def func_c():
    raise ValueError("测试异常")

def func_b():
    func_c()

def func_a():
    func_b()

try:
    func_a()
except ValueError as e:
    # 方法1：打印完整追溯
    traceback.print_exc()
    
    # 方法2：获取追溯字符串
    tb_str = traceback.format_exc()
    print("\n追溯字符串：")
    print(tb_str)
    
    # 方法3：获取追溯对象
    import sys
    exc_type, exc_value, exc_tb = sys.exc_info()
    print(f"\n异常类型：{exc_type}")
    print(f"异常值：{exc_value}")
```

## 自定义异常

### 基本自定义异常

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

### 带有额外属性的自定义异常

```python
class InsufficientFundsError(Exception):
    """余额不足异常"""
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        self.deficit = amount - balance
        super().__init__(
            f"余额不足：当前余额 {balance}，需要 {amount}，"
            f"差额 {self.deficit}"
        )

class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
    
    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
        return self.balance

account = BankAccount(100)
try:
    account.withdraw(150)
except InsufficientFundsError as e:
    print(f"错误：{e}")
    print(f"当前余额：{e.balance}")
    print(f"取款金额：{e.amount}")
    print(f"差额：{e.deficit}")
```

### 自定义异常层次结构

```python
class AppError(Exception):
    """应用程序基础异常"""
    pass

class DatabaseError(AppError):
    """数据库相关异常"""
    pass

class ConnectionError(DatabaseError):
    """数据库连接异常"""
    pass

class QueryError(DatabaseError):
    """数据库查询异常"""
    pass

class ValidationError(AppError):
    """验证相关异常"""
    pass

class InvalidEmailError(ValidationError):
    """无效邮箱异常"""
    pass

class InvalidPhoneError(ValidationError):
    """无效电话异常"""
    pass

# 使用示例
def validate_email(email):
    if '@' not in email:
        raise InvalidEmailError(f"无效的邮箱地址：{email}")

try:
    validate_email("invalid-email")
except InvalidEmailError as e:
    print(f"邮箱验证失败：{e}")
except ValidationError as e:
    print(f"验证失败：{e}")
except AppError as e:
    print(f"应用错误：{e}")
```

### 自定义异常的最佳实践

```python
class APIError(Exception):
    """API 错误基类"""
    def __init__(self, message, status_code=None, error_code=None):
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
    
    def __str__(self):
        base_msg = super().__str__()
        if self.status_code:
            base_msg = f"[{self.status_code}] {base_msg}"
        if self.error_code:
            base_msg = f"{base_msg} (错误码: {self.error_code})"
        return base_msg

class NotFoundError(APIError):
    """资源未找到"""
    def __init__(self, resource, resource_id):
        super().__init__(
            f"{resource} 未找到",
            status_code=404,
            error_code="NOT_FOUND"
        )
        self.resource = resource
        self.resource_id = resource_id

class AuthenticationError(APIError):
    """认证失败"""
    def __init__(self, message="认证失败"):
        super().__init__(
            message,
            status_code=401,
            error_code="AUTH_FAILED"
        )

# 使用示例
def get_user(user_id):
    users = {1: "张三", 2: "李四"}
    if user_id not in users:
        raise NotFoundError("用户", user_id)
    return users[user_id]

try:
    user = get_user(999)
except NotFoundError as e:
    print(f"错误：{e}")
    print(f"资源：{e.resource}")
    print(f"状态码：{e.status_code}")
```

## assert 断言

`assert` 语句用于在代码中设置检查点，当条件为假时抛出 `AssertionError`：

### 基本用法

```python
def calculate_average(numbers):
    assert len(numbers) > 0, "列表不能为空"
    return sum(numbers) / len(numbers)

# 正常情况
print(calculate_average([1, 2, 3, 4, 5]))  # 输出：3.0

# 断言失败
try:
    calculate_average([])
except AssertionError as e:
    print(f"断言错误：{e}")
```

### 断言与异常处理的区别

```python
# ❌ 错误用法：用断言做参数验证
def divide(a, b):
    assert b != 0, "除数不能为零"  # 不推荐！
    return a / b

# ✅ 正确用法：用异常做参数验证
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")  # 推荐
    return a / b
```

### 断言的典型应用场景

```python
def process_payment(amount, account):
    """处理支付"""
    # 前置条件断言
    assert amount > 0, "金额必须大于零"
    assert account is not None, "账户不能为空"
    assert account.balance >= amount, "余额不足"
    
    # 处理支付逻辑
    account.balance -= amount
    account.transactions.append(amount)
    
    # 后置条件断言
    assert account.balance >= 0, "余额不能为负数"
    
    return account.balance

class Account:
    def __init__(self, balance):
        self.balance = balance
        self.transactions = []

account = Account(1000)
result = process_payment(500, account)
print(f"剩余余额：{result}")
```

### 禁用断言

```python
# 使用 -O 参数运行 Python 可以禁用所有断言
# python -O script.py

# 注意：断言可能被禁用，不要用于关键验证
def critical_function(data):
    # ❌ 不要这样做
    assert data is not None, "数据不能为空"
    
    # ✅ 应该这样做
    if data is None:
        raise ValueError("数据不能为空")
```

### 断言最佳实践

```python
def complex_calculation(data):
    """复杂计算函数"""
    # 1. 检查不变量（程序运行中应始终为真的条件）
    assert isinstance(data, list), "数据必须是列表"
    
    result = []
    for item in data:
        # 2. 检查循环不变量
        assert isinstance(item, (int, float)), f"项目必须是数字：{item}"
        
        value = item * 2
        result.append(value)
        
        # 3. 检查后置条件
        assert value >= 0, f"计算结果不能为负数：{value}"
    
    # 4. 检查函数返回值
    assert len(result) == len(data), "结果长度应与输入相同"
    
    return result
```

## 日志记录与异常

### 基本日志记录

```python
import logging

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def divide(a, b):
    try:
        result = a / b
        logging.info(f"计算成功：{a} / {b} = {result}")
        return result
    except ZeroDivisionError:
        logging.error(f"除零错误：尝试计算 {a} / {b}")
        return None

divide(10, 2)
divide(10, 0)
```

### 记录异常追溯信息

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def process_file(filename):
    try:
        with open(filename, 'r') as f:
            data = f.read()
            # 模拟处理错误
            result = int(data)
    except FileNotFoundError:
        logging.error(f"文件不存在：{filename}")
    except ValueError as e:
        # 使用 exc_info=True 记录完整追溯
        logging.error(f"数据转换错误：{e}", exc_info=True)
    except Exception as e:
        # 使用 exception() 自动记录追溯
        logging.exception(f"处理文件时发生未知错误：{e}")

process_file("nonexistent.txt")
```

### 结构化日志记录

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data, ensure_ascii=False)

# 配置日志
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)

def risky_operation(x, y):
    try:
        result = x / y
        logger.info(f"计算成功：{x} / {y} = {result}")
        return result
    except ZeroDivisionError as e:
        logger.error(f"除零错误", exc_info=True)
        raise

try:
    risky_operation(10, 0)
except:
    pass
```

### 日志级别与异常处理

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def process_data(data):
    """处理数据，根据情况使用不同日志级别"""
    try:
        if not data:
            # DEBUG：调试信息
            logger.debug("收到空数据，使用默认值")
            data = []
        
        if len(data) > 1000:
            # INFO：一般信息
            logger.info(f"处理大数据集：{len(data)} 条记录")
        
        for i, item in enumerate(data):
            try:
                # 处理单个项目
                result = int(item)
            except ValueError as e:
                # WARNING：警告但不影响主流程
                logger.warning(f"第 {i} 项转换失败：{item}，跳过")
                continue
        
        # 模拟严重错误
        if len(data) == 0:
            # ERROR：错误但程序可继续
            logger.error("数据集为空，无法处理")
            return None
        
        return data
    
    except Exception as e:
        # CRITICAL：严重错误，程序可能无法继续
        logger.critical(f"处理数据时发生严重错误：{e}", exc_info=True)
        raise
```

## 异常处理的最佳实践

### 1. 具体明确，避免捕获所有异常

```python
# ❌ 不推荐：捕获所有异常
try:
    do_something()
except:
    pass

# ❌ 不推荐：捕获 Exception 但不处理
try:
    do_something()
except Exception:
    pass

# ✅ 推荐：捕获具体异常
try:
    with open("file.txt", "r") as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")
except PermissionError:
    print("没有读取权限")
```

### 2. 不要过度使用异常处理

```python
# ❌ 不推荐：用异常处理替代条件判断
try:
    value = my_dict[key]
except KeyError:
    value = None

# ✅ 推荐：使用条件判断
value = my_dict.get(key)

# ❌ 不推荐：用异常处理检查类型
try:
    result = int(value)
except ValueError:
    result = 0

# ✅ 推荐：先检查再转换
if isinstance(value, int):
    result = value
elif isinstance(value, str) and value.isdigit():
    result = int(value)
else:
    result = 0
```

### 3. 及时清理资源

```python
# ❌ 不推荐：可能泄露资源
try:
    f = open("file.txt", "r")
    content = f.read()
except FileNotFoundError:
    print("文件不存在")
# 文件句柄可能没有被关闭

# ✅ 推荐：使用 with 语句
try:
    with open("file.txt", "r") as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")

# ✅ 推荐：使用 finally 清理
resource = None
try:
    resource = acquire_resource()
    process(resource)
except Exception as e:
    print(f"处理失败：{e}")
finally:
    if resource:
        release_resource(resource)
```

### 4. 提供有意义的错误信息

```python
# ❌ 不推荐：错误信息不明确
def set_age(age):
    if age < 0:
        raise ValueError("错误")
    self.age = age

# ✅ 推荐：提供详细错误信息
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"年龄必须是整数，当前类型：{type(age).__name__}")
    if age < 0:
        raise ValueError(f"年龄不能为负数，当前值：{age}")
    if age > 150:
        raise ValueError(f"年龄超出合理范围，当前值：{age}")
    self.age = age
```

### 5. 保持异常的原始信息

```python
# ❌ 不推荐：丢失原始异常信息
def load_config():
    try:
        with open("config.json") as f:
            return json.load(f)
    except Exception:
        raise ConfigError("加载配置失败")

# ✅ 推荐：使用异常链保留原始信息
def load_config():
    try:
        with open("config.json") as f:
            return json.load(f)
    except FileNotFoundError as e:
        raise ConfigError("配置文件不存在") from e
    except json.JSONDecodeError as e:
        raise ConfigError("配置文件格式错误") from e
```

### 6. 合理使用 else 和 finally

```python
def process_file(filename):
    """处理文件，展示 else 和 finally 的正确用法"""
    file = None
    try:
        file = open(filename, 'r')
        data = file.read()
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
        return None
    else:
        # 没有异常时处理数据
        print(f"成功读取 {len(data)} 个字符")
        return process_data(data)
    finally:
        # 无论成功与否都关闭文件
        if file:
            file.close()
            print("文件已关闭")
```

### 7. 避免嵌套过深的异常处理

```python
# ❌ 不推荐：嵌套过深
def process_data(data):
    try:
        try:
            try:
                result = parse(data)
            except ParseError:
                return None
        except Exception:
            return None
    except:
        return None

# ✅ 推荐：扁平化处理
def process_data(data):
    try:
        result = parse(data)
    except ParseError as e:
        logger.warning(f"解析失败：{e}")
        return None
    except Exception as e:
        logger.error(f"处理失败：{e}")
        return None
    return result
```

## 性能考虑

### 异常处理的开销

```python
import time

# 异常处理有一定的性能开销
# 不应该用异常处理来控制正常的程序流程

# ❌ 不推荐：用异常处理替代条件检查（性能差）
def get_item_slow(lst, index):
    try:
        return lst[index]
    except IndexError:
        return None

# ✅ 推荐：使用条件检查（性能好）
def get_item_fast(lst, index):
    if 0 <= index < len(lst):
        return lst[index]
    return None

# 性能测试
lst = list(range(10000))

# 使用异常处理
start = time.time()
for _ in range(100000):
    get_item_slow(lst, 5000)
print(f"异常处理方式：{time.time() - start:.4f} 秒")

# 使用条件检查
start = time.time()
for _ in range(100000):
    get_item_fast(lst, 5000)
print(f"条件检查方式：{time.time() - start:.4f} 秒")
```

### EAFP vs LBYL

```python
# EAFP: Easier to Ask for Forgiveness than Permission
# 先尝试操作，失败时处理异常（Python 风格）

# LBYL: Look Before You Leap
# 先检查条件，再执行操作（C 风格）

# EAFP 风格（Pythonic）
def get_value_eafp(d, key):
    try:
        return d[key]
    except KeyError:
        return None

# LBYL 风格
def get_value_lbyl(d, key):
    if key in d:
        return d[key]
    return None

# EAFP 在并发环境下更安全
# 因为检查和操作之间可能有其他线程修改状态
```

### 异常处理的性能建议

```python
# 1. 对于频繁发生的正常情况，避免使用异常
# ❌ 性能差
def is_numeric_slow(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

# ✅ 性能好
def is_numeric_fast(s):
    return s.isdigit() or (s[0] == '-' and s[1:].isdigit())

# 2. 对于罕见错误情况，使用异常是合适的
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

# 3. 批量操作时，先验证再处理
def process_items(items):
    # 先验证所有项目
    for item in items:
        validate(item)
    
    # 再批量处理
    results = []
    for item in items:
        results.append(process(item))
    
    return results
```

## 常见错误示例

### 错误1：捕获所有异常并忽略

```python
# ❌ 严重错误：隐藏所有问题
try:
    important_operation()
except:
    pass  # 这会隐藏所有错误，包括 KeyboardInterrupt

# ✅ 正确做法：捕获具体异常并记录
try:
    important_operation()
except ValueError as e:
    logger.error(f"值错误：{e}")
except TypeError as e:
    logger.error(f"类型错误：{e}")
```

### 错误2：异常处理范围过大

```python
# ❌ 错误：异常处理范围过大
try:
    x = get_value()
    y = int(x)
    z = calculate(y)
    save(z)
except Exception:
    print("出错了")  # 不知道哪一步出错

# ✅ 正确：分别处理不同步骤
try:
    x = get_value()
except ValueError as e:
    print(f"获取值失败：{e}")
    return

try:
    y = int(x)
except ValueError as e:
    print(f"转换失败：{e}")
    return

try:
    z = calculate(y)
    save(z)
except CalculationError as e:
    print(f"计算失败：{e}")
except IOError as e:
    print(f"保存失败：{e}")
```

### 错误3：在 finally 中返回值

```python
# ❌ 错误：finally 中的 return 会覆盖 try 中的 return
def bad_function():
    try:
        return "正常返回"
    finally:
        return "finally 返回"  # 这会覆盖上面的返回值

print(bad_function())  # 输出：finally 返回

# ✅ 正确：不要在 finally 中返回
def good_function():
    try:
        return "正常返回"
    finally:
        cleanup()  # 只做清理工作
```

### 错误4：使用裸露的 except

```python
# ❌ 错误：捕获所有异常，包括系统异常
try:
    user_input = input("请输入：")
except:  # 会捕获 KeyboardInterrupt、SystemExit 等
    print("输入错误")

# ✅ 正确：捕获具体异常
try:
    user_input = input("请输入：")
except EOFError:
    print("输入结束")
except KeyboardInterrupt:
    print("\n用户中断")
```

### 错误5：异常信息不完整

```python
# ❌ 错误：异常信息不完整
class UserError(Exception):
    pass

def validate_user(user):
    if not user:
        raise UserError("用户无效")

# ✅ 正确：提供完整的异常信息
class UserError(Exception):
    """用户相关错误"""
    def __init__(self, message, user_id=None, username=None):
        super().__init__(message)
        self.user_id = user_id
        self.username = username

def validate_user(user):
    if not user:
        raise UserError(
            "用户无效",
            user_id=user.get('id'),
            username=user.get('username')
        )
```

### 错误6：在 __del__ 方法中使用异常

```python
# ❌ 错误：__del__ 中的异常会被忽略
class BadClass:
    def __del__(self):
        raise ValueError("清理时出错")  # 这个异常会被忽略

# ✅ 正确：使用上下文管理器
class GoodClass:
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.cleanup()
        except Exception as e:
            print(f"清理失败：{e}")
        return False  # 不抑制异常
    
    def cleanup(self):
        print("清理资源")
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch09_exception) 完成以下任务：

1. **除法计算器** - 处理除法运算的零除错误
2. **类型转换** - 安全地将用户输入转换为整数
3. **自定义异常** - 创建一个用于验证密码的异常
4. **文件处理器** - 实现一个安全的文件读取器
5. **异常链练习** - 实现带有异常链的配置加载器

---

## 📚 扩展阅读

- Python 官方文档：[Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html)
- Python 官方文档：[Built-in Exceptions](https://docs.python.org/3/library/exceptions.html)
- PEP 3134：[Exception Chaining and Embedded Tracebacks](https://www.python.org/dev/peps/pep-3134/)

---

**[下一章预告]** → 面向对象编程：类和对象