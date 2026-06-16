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

### 变量的本质

在 Python 中，变量实际上是**对象的引用**。变量名指向内存中存储的对象，而不是直接存储值。

```python
# 变量是对对象的引用
a = 100        # 创建整数对象 100，变量 a 指向它
b = a          # b 也指向同一个整数对象 100
a = 200        # a 指向新的整数对象 200，b 仍然指向 100

print(a)  # 200
print(b)  # 100
```

## 变量命名规则详解

### 基本规则

```python
# ✅ 合法的变量名
name = "Alice"           # 字母开头
age = 20                 # 字母开头
_name = "Bob"            # 下划线开头
userName = "Charlie"     # 驼峰命名法
user_name = "David"      # 下划线命名法（推荐）
name2 = "Test"           # 字母开头，后面可以有数字
_2name = "Test"          # 下划线开头，后面可以有数字
变量名 = "中文"           # Python 3 支持中文变量名（不推荐）

# ❌ 非法的变量名（会报错）
# 2name = "Test"         # 不能以数字开头
# my-name = "Test"       # 不能使用连字符（会被解释为减法）
# my name = "Test"       # 不能包含空格
# class = "Test"         # 不能使用 Python 关键字
# def = "Test"           # 不能使用 Python 关键字
# @name = "Test"         # 不能使用特殊符号
```

### Python 关键字（保留字）

以下关键字不能用作变量名：

```python
# Python 关键字列表
False, None, True, and, as, assert, async, await
break, class, continue, def, del, elif, else, except
finally, for, from, global, if, import, in, is
lambda, nonlocal, not, or, pass, raise, return, try
while, with, yield

# 查看所有关键字
import keyword
print(keyword.kwlist)
```

### 命名规范与最佳实践

```python
# 🎯 推荐的命名方式

# 1. 变量名：小写字母 + 下划线（snake_case）
user_name = "Alice"
total_count = 100
is_valid = True

# 2. 常量名：全大写字母 + 下划线
MAX_SIZE = 100
PI = 3.14159
DEFAULT_TIMEOUT = 30

# 3. 类名：驼峰命名法（PascalCase）
class UserProfile:
    pass

class HttpRequestHandler:
    pass

# 4. 私有变量：单下划线开头
_internal_value = 42

# 5. 强私有变量：双下划线开头
__private_data = "secret"

# 6. 魔术方法：双下划线包围
__init__, __str__, __repr__

# ❌ 不推荐的命名方式
x = 100                    # 太短，不具描述性
data = [1, 2, 3]          # 太泛化
myVariable = "test"       # 混合命名风格
```

### 命名示例对比

```python
# ❌ 不好的命名
x = 100
y = 200
z = x + y
flag = True
temp = []

# ✅ 好的命名
width = 100
height = 200
area = width + height
is_valid = True
user_list = []

# ❌ 不好的命名
def f(a, b):
    return a + b

# ✅ 好的命名
def calculate_sum(first_number, second_number):
    return first_number + second_number
```

## 基本数据类型

Python 有多种内置数据类型，可以分为以下几类：

| 类别 | 类型 | 示例 | 说明 |
|------|------|------|------|
| 数值 | `int` | `42` | 整数 |
| 数值 | `float` | `3.14` | 浮点数（小数） |
| 数值 | `complex` | `3+4j` | 复数 |
| 文本 | `str` | `"Hello"` | 字符串 |
| 布尔 | `bool` | `True` / `False` | 布尔值 |
| 序列 | `list` | `[1, 2, 3]` | 列表（可变） |
| 序列 | `tuple` | `(1, 2, 3)` | 元组（不可变） |
| 映射 | `dict` | `{"name": "Alice"}` | 字典 |
| 集合 | `set` | `{1, 2, 3}` | 集合（无序不重复） |
| 集合 | `frozenset` | `frozenset([1, 2])` | 不可变集合 |

### 整数 (int)

整数是没有小数部分的数字，Python 3 中整数没有大小限制。

```python
# 整数的基本表示
a = 100
b = -50
c = 0

# 不同进制的整数
decimal = 100          # 十进制
binary = 0b1010        # 二进制，值为 10
octal = 0o12           # 八进制，值为 10
hexadecimal = 0xA      # 十六进制，值为 10

# 大整数（Python 自动处理）
big_number = 123456789012345678901234567890
print(big_number)      # 123456789012345678901234567890

# 使用下划线分隔大数字（Python 3.6+）
million = 1_000_000    # 等同于 1000000
credit_card = 1234_5678_9012_3456

# 整数运算
a = 10
b = 3

print(a + b)    # 13  加法
print(a - b)    # 7   减法
print(a * b)    # 30  乘法
print(a / b)    # 3.333... 除法（总是返回浮点数）
print(a // b)   # 3   整除（向下取整）
print(a % b)    # 1   取余（模运算）
print(a ** b)   # 1000 幂运算
print(divmod(a, b))  # (3, 1) 同时返回商和余数

# 位运算
x = 5   # 二进制: 101
y = 3   # 二进制: 011
print(x & y)   # 1   按位与
print(x | y)   # 7   按位或
print(x ^ y)   # 6   按位异或
print(~x)      # -6  按位取反
print(x << 1)  # 10  左移
print(x >> 1)  # 2   右移
```

#### 整数常用函数

```python
# 绝对值
print(abs(-10))        # 10

# 最大最小值
print(max(1, 5, 3))    # 5
print(min(1, 5, 3))    # 1

# 幂运算
print(pow(2, 10))      # 1024
print(pow(2, 10, 3))   # 1 (2^10 % 3)

# 进制转换
print(bin(10))         # '0b1010'
print(oct(10))         # '0o12'
print(hex(10))         # '0xa'

# 判断数字类型
print(isinstance(10, int))      # True
```

### 浮点数 (float)

浮点数是带有小数部分的数字。

```python
# 浮点数的基本表示
pi = 3.14159
temperature = -273.15
zero = 0.0

# 科学计数法
large = 1.23e10        # 1.23 × 10^10 = 12300000000.0
small = 1.23e-10       # 1.23 × 10^-10 = 0.000000000123

# 特殊浮点数
import math
print(math.inf)        # inf 无穷大
print(-math.inf)       # -inf 负无穷大
print(math.nan)        # nan 非数字（Not a Number）

# 浮点数运算
a = 3.14
b = 2.0

print(a + b)    # 5.14
print(a - b)    # 1.14
print(a * b)    # 6.28
print(a / b)    # 1.57
print(a // b)   # 1.0  整除
print(a % b)    # 1.14 取余

# ⚠️ 浮点数精度问题
print(0.1 + 0.2)        # 0.30000000000000004（不是精确的 0.3）
print(0.1 + 0.2 == 0.3) # False！

# 解决方案：使用 decimal 模块
from decimal import Decimal
print(Decimal('0.1') + Decimal('0.2'))  # 0.3
print(Decimal('0.1') + Decimal('0.2') == Decimal('0.3'))  # True

# 四舍五入
print(round(3.14159, 2))    # 3.14
print(round(3.5))            # 4（四舍六入五成双）
print(round(2.5))            # 2（四舍六入五成双）

# 数学函数
import math
print(math.floor(3.7))      # 3   向下取整
print(math.ceil(3.2))       # 4   向上取整
print(math.sqrt(16))        # 4.0 平方根
print(math.pow(2, 3))       # 8.0 幂运算
print(math.log(100, 10))    # 2.0 对数
print(math.sin(math.pi/2))  # 1.0 正弦
```

### 字符串 (str)

字符串是由字符组成的序列，用引号包围。

```python
# 创建字符串
single = 'Hello'           # 单引号
double = "World"           # 双引号
mixed = "It's a test"      # 包含单引号，用双引号包围
mixed2 = 'He said "Hi"'    # 包含双引号，用单引号包围

# 多行字符串
text = """这是一个
可以跨多行的
字符串"""

text2 = '''这也是
多行字符串'''

# 原始字符串（不转义）
path = r"C:\Users\name\folder"  # 反斜杠不会被转义
regex = r"\d+\.\d+"             # 正则表达式

# 字符串拼接
full_name = "Alice" + " " + "Smith"  # "Alice Smith"
greeting = "Hello, " + "World!"      # "Hello, World!"

# 字符串重复
echo = "Ha" * 3        # "HaHaHa"
line = "-" * 20        # "--------------------"

# 字符串长度
length = len("Python")  # 6

# 字符串索引和切片
s = "Python"
print(s[0])            # 'P' 第一个字符
print(s[-1])            # 'n' 最后一个字符
print(s[0:3])           # 'Pyt' 切片
print(s[::2])           # 'Pto' 步长为2
print(s[::-1])          # 'nohtyP' 反转

# 字符串是不可变的
s = "Hello"
# s[0] = 'J'           # ❌ TypeError: 字符串不可修改
s = "J" + s[1:]         # ✅ 创建新字符串 "Jello"
```

#### 字符串常用方法

```python
s = "  Hello, World!  "

# 大小写转换
print(s.lower())           # "  hello, world!  "
print(s.upper())           # "  HELLO, WORLD!  "
print(s.title())           # "  Hello, World!  "
print(s.capitalize())      # "  hello, world!  "
print(s.swapcase())        # "  hELLO, wORLD!  "

# 去除空白
print(s.strip())           # "Hello, World!"
print(s.lstrip())          # "Hello, World!  "
print(s.rstrip())          # "  Hello, World!"

# 查找和替换
print(s.find("World"))     # 9 找到返回索引
print(s.find("Python"))    # -1 找不到返回 -1
print(s.index("World"))    # 9 找到返回索引
# print(s.index("Python")) # ❌ ValueError 找不到报错
print(s.replace("World", "Python"))  # "  Hello, Python!  "

# 分割和连接
text = "apple,banana,orange"
fruits = text.split(",")   # ['apple', 'banana', 'orange']
joined = "-".join(fruits)  # "apple-banana-orange"

# 判断方法
print("hello".startswith("he"))    # True
print("hello".endswith("lo"))      # True
print("123".isdigit())             # True
print("abc".isalpha())             # True
print("abc123".isalnum())          # True
print("   ".isspace())             # True
print("Hello World".istitle())    # True

# 格式化字符串
name = "Alice"
age = 25

# f-string（推荐，Python 3.6+）
print(f"My name is {name}, I'm {age} years old.")
print(f"Next year I'll be {age + 1} years old.")
print(f"Pi is approximately {3.14159:.2f}")  # 保留两位小数

# format 方法
print("My name is {}, I'm {} years old.".format(name, age))
print("My name is {0}, I'm {1} years old. {0} is nice.".format(name, age))
print("My name is {n}, I'm {a} years old.".format(n=name, a=age))

# % 格式化（旧式）
print("My name is %s, I'm %d years old." % (name, age))
```

### 布尔值 (bool)

布尔值只有 `True` 和 `False` 两个值。

```python
# 布尔值
is_student = True
is_adult = False

# 布尔值的本质
print(True == 1)    # True
print(False == 0)   # True
print(True + True)  # 2
print(False * 10)   # 0

# 布尔运算
print(True and False)   # False  与（两者都为真才为真）
print(True or False)    # True   或（有一个为真就为真）
print(not True)         # False  非（取反）

# 短路求值
def func():
    print("函数被调用")
    return True

# and 短路：如果第一个为 False，不计算第二个
False and func()        # 不打印任何内容

# or 短路：如果第一个为 True，不计算第二个
True or func()          # 不打印任何内容

# 比较运算符返回布尔值
print(5 > 3)      # True
print(5 < 3)      # False
print(5 == 5)     # True
print(5 != 3)     # True
print(5 >= 5)     # True
print(5 <= 3)     # False

# 链式比较
x = 5
print(1 < x < 10)   # True，等同于 1 < x and x < 10
print(1 < x > 3)    # True，等同于 1 < x and x > 3

# 成员运算符
print("a" in "abc")       # True
print(1 in [1, 2, 3])     # True
print("x" not in "abc")   # True

# 身份运算符
a = [1, 2, 3]
b = [1, 2, 3]
c = a
print(a is c)       # True（同一对象）
print(a is b)       # False（不同对象）
print(a == b)       # True（值相等）
print(a is not b)   # True
```

#### 真值判断

```python
# 以下值在布尔上下文中为 False
bool(False)     # False
bool(None)      # False
bool(0)         # False
bool(0.0)       # False
bool("")        # False（空字符串）
bool([])        # False（空列表）
bool({})        # False（空字典）
bool(())        # False（空元组）
bool(set())     # False（空集合）

# 其他值都为 True
bool(True)      # True
bool(1)         # True
bool(-1)        # True
bool("hello")   # True
bool([0])       # True（非空列表）
bool(" ")       # True（非空字符串，包含空格）

# 实际应用
def process_data(data):
    if data:  # 等同于 if data is not None and len(data) > 0
        print(f"处理数据: {data}")
    else:
        print("没有数据")

process_data([1, 2, 3])  # 处理数据: [1, 2, 3]
process_data([])         # 没有数据
process_data("")         # 没有数据
```

### 列表 (list)

列表是**有序、可变**的序列，可以存储任意类型的元素。

```python
# 创建列表
empty_list = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, [1, 2]]  # 可以混合类型
nested = [[1, 2], [3, 4], [5, 6]]         # 嵌套列表

# 使用 list() 构造函数
from_string = list("hello")   # ['h', 'e', 'l', 'l', 'o']
from_range = list(range(5))    # [0, 1, 2, 3, 4]

# 列表推导式
squares = [x**2 for x in range(5)]        # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]

# 访问元素
fruits = ["apple", "banana", "cherry"]
print(fruits[0])           # "apple"
print(fruits[-1])          # "cherry"
print(fruits[1:3])         # ["banana", "cherry"]

# 修改元素
fruits[0] = "orange"
print(fruits)              # ["orange", "banana", "cherry"]

# 添加元素
fruits.append("grape")     # 末尾添加
fruits.insert(1, "mango")  # 指定位置插入
fruits.extend(["kiwi", "peach"])  # 扩展列表

# 删除元素
fruits.remove("banana")    # 按值删除
popped = fruits.pop()      # 弹出最后一个元素
popped = fruits.pop(0)     # 弹出指定位置的元素
del fruits[0]              # 按索引删除

# 其他操作
print(len(fruits))         # 长度
print("apple" in fruits)   # 成员检查
print(fruits.count("apple"))  # 计数
print(fruits.index("apple"))  # 查找索引

# 排序
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()             # 原地排序
numbers.sort(reverse=True)  # 降序排序
sorted_numbers = sorted(numbers)  # 返回新列表

# 反转
numbers.reverse()          # 原地反转
reversed_numbers = list(reversed(numbers))  # 返回新列表

# 复制列表
original = [1, 2, 3]
copy1 = original.copy()    # 使用 copy() 方法
copy2 = original[:]        # 使用切片
copy3 = list(original)     # 使用 list() 构造函数
```

### 元组 (tuple)

元组是**有序、不可变**的序列，一旦创建就不能修改。

```python
# 创建元组
empty_tuple = ()
single = (1,)              # 单元素元组，注意逗号
coordinates = (10, 20)
mixed = (1, "hello", 3.14)

# 不带括号也能创建元组
point = 1, 2, 3           # (1, 2, 3)

# 使用 tuple() 构造函数
from_list = tuple([1, 2, 3])
from_string = tuple("hello")  # ('h', 'e', 'l', 'l', 'o')

# 访问元素
coordinates = (10, 20, 30)
print(coordinates[0])      # 10
print(coordinates[-1])     # 30
print(coordinates[0:2])    # (10, 20)

# 元组解包
x, y, z = coordinates
print(x, y, z)             # 10 20 30

# 扩展解包
first, *rest = (1, 2, 3, 4, 5)
print(first)               # 1
print(rest)                # [2, 3, 4, 5]

a, *middle, b = (1, 2, 3, 4, 5)
print(a, middle, b)        # 1 [2, 3, 4] 5

# 交换变量
a, b = 1, 2
a, b = b, a
print(a, b)                # 2 1

# 元组是不可变的
t = (1, 2, 3)
# t[0] = 10               # ❌ TypeError: 元组不可修改

# 但元组可以包含可变对象
t = (1, [2, 3], 4)
t[1].append(5)            # ✅ 可以修改列表元素
print(t)                   # (1, [2, 3, 5], 4)

# 元组作为字典键（因为不可变）
locations = {
    (0, 0): "origin",
    (1, 0): "right",
    (0, 1): "up"
}

# 元组常用操作
print(len((1, 2, 3)))      # 3
print((1, 2) + (3, 4))      # (1, 2, 3, 4)
print((1, 2) * 3)          # (1, 2, 1, 2, 1, 2)
print(2 in (1, 2, 3))      # True

# 命名元组
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)            # 10 20
print(p[0], p[1])          # 10 20
```

### 字典 (dict)

字典是**无序、可变**的键值对集合，键必须是不可变类型。

```python
# 创建字典
empty_dict = {}
person = {
    "name": "Alice",
    "age": 25,
    "city": "Beijing"
}

# 使用 dict() 构造函数
d1 = dict(name="Alice", age=25)
d2 = dict([("name", "Alice"), ("age", 25)])
d3 = dict.fromkeys(["a", "b", "c"], 0)  # {'a': 0, 'b': 0, 'c': 0}

# 字典推导式
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 访问元素
print(person["name"])          # "Alice"
print(person.get("age"))       # 25
print(person.get("job", "N/A"))  # "N/A"（默认值）

# 修改元素
person["age"] = 26
person["job"] = "Engineer"     # 添加新键值对

# 删除元素
del person["city"]
age = person.pop("age")        # 弹出并返回值
person.clear()                 # 清空字典

# 常用方法
person = {"name": "Alice", "age": 25}
print(person.keys())           # dict_keys(['name', 'age'])
print(person.values())         # dict_values(['Alice', 25])
print(person.items())          # dict_items([('name', 'Alice'), ('age', 25)])

# 遍历字典
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# 合并字典（Python 3.9+）
d1 = {"a": 1, "b": 2}
d2 = {"c": 3, "d": 4}
merged = d1 | d2               # {"a": 1, "b": 2, "c": 3, "d": 4}
d1 |= d2                       # 原地合并

# setdefault 和 update
person = {"name": "Alice"}
person.setdefault("age", 25)   # 如果键不存在则设置
person.update({"city": "Beijing", "age": 26})  # 批量更新

# 嵌套字典
users = {
    "user1": {"name": "Alice", "age": 25},
    "user2": {"name": "Bob", "age": 30}
}
print(users["user1"]["name"])  # "Alice"
```

### 集合 (set)

集合是**无序、不重复**的元素集合。

```python
# 创建集合
empty_set = set()           # 注意：{} 是空字典，不是空集合
numbers = {1, 2, 3, 4, 5}
from_list = set([1, 2, 2, 3, 3, 3])  # {1, 2, 3} 自动去重

# 集合推导式
evens = {x for x in range(10) if x % 2 == 0}  # {0, 2, 4, 6, 8}

# 添加和删除元素
s = {1, 2, 3}
s.add(4)                    # 添加元素
s.remove(3)                 # 删除元素（不存在会报错）
s.discard(5)                # 删除元素（不存在不报错）
popped = s.pop()            # 随机弹出一个元素
s.clear()                   # 清空集合

# 集合运算
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)                # {1, 2, 3, 4, 5, 6} 并集
print(a & b)                # {3, 4} 交集
print(a - b)                # {1, 2} 差集
print(a ^ b)                # {1, 2, 5, 6} 对称差集

# 方法形式
print(a.union(b))           # 并集
print(a.intersection(b))    # 交集
print(a.difference(b))      # 差集
print(a.symmetric_difference(b))  # 对称差集

# 子集和超集
print({1, 2}.issubset({1, 2, 3}))    # True
print({1, 2, 3}.issuperset({1, 2}))  # True
print({1, 2}.isdisjoint({3, 4}))     # True（无交集）

# 成员检查（集合比列表快得多）
s = set(range(10000))
print(5000 in s)            # O(1) 时间复杂度

# 去重应用
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 5]
unique = list(set(numbers))  # [1, 2, 3, 4, 5]
```

### 不可变集合 (frozenset)

```python
# frozenset 是不可变的集合
fs = frozenset([1, 2, 3, 3])
print(fs)                   # frozenset({1, 2, 3})

# frozenset 可以作为字典键或集合元素
fs1 = frozenset([1, 2])
fs2 = frozenset([3, 4])
d = {fs1: "first", fs2: "second"}
s = {fs1, fs2}
```

## 类型转换详解

### 显式类型转换

```python
# 转换为整数 int()
print(int("42"))            # 42
print(int("42", 16))        # 66（十六进制字符串）
print(int(3.14))             # 3（截断小数）
print(int(3.99))             # 3（截断小数）
print(int(True))             # 1
print(int(False))            # 0
# int("3.14")                # ❌ ValueError
print(int(float("3.14")))    # 3（先转浮点再转整数）

# 转换为浮点数 float()
print(float("3.14"))        # 3.14
print(float("42"))          # 42.0
print(float(42))             # 42.0
print(float("inf"))         # inf
print(float("-inf"))        # -inf
print(float("nan"))         # nan

# 转换为字符串 str()
print(str(42))               # "42"
print(str(3.14))             # "3.14"
print(str(True))             # "True"
print(str([1, 2, 3]))        # "[1, 2, 3]"
print(str({"a": 1}))         # "{'a': 1}"

# 转换为布尔值 bool()
print(bool(0))               # False
print(bool(1))               # True
print(bool(-1))              # True
print(bool(""))              # False
print(bool("hello"))         # True
print(bool([]))               # False
print(bool([0]))              # True
print(bool(None))            # False

# 转换为列表 list()
print(list("hello"))         # ['h', 'e', 'l', 'l', 'o']
print(list((1, 2, 3)))       # [1, 2, 3]
print(list({1, 2, 3}))       # [1, 2, 3]（顺序可能不同）
print(list({"a": 1, "b": 2}))  # ['a', 'b']（只取键）

# 转换为元组 tuple()
print(tuple([1, 2, 3]))      # (1, 2, 3)
print(tuple("hello"))        # ('h', 'e', 'l', 'l', 'o')

# 转换为集合 set()
print(set([1, 2, 2, 3]))     # {1, 2, 3}
print(set("hello"))          # {'h', 'e', 'l', 'o'}

# 转换为字典 dict()
print(dict([("a", 1), ("b", 2)]))  # {'a': 1, 'b': 2}
print(dict(a=1, b=2))               # {'a': 1, 'b': 2}
```

### 隐式类型转换

```python
# 数值运算中的隐式转换
a = 10        # int
b = 3.14      # float
c = a + b     # 13.14（int 自动转为 float）

# 布尔值在数值运算中
print(True + 1)    # 2
print(False * 5)   # 0
print(True + 1.5)  # 2.5
```

### 类型检查

```python
# 使用 type()
x = 42
print(type(x))              # <class 'int'>
print(type(x) == int)        # True

# 使用 isinstance()（推荐）
print(isinstance(x, int))    # True
print(isinstance(x, (int, float)))  # True（检查多个类型）

# isinstance 支持继承关系
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True
print(type(dog) == Animal)      # False（type 不考虑继承）

# 检查是否为 None
x = None
print(x is None)           # True（推荐）
print(x == None)           # True（不推荐）
print(isinstance(x, type(None)))  # True
```

## 可变与不可变类型

### 概念详解

```python
"""
不可变类型（Immutable）：
- int, float, complex, str, tuple, frozenset, bytes, bool, None
- 创建后值不能被修改
- 每次修改都会创建新对象

可变类型（Mutable）：
- list, dict, set, bytearray
- 创建后值可以被修改
- 修改不会创建新对象
"""
```

### 不可变类型示例

```python
# 字符串是不可变的
s = "hello"
# s[0] = 'H'               # ❌ TypeError
s = s.upper()              # 创建新字符串 "HELLO"

# 元组是不可变的
t = (1, 2, 3)
# t[0] = 10                # ❌ TypeError

# 整数是不可变的
a = 10
b = a
a = a + 1                  # a 指向新对象 11，b 仍然指向 10
print(a, b)                # 11 10

# 使用 id() 查看对象地址
x = 100
print(id(x))               # 对象地址
x = x + 1
print(id(x))               # 不同的地址（新对象）
```

### 可变类型示例

```python
# 列表是可变的
lst = [1, 2, 3]
print(id(lst))             # 对象地址
lst.append(4)
print(id(lst))             # 相同的地址（同一对象）

# 字典是可变的
d = {"a": 1}
d["b"] = 2                 # 修改原对象

# 集合是可变的
s = {1, 2, 3}
s.add(4)                   # 修改原对象
```

### 可变类型的陷阱

```python
# ⚠️ 函数参数的可变默认值陷阱
def add_item(item, lst=[]):  # ❌ 危险！默认值在函数定义时创建一次
    lst.append(item)
    return lst

print(add_item(1))         # [1]
print(add_item(2))         # [1, 2]  不是预期的 [2]！
print(add_item(3))         # [1, 2, 3]

# ✅ 正确写法
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(add_item(1))         # [1]
print(add_item(2))         # [2]

# ⚠️ 列表作为类属性陷阱
class MyClass:
    shared_list = []       # ❌ 所有实例共享同一个列表

a = MyClass()
b = MyClass()
a.shared_list.append(1)
print(b.shared_list)       # [1]  b 也看到了修改！

# ✅ 正确写法
class MyClass:
    def __init__(self):
        self.instance_list = []  # 每个实例有自己的列表
```

## 深拷贝与浅拷贝

### 赋值、浅拷贝、深拷贝的区别

```python
import copy

# 赋值：只是创建引用，指向同一对象
original = [1, 2, 3]
assigned = original
assigned.append(4)
print(original)            # [1, 2, 3, 4] 原对象也被修改

# 浅拷贝：创建新对象，但内部元素仍是引用
original = [1, 2, [3, 4]]
shallow = original.copy()  # 或 list(original) 或 copy.copy(original)
shallow.append(5)
print(original)            # [1, 2, [3, 4]] 不受影响
shallow[2].append(5)
print(original)            # [1, 2, [3, 4, 5]] 嵌套列表被修改！

# 深拷贝：递归复制所有层级的对象
original = [1, 2, [3, 4]]
deep = copy.deepcopy(original)
deep[2].append(5)
print(original)            # [1, 2, [3, 4]] 不受影响
```

### 浅拷贝详解

```python
import copy

# 浅拷贝方法
lst = [1, 2, 3]
shallow1 = lst.copy()           # 方法1：copy() 方法
shallow2 = list(lst)            # 方法2：构造函数
shallow3 = lst[:]               # 方法3：切片
shallow4 = copy.copy(lst)        # 方法4：copy 模块

# 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0].append(3)
print(original)            # [[1, 2, 3], [3, 4]] 原对象被修改
```

### 深拷贝详解

```python
import copy

# 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0].append(3)
print(original)            # [[1, 2], [3, 4]] 原对象不受影响

# 复杂嵌套结构
complex_data = {
    "users": [
        {"name": "Alice", "scores": [90, 85, 92]},
        {"name": "Bob", "scores": [88, 91, 87]}
    ],
    "metadata": {"version": 1.0}
}

deep_copy = copy.deepcopy(complex_data)
deep_copy["users"][0]["scores"].append(95)
print(complex_data["users"][0]["scores"])  # [90, 85, 92] 不受影响

# 深拷贝处理循环引用
a = [1, 2]
a.append(a)                 # 循环引用
deep = copy.deepcopy(a)     # 深拷贝可以正确处理
```

### 拷贝选择建议

```python
"""
何时使用：
- 赋值：需要两个变量同步变化时
- 浅拷贝：对象只有一层，或内部元素不需要独立
- 深拷贝：对象有多层嵌套，需要完全独立

性能考虑：
- 赋值：O(1)
- 浅拷贝：O(n)，n 是顶层元素数量
- 深拷贝：O(n)，n 是所有层级的元素总数
"""
```

## 变量作用域

### 作用域类型

Python 有四种作用域（LEGB 规则）：

```python
# L - Local（局部作用域）
# E - Enclosing（嵌套作用域）
# G - Global（全局作用域）
# B - Built-in（内置作用域）

# 内置作用域（Built-in）
print(len([1, 2, 3]))       # len 是内置函数

# 全局作用域（Global）
global_var = "我是全局变量"

def outer():
    # 嵌套作用域（Enclosing）
    enclosing_var = "我是嵌套变量"
    
    def inner():
        # 局部作用域（Local）
        local_var = "我是局部变量"
        
        print(local_var)       # 局部变量
        print(enclosing_var)   # 嵌套变量
        print(global_var)      # 全局变量
        print(len)             # 内置函数
    
    inner()

outer()
```

### global 关键字

```python
# ⚠️ 不使用 global 的陷阱
count = 0

def increment():
    count = count + 1        # ❌ UnboundLocalError
    return count

# ✅ 使用 global 声明
count = 0

def increment():
    global count
    count = count + 1
    return count

increment()                  # 1
increment()                  # 2
print(count)                 # 2

# 建议：尽量避免使用全局变量
# 更好的方式：使用类或返回值
class Counter:
    def __init__(self):
        self.count = 0
    
    def increment(self):
        self.count += 1
        return self.count

counter = Counter()
counter.increment()
```

### nonlocal 关键字

```python
def outer():
    count = 0
    
    def inner():
        nonlocal count       # 声明使用外层变量
        count += 1
        return count
    
    return inner

counter = outer()
print(counter())             # 1
print(counter())             # 2
print(counter())             # 3

# nonlocal 用于闭包
def make_multiplier(factor):
    def multiply(number):
        nonlocal factor
        factor += 1          # 可以修改外层变量
        return number * factor
    return multiply

multiplier = make_multiplier(2)
print(multiplier(5))         # 15 (5 * 3)
print(multiplier(5))          # 20 (5 * 4)
```

### 作用域查找顺序

```python
# LEGB 查找示例
x = "global"

def outer():
    x = "enclosing"
    
    def inner():
        x = "local"
        print(x)            # "local"（先找局部）
    
    inner()
    print(x)                # "enclosing"

outer()
print(x)                    # "global"

# 如果局部没有定义
x = "global"

def outer():
    x = "enclosing"
    
    def inner():
        print(x)            # "enclosing"（局部没有，找嵌套）
    
    inner()

outer()

# 如果嵌套也没有定义
x = "global"

def outer():
    def inner():
        print(x)            # "global"（局部和嵌套都没有，找全局）
    
    inner()

outer()
```

## 常量定义

### Python 中的常量约定

```python
# Python 没有真正的常量，使用命名约定
PI = 3.14159
MAX_SIZE = 100
DEFAULT_TIMEOUT = 30
APP_NAME = "MyApp"

# ⚠️ 实际上仍可修改（但不应该修改）
PI = 3.14                   # 语法上允许，但违反约定

# 使用全大写命名提醒开发者这是常量
class Config:
    MAX_CONNECTIONS = 100
    TIMEOUT = 30
    API_URL = "https://api.example.com"
```

### 使用枚举定义常量

```python
from enum import Enum, IntEnum

# 枚举类
class Color(Enum):
    RED = "red"
    GREEN = "green"
    BLUE = "blue"

print(Color.RED)             # Color.RED
print(Color.RED.value)       # "red"
print(Color.RED.name)        # "RED"

# 整数枚举
class HttpStatus(IntEnum):
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    NOT_FOUND = 404
    INTERNAL_ERROR = 500

print(HttpStatus.OK)         # HttpStatus.OK
print(HttpStatus.OK.value)  # 200

# 使用枚举
def handle_response(status):
    if status == HttpStatus.OK:
        print("请求成功")
    elif status == HttpStatus.NOT_FOUND:
        print("资源未找到")

handle_response(HttpStatus.OK)
```

### 使用 dataclass 定义配置

```python
from dataclasses import dataclass
from typing import Final

@dataclass(frozen=True)  # frozen=True 使实例不可变
class DatabaseConfig:
    host: str
    port: int
    name: str
    user: str
    password: str

config = DatabaseConfig(
    host="localhost",
    port=5432,
    name="mydb",
    user="admin",
    password="secret"
)

# config.port = 3306        # ❌ FrozenInstanceError

# Python 3.8+ 的 Final 类型提示
from typing import Final

MAX_SIZE: Final[int] = 100
# MAX_SIZE = 200            # 类型检查器会警告
```

## 变量赋值与更新

### 基本赋值

```python
# 单变量赋值
x = 10
name = "Alice"

# 多变量赋值
a = b = c = 0               # 三个变量都指向 0
x, y, z = 1, 2, 3           # 分别赋值

# 交换变量
a, b = 1, 2
a, b = b, a                 # 交换值
print(a, b)                 # 2 1

# 解包赋值
coordinates = (10, 20)
x, y = coordinates

values = [1, 2, 3, 4, 5]
first, *middle, last = values
print(first, middle, last)  # 1 [2, 3, 4] 5

# 忽略某些值
a, _, c = (1, 2, 3)         # _ 表示忽略
```

### 增量赋值

```python
# 算术增量赋值
count = 0
count += 1                  # count = count + 1
count -= 1                  # count = count - 1
count *= 2                  # count = count * 2
count /= 2                  # count = count / 2
count //= 2                 # count = count // 2
count %= 2                  # count = count % 2
count **= 2                 # count = count ** 2

# 位运算增量赋值
flags = 0b1010
flags |= 0b0101             # 按位或
flags &= 0b1100             # 按位与
flags ^= 0b0011             # 按位异或
flags <<= 2                 # 左移
flags >>= 2                 # 右移

# 可变对象的增量赋值
lst = [1, 2, 3]
lst += [4, 5]               # 原地修改（等同于 extend）
print(lst)                  # [1, 2, 3, 4, 5]

# 对比
lst = [1, 2, 3]
lst = lst + [4, 5]          # 创建新列表
```

### 海象运算符（Python 3.8+）

```python
# 海象运算符 := 在表达式中赋值

# 传统写法
text = "Hello World"
length = len(text)
if length > 5:
    print(f"文本长度 {length} 超过 5")

# 使用海象运算符
if (length := len(text)) > 5:
    print(f"文本长度 {length} 超过 5")

# 在循环中使用
lines = ["line1", "line2", "line3"]
while (line := lines.pop()) != "line1":
    print(line)

# 在列表推导式中
data = [1, 2, 3, 4, 5]
# 计算一次，多次使用
results = [y for x in data if (y := x * 2) > 4]
print(results)              # [6, 8, 10]

# 读取文件时
# while (line := file.readline()):
#     process(line)
```

## 常见错误示例

### 变量命名错误

```python
# ❌ 使用关键字作为变量名
# class = "Python"         # SyntaxError
# def = 10                 # SyntaxError

# ✅ 正确做法
class_name = "Python"
def_value = 10

# ❌ 以数字开头
# 2name = "Test"           # SyntaxError

# ✅ 正确做法
name2 = "Test"

# ❌ 使用连字符
# my-name = "Test"         # SyntaxError

# ✅ 正确做法
my_name = "Test"
```

### 类型错误

```python
# ❌ 字符串和数字直接相加
age = 25
# message = "年龄是" + age  # TypeError: can only concatenate str to str

# ✅ 正确做法
message = "年龄是" + str(age)
message = f"年龄是{age}"

# ❌ 列表索引越界
lst = [1, 2, 3]
# print(lst[5])            # IndexError

# ✅ 正确做法
if len(lst) > 5:
    print(lst[5])

# ❌ 字典键不存在
d = {"a": 1}
# print(d["b"])            # KeyError

# ✅ 正确做法
print(d.get("b", "默认值"))

# ❌ 修改不可变类型
s = "hello"
# s[0] = 'H'               # TypeError

# ✅ 正确做法
s = "H" + s[1:]
s = s.replace('h', 'H')
```

### 可变默认参数陷阱

```python
# ❌ 错误：可变默认参数
def add_item(item, lst=[]):
    lst.append(item)
    return lst

print(add_item(1))          # [1]
print(add_item(2))          # [1, 2] 不是预期的 [2]

# ✅ 正确做法
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(add_item(1))          # [1]
print(add_item(2))          # [2]
```

### 浅拷贝陷阱

```python
# ❌ 错误：浅拷贝嵌套列表
original = [[1, 2], [3, 4]]
copy_list = original.copy()
copy_list[0].append(3)
print(original)             # [[1, 2, 3], [3, 4]] 被意外修改

# ✅ 正确做法：深拷贝
import copy
original = [[1, 2], [3, 4]]
deep_copy = copy.deepcopy(original)
deep_copy[0].append(3)
print(original)             # [[1, 2], [3, 4]] 不受影响
```

### 变量作用域错误

```python
# ❌ 错误：未声明 global
count = 0

def increment():
    # count = count + 1     # UnboundLocalError
    pass

# ✅ 正确做法
count = 0

def increment():
    global count
    count = count + 1
    return count

# ❌ 错误：在函数内创建同名变量
x = 10

def foo():
    print(x)                # UnboundLocalError（因为后面有赋值）
    x = 20

# ✅ 正确做法
x = 10

def foo():
    global x
    print(x)                # 10
    x = 20
```

### 浮点数精度问题

```python
# ❌ 错误：直接比较浮点数
a = 0.1 + 0.2
# if a == 0.3:             # False!
#     print("相等")

# ✅ 正确做法1：使用容差
tolerance = 1e-9
if abs(a - 0.3) < tolerance:
    print("近似相等")

# ✅ 正确做法2：使用 decimal
from decimal import Decimal
a = Decimal('0.1') + Decimal('0.2')
if a == Decimal('0.3'):
    print("精确相等")

# ✅ 正确做法3：使用 round
a = round(0.1 + 0.2, 10)
if a == 0.3:
    print("相等")
```

## 最佳实践

### 变量命名

```python
# ✅ 使用描述性名称
user_count = 100           # 好
uc = 100                   # 不好

# ✅ 使用一致的命名风格
user_name = "Alice"        # snake_case（推荐）
user_age = 25

# ✅ 布尔变量使用 is/has 前缀
is_valid = True
has_permission = False

# ✅ 避免使用单字母（除了循环计数器）
for i in range(10):        # 可以接受
    pass

# ✅ 使用复数表示集合
users = ["Alice", "Bob"]
scores = [90, 85, 92]
```

### 类型提示

```python
# Python 3.5+ 支持类型提示
from typing import List, Dict, Optional, Union

# 基本类型提示
name: str = "Alice"
age: int = 25
height: float = 1.75
is_student: bool = True

# 容器类型提示
numbers: List[int] = [1, 2, 3]
user_scores: Dict[str, int] = {"Alice": 90, "Bob": 85}

# 可选类型
middle_name: Optional[str] = None

# 联合类型
id_number: Union[int, str] = "12345"

# 函数类型提示
def greet(name: str) -> str:
    return f"Hello, {name}"

def calculate_average(scores: List[float]) -> float:
    return sum(scores) / len(scores)
```

### 避免魔法数字

```python
# ❌ 魔法数字
def calculate_discount(price):
    return price * 0.9      # 0.9 是什么？

# ✅ 使用常量
DISCOUNT_RATE = 0.1

def calculate_discount(price):
    return price * (1 - DISCOUNT_RATE)

# ❌ 魔法字符串
if status == "active":
    pass

# ✅ 使用常量或枚举
STATUS_ACTIVE = "active"
STATUS_INACTIVE = "inactive"

if status == STATUS_ACTIVE:
    pass
```

### 使用 with 语句管理资源

```python
# ❌ 不好的做法
f = open("file.txt", "r")
content = f.read()
f.close()                   # 如果 read 出错，close 不会执行

# ✅ 好的做法
with open("file.txt", "r") as f:
    content = f.read()
# 自动关闭文件，即使发生异常
```

### 使用 f-string 格式化

```python
name = "Alice"
age = 25
score = 95.5

# ❌ 旧式格式化
message = "姓名：%s，年龄：%d，分数：%.1f" % (name, age, score)

# ❌ format 方法
message = "姓名：{}，年龄：{}，分数：{:.1f}".format(name, age, score)

# ✅ f-string（推荐）
message = f"姓名：{name}，年龄：{age}，分数：{score:.1f}"

# f-string 支持表达式
print(f"明年 {age + 1} 岁")
print(f"分数等级：{'A' if score >= 90 else 'B'}")
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
    <li><strong>列表操作</strong> - 练习列表的增删改查</li>
    <li><strong>字典操作</strong> - 练习字典的创建和访问</li>
    <li><strong>深浅拷贝</strong> - 理解深拷贝和浅拷贝的区别</li>
  </ul>
</div>

<div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 mt-8">
  <h3 class="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-3">⚠️ 注意事项</h3>
  <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
    <li>Python 是动态类型语言，变量不需要声明类型</li>
    <li>变量名区分大小写，<code>Name</code> 和 <code>name</code> 是不同的变量</li>
    <li>避免使用 Python 关键字作为变量名</li>
    <li>注意可变类型和不可变类型的区别</li>
    <li>小心可变默认参数陷阱</li>
    <li>浮点数比较要考虑精度问题</li>
    <li>使用有意义的变量名，提高代码可读性</li>
  </ul>
</div>

<div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mt-8">
  <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">💡 学习建议</h3>
  <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
    <li>多动手实践，在 Python 解释器中尝试各种操作</li>
    <li>使用 <code>type()</code> 函数检查变量类型</li>
    <li>使用 <code>id()</code> 函数理解对象引用</li>
    <li>遇到错误时，仔细阅读错误信息</li>
    <li>善用 Python 官方文档：<a href="https://docs.python.org/zh-cn/3/" class="text-blue-600 hover:text-blue-700">https://docs.python.org/zh-cn/3/</a></li>
  </ul>
</div>

---

**[下一章预告]** → 运算符：学习算术、比较和逻辑运算