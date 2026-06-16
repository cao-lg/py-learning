# 函数

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>函数是组织代码的基本单元，可以提高代码的复用性和可读性。本章将深入学习 Python 函数的各种特性，包括参数传递、返回值、作用域、高阶函数等核心概念。</p>
</div>

## 函数定义完整语法

### 基本语法结构

```python
def function_name(parameters):
    """函数文档字符串（可选）"""
    # 函数体
    # 执行代码
    return value  # 可选的返回值
```

### 完整语法说明

```python
# 函数定义的完整形式
def function_name(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
    """
    函数文档字符串
    
    参数说明：
    - pos1, pos2: 仅位置参数（/ 之前）
    - pos_or_kwd: 位置或关键字参数
    - kwd1, kwd2: 仅关键字参数（* 之后）
    
    返回值：
    - 返回值的说明
    """
    pass

# 示例
def create_profile(name, age, /, city="Unknown", *, email=None, phone=None):
    """创建用户档案"""
    profile = {
        "name": name,
        "age": age,
        "city": city,
        "email": email,
        "phone": phone
    }
    return profile

# 正确调用方式
profile1 = create_profile("Alice", 25)  # 位置参数
profile2 = create_profile("Bob", 30, "Shanghai", email="bob@example.com")  # 混合
profile3 = create_profile("Charlie", 28, city="Beijing", phone="123456")  # 关键字

# 错误调用方式（会报错）
# create_profile("Alice", age=25)  # 错误：age 是仅位置参数
# create_profile("Bob", 30, "Shanghai", "bob@example.com")  # 错误：email 必须用关键字
```

## 定义和调用函数

### 基本函数定义

```python
# 定义无参函数
def greet():
    print("Hello!")

# 调用函数
greet()  # 输出: Hello!

# 带参数的函数
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # 输出: Hello, Alice!
```

### 函数的执行流程

```python
def process_data(data):
    """处理数据的函数"""
    print("1. 开始处理数据")
    result = data.upper()
    print("2. 数据处理完成")
    return result

print("程序开始")
output = process_data("hello")
print(f"3. 结果: {output}")
print("程序结束")

# 输出顺序：
# 程序开始
# 1. 开始处理数据
# 2. 数据处理完成
# 3. 结果: HELLO
# 程序结束
```

## 参数类型详解

### 1. 位置参数

```python
def power(base, exponent):
    """计算 base 的 exponent 次方"""
    return base ** exponent

# 按位置传递参数
result = power(2, 3)  # 2^3 = 8
print(result)  # 8

# 参数顺序很重要
result = power(3, 2)  # 3^2 = 9
print(result)  # 9
```

### 2. 关键字参数

```python
def describe_pet(name, animal_type, age):
    """描述宠物信息"""
    return f"{name}是一只{age}岁的{animal_type}"

# 使用关键字参数（顺序可以改变）
pet1 = describe_pet(name="旺财", animal_type="狗", age=3)
pet2 = describe_pet(animal_type="猫", name="咪咪", age=2)
pet3 = describe_pet("小白", "兔子", age=1)  # 混合使用

print(pet1)  # 旺财是一只3岁的狗
print(pet2)  # 咪咪是一只2岁的猫
print(pet3)  # 小白是一只1岁的兔子
```

### 3. 默认参数

```python
def greet(name, greeting="你好", punctuation="！"):
    """带默认参数的问候函数"""
    return f"{greeting}，{name}{punctuation}"

# 使用默认值
message1 = greet("小明")  # 你好，小明！
message2 = greet("Alice", "Hello")  # Hello，Alice！
message3 = greet("Bob", "Hi", "!!!")  # Hi，Bob!!!

print(message1)
print(message2)
print(message3)

# 默认参数的注意事项
def add_item(item, items=[]):  # ⚠️ 危险：可变默认参数
    items.append(item)
    return items

# 问题演示
list1 = add_item("a")  # ["a"]
list2 = add_item("b")  # ["a", "b"] - 不是预期的 ["b"]！
print(list1)  # ["a", "b"]
print(list2)  # ["a", "b"]

# 正确写法
def add_item_correct(item, items=None):
    """正确处理可变默认参数"""
    if items is None:
        items = []
    items.append(item)
    return items

list3 = add_item_correct("a")  # ["a"]
list4 = add_item_correct("b")  # ["b"]
print(list3)  # ["a"]
print(list4)  # ["b"]
```

### 4. 仅位置参数和仅关键字参数

```python
# 仅位置参数（Python 3.8+）
def greet_positional(name, /, greeting="Hello"):
    """name 只能通过位置传递"""
    return f"{greeting}, {name}!"

print(greet_positional("Alice"))  # 正确
print(greet_positional("Alice", "Hi"))  # 正确
# print(greet_positional(name="Alice"))  # 错误！

# 仅关键字参数
def greet_keyword(*, name, greeting="Hello"):
    """name 只能通过关键字传递"""
    return f"{greeting}, {name}!"

print(greet_keyword(name="Alice"))  # 正确
# print(greet_keyword("Alice"))  # 错误！

# 混合使用
def complex_function(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
    """
    pos1, pos2: 仅位置参数
    pos_or_kwd: 位置或关键字参数
    kwd1, kwd2: 仅关键字参数
    """
    return f"位置参数: {pos1}, {pos2}; 混合参数: {pos_or_kwd}; 关键字参数: {kwd1}, {kwd2}"

result = complex_function(1, 2, 3, kwd1=4, kwd2=5)
print(result)  # 位置参数: 1, 2; 混合参数: 3; 关键字参数: 4, 5
```

## *args 和 **kwargs 详解

### *args - 可变位置参数

```python
def sum_all(*args):
    """接收任意数量的位置参数并求和"""
    print(f"args 类型: {type(args)}")  # <class 'tuple'>
    print(f"args 内容: {args}")  # (1, 2, 3, 4, 5)
    return sum(args)

result = sum_all(1, 2, 3, 4, 5)
print(f"总和: {result}")  # 15

# 实际应用：计算平均值
def average(*numbers):
    """计算任意数量数字的平均值"""
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

print(average(1, 2, 3, 4, 5))  # 3.0
print(average(10, 20))  # 15.0
print(average())  # 0

# 结合普通参数使用
def introduce(name, *hobbies):
    """介绍一个人及其爱好"""
    hobby_str = "、".join(hobbies) if hobbies else "没有特别的爱好"
    return f"我是{name}，我的爱好有：{hobby_str}"

print(introduce("小明", "阅读", "游泳", "编程"))
# 我是小明，我的爱好有：阅读、游泳、编程

# 解包列表/元组传递给 *args
numbers = [1, 2, 3, 4, 5]
print(sum_all(*numbers))  # 解包列表，等价于 sum_all(1, 2, 3, 4, 5)
```

### **kwargs - 可变关键字参数

```python
def print_info(**kwargs):
    """接收任意数量的关键字参数"""
    print(f"kwargs 类型: {type(kwargs)}")  # <class 'dict'>
    print(f"kwargs 内容: {kwargs}")
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

print_info(name="Alice", age=25, city="Beijing")
# kwargs 类型: <class 'dict'>
# kwargs 内容: {'name': 'Alice', 'age': 25, 'city': 'Beijing'}
#   name: Alice
#   age: 25
#   city: Beijing

# 实际应用：创建配置
def create_config(**options):
    """创建配置对象"""
    defaults = {
        "debug": False,
        "timeout": 30,
        "retries": 3
    }
    defaults.update(options)  # 用传入的选项覆盖默认值
    return defaults

config1 = create_config()
config2 = create_config(debug=True, timeout=60)
print(config1)  # {'debug': False, 'timeout': 30, 'retries': 3}
print(config2)  # {'debug': True, 'timeout': 60, 'retries': 3}

# 解包字典传递给 **kwargs
options = {"debug": True, "timeout": 120}
config3 = create_config(**options)
print(config3)  # {'debug': True, 'timeout': 120, 'retries': 3}
```

### *args 和 **kwargs 组合使用

```python
def flexible_function(*args, **kwargs):
    """可以接收任意参数的函数"""
    print(f"位置参数: {args}")
    print(f"关键字参数: {kwargs}")

flexible_function(1, 2, 3, name="Alice", age=25)
# 位置参数: (1, 2, 3)
# 关键字参数: {'name': 'Alice', 'age': 25}

# 实际应用：包装器函数
def log_function_call(func):
    """装饰器：记录函数调用"""
    def wrapper(*args, **kwargs):
        print(f"调用函数: {func.__name__}")
        print(f"  位置参数: {args}")
        print(f"  关键字参数: {kwargs}")
        result = func(*args, **kwargs)
        print(f"  返回值: {result}")
        return result
    return wrapper

@log_function_call
def add(a, b):
    return a + b

add(3, 5)
# 调用函数: add
#   位置参数: (3, 5)
#   关键字参数: {}
#   返回值: 8
```

## 返回值和多返回值

### 单返回值

```python
def add(a, b):
    """返回两数之和"""
    return a + b

result = add(3, 5)
print(result)  # 8

# 无返回值的函数
def greet(name):
    """打印问候语（无返回值）"""
    print(f"Hello, {name}!")
    # 隐式返回 None

result = greet("Alice")  # 打印: Hello, Alice!
print(result)  # None

# 提前返回
def divide(a, b):
    """安全的除法运算"""
    if b == 0:
        return "错误：除数不能为零"
    return a / b

print(divide(10, 2))  # 5.0
print(divide(10, 0))  # 错误：除数不能为零
```

### 多返回值（元组解包）

```python
# 返回多个值（实际上是返回元组）
def get_min_max(numbers):
    """返回列表中的最小值和最大值"""
    return min(numbers), max(numbers)

result = get_min_max([1, 5, 3, 9, 2])
print(result)  # (1, 9)
print(type(result))  # <class 'tuple'>

# 元组解包
minimum, maximum = get_min_max([1, 5, 3, 9, 2])
print(f"最小值: {minimum}, 最大值: {maximum}")  # 最小值: 1, 最大值: 9

# 返回多个相关值
def get_circle_info(radius):
    """返回圆的周长和面积"""
    import math
    circumference = 2 * math.pi * radius
    area = math.pi * radius ** 2
    return circumference, area

c, a = get_circle_info(5)
print(f"周长: {c:.2f}, 面积: {a:.2f}")

# 返回多个不同类型的值
def analyze_text(text):
    """分析文本，返回多种统计信息"""
    words = text.split()
    return (
        len(text),           # 字符数
        len(words),          # 单词数
        len(set(words)),     # 唯一单词数
        max(words, key=len) if words else ""  # 最长单词
    )

chars, words, unique, longest = analyze_text("hello world hello python")
print(f"字符数: {chars}, 单词数: {words}, 唯一单词数: {unique}, 最长单词: {longest}")
# 字符数: 24, 单词数: 4, 唯一单词数: 3, 最长单词: python

# 使用 _ 忽略不需要的返回值
def get_user_info():
    return "Alice", 25, "Beijing", "alice@example.com"

name, age, _, email = get_user_info()  # 忽略城市信息
print(f"姓名: {name}, 年龄: {age}, 邮箱: {email}")
```

## 函数文档字符串

### 基本文档字符串

```python
def calculate_area(length, width):
    """计算矩形面积"""
    return length * width

# 访问文档字符串
print(calculate_area.__doc__)  # 计算矩形面积
```

### 多行文档字符串（推荐格式）

```python
def calculate_bmi(weight, height):
    """
    计算身体质量指数（BMI）
    
    BMI = 体重(kg) / 身高(m)^2
    
    参数:
        weight (float): 体重，单位为千克
        height (float): 身高，单位为米
    
    返回:
        float: BMI值
    
    异常:
        ValueError: 当体重或身高为负数时抛出
    
    示例:
        >>> calculate_bmi(70, 1.75)
        22.857142857142858
    """
    if weight <= 0 or height <= 0:
        raise ValueError("体重和身高必须为正数")
    return weight / (height ** 2)

# 访问文档字符串
help(calculate_bmi)
print(calculate_bmi.__doc__)
```

### Google 风格文档字符串

```python
def search_items(items, keyword, case_sensitive=False):
    """
    在列表中搜索包含关键字的项
    
    Args:
        items (list): 要搜索的字符串列表
        keyword (str): 搜索关键字
        case_sensitive (bool, optional): 是否区分大小写，默认为 False
    
    Returns:
        list: 包含关键字的项列表
    
    Raises:
        TypeError: 当 items 不是列表时抛出
    
    Examples:
        >>> search_items(['apple', 'banana', 'grape'], 'ap')
        ['apple', 'grape']
    """
    if not isinstance(items, list):
        raise TypeError("items 必须是列表")
    
    if not case_sensitive:
        keyword = keyword.lower()
        return [item for item in items if keyword in item.lower()]
    return [item for item in items if keyword in item]
```

### NumPy 风格文档字符串

```python
def process_data(data, operation='sum', normalize=False):
    """
    处理数值数据
    
    Parameters
    ----------
    data : array-like
        输入的数值数据
    operation : {'sum', 'mean', 'max', 'min'}, optional
        要执行的操作，默认为 'sum'
    normalize : bool, optional
        是否在操作前归一化数据，默认为 False
    
    Returns
    -------
    float
        处理结果
    
    Examples
    --------
    >>> process_data([1, 2, 3, 4, 5], operation='mean')
    3.0
    """
    if normalize:
        max_val = max(data)
        data = [x / max_val for x in data]
    
    operations = {
        'sum': sum,
        'mean': lambda x: sum(x) / len(x),
        'max': max,
        'min': min
    }
    
    return operations[operation](data)
```

## 递归函数

### 递归基本概念

```python
# 递归三要素：
# 1. 基准情况（终止条件）
# 2. 递归调用
# 3. 问题规模缩小

def countdown(n):
    """递归倒计时"""
    # 基准情况
    if n <= 0:
        print("发射！")
        return
    
    # 递归步骤
    print(n)
    countdown(n - 1)  # 问题规模缩小

countdown(5)
# 5
# 4
# 3
# 2
# 1
# 发射！
```

### 经典递归示例

```python
# 1. 阶乘
def factorial(n):
    """计算 n 的阶乘"""
    # 基准情况
    if n == 0 or n == 1:
        return 1
    # 递归调用
    return n * factorial(n - 1)

print(factorial(5))  # 120 (5 * 4 * 3 * 2 * 1)
print(factorial(0))  # 1

# 2. 斐波那契数列
def fibonacci(n):
    """返回第 n 个斐波那契数"""
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

# 生成斐波那契数列
def fibonacci_sequence(n):
    """生成前 n 个斐波那契数"""
    return [fibonacci(i) for i in range(n)]

print(fibonacci_sequence(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# 3. 汉诺塔
def hanoi(n, source, target, auxiliary):
    """
    汉诺塔问题
    
    参数:
        n: 盘子数量
        source: 源柱子
        target: 目标柱子
        auxiliary: 辅助柱子
    """
    if n == 1:
        print(f"将盘子 1 从 {source} 移动到 {target}")
        return
    
    hanoi(n - 1, source, auxiliary, target)
    print(f"将盘子 {n} 从 {source} 移动到 {target}")
    hanoi(n - 1, auxiliary, target, source)

hanoi(3, 'A', 'C', 'B')

# 4. 二分查找
def binary_search(arr, target, left=0, right=None):
    """递归实现二分查找"""
    if right is None:
        right = len(arr) - 1
    
    if left > right:
        return -1  # 未找到
    
    mid = (left + right) // 2
    
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid + 1, right)
    else:
        return binary_search(arr, target, left, mid - 1)

sorted_list = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(sorted_list, 7))  # 3
print(binary_search(sorted_list, 8))  # -1

# 5. 目录遍历
import os

def list_files(directory, indent=0):
    """递归列出目录中的所有文件"""
    items = os.listdir(directory)
    
    for item in items:
        path = os.path.join(directory, item)
        print("  " * indent + "├── " + item)
        
        if os.path.isdir(path):
            list_files(path, indent + 1)
```

### 递归优化：记忆化

```python
from functools import lru_cache

# 未优化的斐波那契（效率低）
def fibonacci_slow(n):
    """未优化的递归斐波那契"""
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci_slow(n - 1) + fibonacci_slow(n - 2)

# 使用 LRU 缓存优化
@lru_cache(maxsize=None)
def fibonacci_fast(n):
    """使用记忆化的斐波那契"""
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci_fast(n - 1) + fibonacci_fast(n - 2)

# 性能对比
import time

start = time.time()
fibonacci_slow(35)
print(f"未优化耗时: {time.time() - start:.4f}秒")

start = time.time()
fibonacci_fast(35)
print(f"优化后耗时: {time.time() - start:.4f}秒")

# 手动实现记忆化
def fibonacci_memo():
    """使用闭包实现记忆化"""
    cache = {}
    
    def fib(n):
        if n in cache:
            return cache[n]
        if n <= 0:
            result = 0
        elif n == 1:
            result = 1
        else:
            result = fib(n - 1) + fib(n - 2)
        cache[n] = result
        return result
    
    return fib

fib = fibonacci_memo()
print(fib(100))  # 快速计算大数
```

### 递归深度限制

```python
import sys

# 查看默认递归深度限制
print(f"默认递归深度限制: {sys.getrecursionlimit()}")  # 通常为 1000

# 修改递归深度限制（谨慎使用）
# sys.setrecursionlimit(3000)

# 递归过深的错误示例
def infinite_recursion(n):
    """会导致栈溢出的递归"""
    return infinite_recursion(n + 1)

try:
    infinite_recursion(0)
except RecursionError as e:
    print(f"递归错误: {e}")
```

## 高阶函数（map, filter, reduce）

### map 函数

```python
# map(function, iterable) - 对可迭代对象的每个元素应用函数

# 基本用法
numbers = [1, 2, 3, 4, 5]

# 使用普通函数
def square(x):
    return x ** 2

squares = map(square, numbers)
print(list(squares))  # [1, 4, 9, 16, 25]

# 使用 lambda 表达式
squares = map(lambda x: x ** 2, numbers)
print(list(squares))  # [1, 4, 9, 16, 25]

# 多个可迭代对象
list1 = [1, 2, 3]
list2 = [10, 20, 30]

sums = map(lambda x, y: x + y, list1, list2)
print(list(sums))  # [11, 22, 33]

# 字符串处理
words = ["hello", "world", "python"]
upper_words = map(str.upper, words)
print(list(upper_words))  # ['HELLO', 'WORLD', 'PYTHON']

# 字典处理
students = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78}
]

names = map(lambda s: s["name"], students)
print(list(names))  # ['Alice', 'Bob', 'Charlie']

# map 返回的是迭代器
result = map(lambda x: x * 2, [1, 2, 3])
print(type(result))  # <class 'map'>
print(next(result))  # 2
print(next(result))  # 4
```

### filter 函数

```python
# filter(function, iterable) - 过滤满足条件的元素

# 基本用法
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 过滤偶数
def is_even(x):
    return x % 2 == 0

evens = filter(is_even, numbers)
print(list(evens))  # [2, 4, 6, 8, 10]

# 使用 lambda
evens = filter(lambda x: x % 2 == 0, numbers)
print(list(evens))  # [2, 4, 6, 8, 10]

# 过滤大于 5 的数
greater_than_five = filter(lambda x: x > 5, numbers)
print(list(greater_than_five))  # [6, 7, 8, 9, 10]

# 过滤字符串
words = ["apple", "", "banana", "", "cherry"]
non_empty = filter(None, words)  # None 表示过滤掉假值
print(list(non_empty))  # ['apple', 'banana', 'cherry']

# 过滤字典列表
students = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 58},
    {"name": "David", "score": 75}
]

# 过滤及格的学生
passed = filter(lambda s: s["score"] >= 60, students)
print(list(passed))

# 组合使用 map 和 filter
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 先过滤偶数，再平方
result = map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers))
print(list(result))  # [4, 16, 36, 64, 100]
```

### reduce 函数

```python
from functools import reduce

# reduce(function, iterable[, initializer]) - 累积计算

# 基本用法：求和
numbers = [1, 2, 3, 4, 5]

def add(x, y):
    return x + y

total = reduce(add, numbers)
print(total)  # 15

# 使用 lambda
total = reduce(lambda x, y: x + y, numbers)
print(total)  # 15

# 计算过程演示
# 1. x=1, y=2 -> 3
# 2. x=3, y=3 -> 6
# 3. x=6, y=4 -> 10
# 4. x=10, y=5 -> 15

# 求乘积
product = reduce(lambda x, y: x * y, numbers)
print(product)  # 120

# 使用初始值
total = reduce(lambda x, y: x + y, numbers, 100)
print(total)  # 115 (100 + 15)

# 找最大值
max_value = reduce(lambda x, y: x if x > y else y, numbers)
print(max_value)  # 5

# 字符串连接
words = ["Hello", "World", "Python"]
sentence = reduce(lambda x, y: x + " " + y, words)
print(sentence)  # Hello World Python

# 列表扁平化
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda x, y: x + y, nested)
print(flat)  # [1, 2, 3, 4, 5, 6]

# 构建字典
pairs = [("a", 1), ("b", 2), ("c", 3)]
dictionary = reduce(lambda d, p: {**d, p[0]: p[1]}, pairs, {})
print(dictionary)  # {'a': 1, 'b': 2, 'c': 3}
```

### 高阶函数组合应用

```python
from functools import reduce

# 数据处理管道
data = [
    {"name": "Alice", "age": 25, "salary": 50000},
    {"name": "Bob", "age": 30, "salary": 60000},
    {"name": "Charlie", "age": 35, "salary": 70000},
    {"name": "David", "age": 28, "salary": 55000},
    {"name": "Eve", "age": 32, "salary": 65000}
]

# 1. 筛选年龄大于 28 的员工
# 2. 提取薪资
# 3. 计算平均薪资

filtered = filter(lambda x: x["age"] > 28, data)
salaries = map(lambda x: x["salary"], filtered)
salary_list = list(salaries)

average = reduce(lambda x, y: x + y, salary_list) / len(salary_list)
print(f"平均薪资: {average}")  # 65000.0

# 使用列表推导式的替代方案（更 Pythonic）
average = sum(x["salary"] for x in data if x["age"] > 28) / sum(1 for x in data if x["age"] > 28)
print(f"平均薪资: {average}")
```

## 闭包和装饰器基础

### 闭包

```python
# 闭包：内部函数引用外部函数的变量

def outer_function(x):
    """外部函数"""
    def inner_function(y):
        """内部函数 - 闭包"""
        return x + y  # 引用外部变量 x
    return inner_function

# 创建闭包
add_five = outer_function(5)
add_ten = outer_function(10)

print(add_five(3))   # 8 (5 + 3)
print(add_ten(3))    # 13 (10 + 3)

# 闭包的实际应用

# 1. 计数器工厂
def create_counter():
    """创建计数器"""
    count = 0
    
    def counter():
        nonlocal count  # 声明使用外部变量
        count += 1
        return count
    
    return counter

counter1 = create_counter()
counter2 = create_counter()

print(counter1())  # 1
print(counter1())  # 2
print(counter1())  # 3
print(counter2())  # 1（独立的计数器）

# 2. 乘法器工厂
def create_multiplier(factor):
    """创建乘法器"""
    def multiplier(number):
        return number * factor
    return multiplier

double = create_multiplier(2)
triple = create_multiplier(3)

print(double(5))   # 10
print(triple(5))   # 15

# 3. 配置函数工厂
def create_formatter(prefix="", suffix=""):
    """创建格式化器"""
    def formatter(text):
        return f"{prefix}{text}{suffix}"
    return formatter

html_formatter = create_formatter("<b>", "</b>")
markdown_formatter = create_formatter("**", "**")

print(html_formatter("Hello"))      # <b>Hello</b>
print(markdown_formatter("Hello"))   # **Hello**

# 4. 缓存/记忆化
def create_cached_function():
    """创建带缓存的函数"""
    cache = {}
    
    def cached_fibonacci(n):
        if n in cache:
            return cache[n]
        
        if n <= 0:
            result = 0
        elif n == 1:
            result = 1
        else:
            result = cached_fibonacci(n - 1) + cached_fibonacci(n - 2)
        
        cache[n] = result
        return result
    
    return cached_fibonacci

fib = create_cached_function()
print(fib(50))  # 快速计算
```

### 装饰器基础

```python
# 装饰器：修改或增强函数行为的函数

# 基本装饰器
def my_decorator(func):
    """简单的装饰器"""
    def wrapper():
        print("函数执行前")
        func()
        print("函数执行后")
    return wrapper

# 使用装饰器
@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# 输出:
# 函数执行前
# Hello!
# 函数执行后

# 等价于：
# say_hello = my_decorator(say_hello)

# 带参数的装饰器
def my_decorator_with_args(func):
    """处理被装饰函数的参数"""
    def wrapper(*args, **kwargs):
        print(f"调用函数 {func.__name__}")
        print(f"参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"返回值: {result}")
        return result
    return wrapper

@my_decorator_with_args
def add(a, b):
    return a + b

add(3, 5)
# 调用函数 add
# 参数: args=(3, 5), kwargs={}
# 返回值: 8

# 实用装饰器示例

# 1. 计时装饰器
import time

def timer(func):
    """计算函数执行时间"""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.4f}秒")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "完成"

slow_function()  # slow_function 执行时间: 1.0012秒

# 2. 日志装饰器
def logger(func):
    """记录函数调用日志"""
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用函数: {func.__name__}")
        print(f"[LOG] 参数: {args}, {kwargs}")
        result = func(*args, **kwargs)
        print(f"[LOG] 返回值: {result}")
        return result
    return wrapper

@logger
def divide(a, b):
    return a / b

divide(10, 2)

# 3. 重试装饰器
def retry(max_attempts=3):
    """失败重试装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"第 {attempt + 1} 次尝试失败: {e}")
            return None
        return wrapper
    return decorator

@retry(max_attempts=3)
def unstable_function():
    import random
    if random.random() < 0.7:
        raise ValueError("随机失败")
    return "成功"

# 4. 缓存装饰器
def memoize(func):
    """缓存函数结果"""
    cache = {}
    
    def wrapper(*args):
        if args in cache:
            print(f"从缓存返回: {args}")
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    
    return wrapper

@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 保留原函数信息
from functools import wraps

def better_decorator(func):
    @wraps(func)  # 保留原函数的元信息
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@better_decorator
def example():
    """这是一个示例函数"""
    pass

print(example.__name__)  # example（而不是 wrapper）
print(example.__doc__)   # 这是一个示例函数
```

### 常用内置装饰器

```python
# @property - 将方法变成属性
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        """获取半径"""
        return self._radius
    
    @radius.setter
    def radius(self, value):
        """设置半径"""
        if value <= 0:
            raise ValueError("半径必须为正数")
        self._radius = value
    
    @property
    def area(self):
        """计算面积（只读属性）"""
        import math
        return math.pi * self._radius ** 2

circle = Circle(5)
print(circle.radius)  # 5（像属性一样访问）
print(circle.area)    # 78.54...

circle.radius = 10    # 使用 setter
# circle.area = 100   # 错误：只读属性

# @staticmethod 和 @classmethod
class MyClass:
    class_variable = "类变量"
    
    def __init__(self, value):
        self.instance_variable = value
    
    @staticmethod
    def static_method():
        """静态方法：不访问实例或类"""
        return "静态方法"
    
    @classmethod
    def class_method(cls):
        """类方法：访问类变量"""
        return f"类方法: {cls.class_variable}"
    
    @classmethod
    def from_string(cls, string):
        """工厂方法"""
        return cls(string)

obj = MyClass("实例值")
print(MyClass.static_method())   # 静态方法
print(MyClass.class_method())   # 类方法: 类变量
print(MyClass.from_string("测试").instance_variable)  # 测试
```

## 生成器函数（yield）

### 生成器基础

```python
# 生成器函数：使用 yield 返回值的函数

def simple_generator():
    """简单的生成器"""
    yield 1
    yield 2
    yield 3

# 创建生成器对象
gen = simple_generator()
print(type(gen))  # <class 'generator'>

# 逐个获取值
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
# print(next(gen))  # StopIteration 异常

# 使用 for 循环
for value in simple_generator():
    print(value)
# 1
# 2
# 3

# 生成器 vs 列表
def create_list(n):
    """创建列表（占用内存）"""
    result = []
    for i in range(n):
        result.append(i ** 2)
    return result

def create_generator(n):
    """创建生成器（惰性计算）"""
    for i in range(n):
        yield i ** 2

# 内存对比
import sys
my_list = create_list(1000)
my_gen = create_generator(1000)

print(f"列表大小: {sys.getsizeof(my_list)} 字节")  # 较大
print(f"生成器大小: {sys.getsizeof(my_gen)} 字节")  # 较小
```

### 生成器的高级用法

```python
# 1. 无限序列生成器
def infinite_counter():
    """无限计数器"""
    n = 0
    while True:
        yield n
        n += 1

counter = infinite_counter()
print(next(counter))  # 0
print(next(counter))  # 1
print(next(counter))  # 2
# 可以无限继续...

# 2. 斐波那契数列生成器
def fibonacci_generator():
    """斐波那契数列生成器"""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci_generator()
for _ in range(10):
    print(next(fib), end=" ")  # 0 1 1 2 3 5 8 13 21 34

# 3. 文件读取生成器
def read_large_file(file_path):
    """逐行读取大文件"""
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()

# 使用示例（不实际创建文件）
# for line in read_large_file('large_file.txt'):
#     process(line)

# 4. 数据处理管道
def read_numbers():
    """生成数字"""
    for i in range(1, 11):
        yield i

def filter_even(numbers):
    """过滤偶数"""
    for n in numbers:
        if n % 2 == 0:
            yield n

def square(numbers):
    """平方"""
    for n in numbers:
        yield n ** 2

# 管道处理
pipeline = square(filter_even(read_numbers()))
print(list(pipeline))  # [4, 16, 36, 64, 100]
```

### yield from 语法

```python
# yield from：委托给另一个生成器

def sub_generator():
    """子生成器"""
    yield 1
    yield 2
    yield 3

def main_generator():
    """主生成器"""
    yield "开始"
    yield from sub_generator()  # 委托给子生成器
    yield "结束"

for value in main_generator():
    print(value)
# 开始
# 1
# 2
# 3
# 结束

# 实际应用：扁平化嵌套结构
def flatten(nested):
    """递归扁平化嵌套列表"""
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

nested_list = [1, [2, 3], [4, [5, 6]], 7]
print(list(flatten(nested_list)))  # [1, 2, 3, 4, 5, 6, 7]

# 遍历树结构
class TreeNode:
    def __init__(self, value, children=None):
        self.value = value
        self.children = children or []

def traverse_tree(node):
    """遍历树结构"""
    yield node.value
    for child in node.children:
        yield from traverse_tree(child)

# 构建树
root = TreeNode("root", [
    TreeNode("child1", [
        TreeNode("grandchild1"),
        TreeNode("grandchild2")
    ]),
    TreeNode("child2")
])

for value in traverse_tree(root):
    print(value)
# root
# child1
# grandchild1
# grandchild2
# child2
```

### 生成器表达式

```python
# 生成器表达式：类似列表推导式，但使用 ()

# 列表推导式（立即计算）
list_comp = [x ** 2 for x in range(10)]
print(type(list_comp))  # <class 'list'>

# 生成器表达式（惰性计算）
gen_exp = (x ** 2 for x in range(10))
print(type(gen_exp))  # <class 'generator'>

# 内存效率对比
import sys

list_comp = [x ** 2 for x in range(10000)]
gen_exp = (x ** 2 for x in range(10000))

print(f"列表大小: {sys.getsizeof(list_comp)} 字节")
print(f"生成器大小: {sys.getsizeof(gen_exp)} 字节")

# 使用生成器表达式
sum_of_squares = sum(x ** 2 for x in range(100))
print(sum_of_squares)  # 328350

# 过滤
even_squares = (x ** 2 for x in range(20) if x % 2 == 0)
print(list(even_squares))  # [0, 4, 16, 36, 64, 100, 144, 196, 256, 324]

# 嵌套生成器表达式
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = (item for row in matrix for item in row)
print(list(flattened))  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 生成器方法

```python
def counter_with_send():
    """演示 send 方法"""
    count = 0
    while True:
        received = yield count
        if received is not None:
            count = received
        else:
            count += 1

gen = counter_with_send()

# 启动生成器
print(next(gen))  # 0

# 使用 send 发送值
print(gen.send(10))  # 10
print(next(gen))      # 11
print(gen.send(100))  # 100

# throw 方法：在生成器内部抛出异常
def error_handling_generator():
    try:
        yield 1
        yield 2
        yield 3
    except ValueError as e:
        yield f"捕获异常: {e}"

gen = error_handling_generator()
print(next(gen))  # 1
print(gen.throw(ValueError, "测试异常"))  # 捕获异常: 测试异常

# close 方法：关闭生成器
def infinite_gen():
    n = 0
    try:
        while True:
            yield n
            n += 1
    finally:
        print("生成器已关闭")

gen = infinite_gen()
print(next(gen))  # 0
print(next(gen))  # 1
gen.close()       # 生成器已关闭
# print(next(gen))  # StopIteration
```

## 返回值

### 基本返回值

```python
def add(a, b):
    """返回两数之和"""
    return a + b

result = add(3, 5)
print(result)  # 8

# 无返回值的函数
def greet(name):
    """打印问候语（无返回值）"""
    print(f"Hello, {name}!")
    # 隐式返回 None

result = greet("Alice")  # 打印: Hello, Alice!
print(result)  # None
```

## Lambda 表达式

```python
# 普通函数
def square(x):
    return x ** 2

# Lambda 表达式
square = lambda x: x ** 2
print(square(5))  # 25

# Lambda 的语法：lambda 参数: 表达式

# 多参数 lambda
add = lambda a, b: a + b
print(add(3, 5))  # 8

# 条件表达式
is_even = lambda x: "偶数" if x % 2 == 0 else "奇数"
print(is_even(4))  # 偶数
print(is_even(5))  # 奇数

# 与 map、filter 结合
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

print(squares)  # [1, 4, 9, 16, 25]
print(evens)    # [2, 4]

# 排序时使用 lambda
students = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78}
]

# 按分数排序
sorted_by_score = sorted(students, key=lambda s: s["score"], reverse=True)
print(sorted_by_score)

# 按名字长度排序
sorted_by_name_length = sorted(students, key=lambda s: len(s["name"]))
print(sorted_by_name_length)

# 嵌套 lambda（不推荐，可读性差）
multiply = lambda x: lambda y: x * y
double = multiply(2)
print(double(5))  # 10
```

## 注意事项和最佳实践

### 函数命名规范

```python
# ✅ 好的命名：动词开头，描述性强
def calculate_total_price(items):
    pass

def send_email(to, subject, body):
    pass

def is_valid_email(email):
    pass

def get_user_by_id(user_id):
    pass

# ❌ 不好的命名：不清晰
def process(data):  # 处理什么？
    pass

def func1(x):  # 无意义
    pass

def do_stuff():  # 太模糊
    pass
```

### 函数设计原则

```python
# ✅ 单一职责原则：一个函数只做一件事
def read_file(file_path):
    """读取文件内容"""
    with open(file_path, 'r') as f:
        return f.read()

def parse_json(json_string):
    """解析 JSON 字符串"""
    import json
    return json.loads(json_string)

def save_to_file(data, file_path):
    """保存数据到文件"""
    with open(file_path, 'w') as f:
        f.write(data)

# ❌ 违反单一职责
def read_parse_and_save(input_path, output_path):
    """做太多事情"""
    pass

# ✅ 函数应该小而专注
def calculate_discount(price, discount_rate):
    """计算折扣价格"""
    if discount_rate < 0 or discount_rate > 1:
        raise ValueError("折扣率必须在 0 到 1 之间")
    return price * (1 - discount_rate)

# ✅ 使用有意义的参数名
def create_user(username, email, age):
    pass

# ❌ 避免使用无意义的参数名
def create_user(u, e, a):
    pass
```

### 参数设计最佳实践

```python
# ✅ 使用默认参数提高灵活性
def connect_database(host="localhost", port=5432, database="mydb"):
    pass

# ✅ 避免可变默认参数
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# ❌ 危险：可变默认参数
def add_item_wrong(item, items=[]):
    items.append(item)
    return items

# ✅ 参数数量适中（通常不超过 3-4 个）
def create_user(name, email, password):
    pass

# 如果参数太多，考虑使用配置对象
class DatabaseConfig:
    def __init__(self, host, port, username, password, database):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.database = database

def connect_database(config):
    pass

# ✅ 使用类型提示（Python 3.5+）
def add(a: int, b: int) -> int:
    return a + b

def greet(name: str) -> str:
    return f"Hello, {name}!"

from typing import List, Dict, Optional

def process_items(items: List[str]) -> Dict[str, int]:
    return {item: len(item) for item in items}

def find_user(user_id: int) -> Optional[Dict]:
    # 可能返回 None
    pass
```

### 错误处理最佳实践

```python
# ✅ 使用具体的异常类型
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

# ✅ 提供有用的错误信息
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"年龄必须是整数，当前类型: {type(age)}")
    if age < 0 or age > 150:
        raise ValueError(f"年龄必须在 0-150 之间，当前值: {age}")
    return age

# ✅ 使用 try-except 处理预期错误
def read_config(file_path):
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"配置文件不存在: {file_path}")
        return None
    except PermissionError:
        print(f"没有权限读取文件: {file_path}")
        return None

# ✅ 不要捕获所有异常（除非有充分理由）
def bad_example():
    try:
        # 一些操作
        pass
    except:  # ❌ 捕获所有异常
        pass

def good_example():
    try:
        # 一些操作
        pass
    except (ValueError, TypeError) as e:  # ✅ 捕获特定异常
        print(f"错误: {e}")
```

## 常见错误示例

### 错误 1：可变默认参数

```python
# ❌ 错误示例
def add_item(item, items=[]):
    items.append(item)
    return items

list1 = add_item("a")  # ["a"]
list2 = add_item("b")  # ["a", "b"] - 不是预期的 ["b"]！
print(list1)  # ["a", "b"]
print(list2)  # ["a", "b"]

# ✅ 正确写法
def add_item_correct(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

list3 = add_item_correct("a")  # ["a"]
list4 = add_item_correct("b")  # ["b"]
print(list3)  # ["a"]
print(list4)  # ["b"]
```

### 错误 2：修改参数的可变对象

```python
# ❌ 错误示例：意外修改传入的列表
def double_values(numbers):
    for i in range(len(numbers)):
        numbers[i] *= 2
    return numbers

original = [1, 2, 3]
result = double_values(original)
print(result)   # [2, 4, 6]
print(original) # [2, 4, 6] - 原列表被修改了！

# ✅ 正确写法：创建副本
def double_values_safe(numbers):
    result = numbers.copy()  # 或 list(numbers)
    for i in range(len(result)):
        result[i] *= 2
    return result

original = [1, 2, 3]
result = double_values_safe(original)
print(result)   # [2, 4, 6]
print(original) # [1, 2, 3] - 原列表保持不变
```

### 错误 3：忘记返回值

```python
# ❌ 错误示例：忘记 return
def calculate_sum(a, b):
    result = a + b
    # 忘记 return result

value = calculate_sum(3, 5)
print(value)  # None

# ✅ 正确写法
def calculate_sum_correct(a, b):
    return a + b

value = calculate_sum_correct(3, 5)
print(value)  # 8
```

### 错误 4：参数顺序错误

```python
# ❌ 错误示例：参数顺序混淆
def create_user(name, age, email):
    return {"name": name, "age": age, "email": email}

user = create_user("alice@example.com", 25, "Alice")
print(user)  # {'name': 'alice@example.com', 'age': 25, 'email': 'Alice'} - 错误！

# ✅ 正确写法：使用关键字参数
user = create_user(name="Alice", age=25, email="alice@example.com")
print(user)  # {'name': 'Alice', 'age': 25, 'email': 'alice@example.com'}
```

### 错误 5：递归无终止条件

```python
# ❌ 错误示例：无限递归
def countdown(n):
    print(n)
    countdown(n - 1)  # 没有终止条件！

# countdown(5)  # RecursionError: maximum recursion depth exceeded

# ✅ 正确写法
def countdown_correct(n):
    if n <= 0:
        print("完成！")
        return
    print(n)
    countdown_correct(n - 1)

countdown_correct(5)
```

### 错误 6：闭包中的变量陷阱

```python
# ❌ 错误示例：闭包中的延迟绑定
def create_multipliers():
    return [lambda x: x * i for i in range(5)]

multipliers = create_multipliers()
print(multipliers[0](2))  # 8 (期望是 0)
print(multipliers[1](2))  # 8 (期望是 2)
print(multipliers[2](2))  # 8 (期望是 4)
# 所有 lambda 都使用 i 的最终值 4

# ✅ 正确写法：使用默认参数捕获值
def create_multipliers_correct():
    return [lambda x, i=i: x * i for i in range(5)]

multipliers = create_multipliers_correct()
print(multipliers[0](2))  # 0
print(multipliers[1](2))  # 2
print(multipliers[2](2))  # 4
```

### 错误 7：生成器只能迭代一次

```python
# ❌ 错误示例：重复使用生成器
def get_numbers():
    for i in range(5):
        yield i

gen = get_numbers()
print(list(gen))  # [0, 1, 2, 3, 4]
print(list(gen))  # [] - 生成器已耗尽！

# ✅ 正确写法：重新创建生成器
gen = get_numbers()
print(list(gen))  # [0, 1, 2, 3, 4]
gen = get_numbers()  # 重新创建
print(list(gen))  # [0, 1, 2, 3, 4]

# 或者转换为列表
numbers = list(get_numbers())
print(numbers)  # [0, 1, 2, 3, 4]
print(numbers)  # [0, 1, 2, 3, 4]
```

### 错误 8：函数副作用

```python
# ❌ 错误示例：函数有副作用
total = 0

def add_to_total(value):
    global total
    total += value
    return total

result1 = add_to_total(5)  # 5
result2 = add_to_total(5)  # 10 - 相同输入，不同输出！

# ✅ 正确写法：纯函数，无副作用
def add_values(a, b):
    return a + b

result1 = add_values(5, 5)  # 10
result2 = add_values(5, 5)  # 10 - 相同输入，相同输出
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch05_functions) 完成以下任务：

1. **定义函数** - 创建一个计算阶乘的函数
2. **递归函数** - 用递归实现斐波那契数列
3. **Lambda 应用** - 使用 lambda 和 map 处理数据
4. **闭包练习** - 创建一个计数器工厂函数
5. **装饰器练习** - 实现一个计时装饰器
6. **生成器练习** - 实现一个无限斐波那契数列生成器

---

## 📚 本章小结

| 概念 | 说明 |
|------|------|
| 函数定义 | `def function_name(parameters):` |
| 参数类型 | 位置参数、关键字参数、默认参数、`*args`、`**kwargs` |
| 返回值 | `return` 语句，可返回多个值（元组解包） |
| 文档字符串 | `"""文档内容"""`，使用 `help()` 查看 |
| 递归 | 函数调用自身，必须有终止条件 |
| 高阶函数 | `map()`、`filter()`、`reduce()` |
| 闭包 | 内部函数引用外部函数的变量 |
| 装饰器 | 修改或增强函数行为的函数 |
| 生成器 | 使用 `yield` 的函数，惰性计算 |

---

**[下一章预告]** → 数据结构：列表、元组、字典、集合