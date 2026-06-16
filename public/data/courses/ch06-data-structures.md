# 数据结构

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>Python 提供了四种内置数据结构：列表、元组、字典和集合，用于组织和存储数据。掌握这些数据结构是 Python 编程的基础，它们各有特点，适用于不同的场景。</p>
</div>

## 列表 (List)

列表是**可变**的有序序列，可以存储任意类型的元素，是 Python 中最常用的数据结构之一。

### 创建列表

```python
# 方式一：直接创建
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]  # 列表可以包含不同类型的元素

# 方式二：空列表
empty_list1 = []
empty_list2 = list()

# 方式三：使用 list() 构造函数
chars = list("hello")     # ['h', 'e', 'l', 'l', 'o']
nums = list(range(5))     # [0, 1, 2, 3, 4]

# 方式四：列表推导式
squares = [x**2 for x in range(1, 6)]  # [1, 4, 9, 16, 25]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
```

### 索引访问

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]

# 正向索引（从 0 开始）
print(fruits[0])   # "苹果"（第一个元素）
print(fruits[2])   # "橙子"（第三个元素）

# 负向索引（从 -1 开始，-1 表示最后一个）
print(fruits[-1])  # "西瓜"（最后一个元素）
print(fruits[-2])  # "葡萄"（倒数第二个元素）

# 索引越界会报错
# fruits[10]  # IndexError: list index out of range
# fruits[-10] # IndexError: list index out of range
```

### 切片操作

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]

# 基本语法：list[start:stop:step]
# start：起始索引（默认 0）
# stop：结束索引（不包含，默认到末尾）
# step：步长（默认 1）

# 基本切片
print(fruits[1:3])    # ["香蕉", "橙子"]
print(fruits[:3])     # ["苹果", "香蕉", "橙子"]（从头开始）
print(fruits[2:])     # ["橙子", "葡萄", "西瓜"]（到末尾）
print(fruits[:])      # 完整列表的副本

# 使用步长
print(fruits[::2])    # ["苹果", "橙子", "西瓜"]（每隔一个取一个）
print(fruits[1:4:2])  # ["香蕉", "葡萄"]

# 负步长（反转列表）
print(fruits[::-1])   # ["西瓜", "葡萄", "橙子", "香蕉", "苹果"]

# 切片不会越界，会自动调整范围
print(fruits[2:100])  # ["橙子", "葡萄", "西瓜"]
```

### 增加元素

```python
fruits = ["苹果", "香蕉"]

# append() - 在末尾添加单个元素
fruits.append("橙子")
print(fruits)  # ["苹果", "香蕉", "橙子"]

# extend() - 在末尾添加多个元素（可迭代对象）
fruits.extend(["葡萄", "西瓜"])
print(fruits)  # ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]

# append vs extend 的区别
list1 = [1, 2, 3]
list1.append([4, 5])
print(list1)   # [1, 2, 3, [4, 5]]  # 添加了一个列表作为元素

list2 = [1, 2, 3]
list2.extend([4, 5])
print(list2)   # [1, 2, 3, 4, 5]    # 添加了多个元素

# insert() - 在指定位置插入元素
fruits = ["苹果", "橙子"]
fruits.insert(1, "香蕉")  # 在索引 1 处插入
print(fruits)  # ["苹果", "香蕉", "橙子"]

# insert() 在开头或末尾插入
fruits.insert(0, "草莓")   # 在开头插入
fruits.insert(len(fruits), "西瓜")  # 在末尾插入（等同于 append）
```

### 删除元素

```python
fruits = ["苹果", "香蕉", "橙子", "香蕉", "葡萄"]

# remove() - 删除第一个匹配的元素
fruits.remove("香蕉")
print(fruits)  # ["苹果", "橙子", "香蕉", "葡萄"]
# 注意：remove() 只删除第一个匹配项
# fruits.remove("西瓜")  # ValueError: list.remove(x): x not in list

# pop() - 删除并返回指定索引的元素（默认最后一个）
last = fruits.pop()
print(last)     # "葡萄"
print(fruits)   # ["苹果", "橙子", "香蕉"]

item = fruits.pop(1)
print(item)     # "橙子"
print(fruits)   # ["苹果", "香蕉"]

# del 语句 - 删除指定索引或切片
fruits = ["苹果", "香蕉", "橙子", "葡萄"]
del fruits[1]
print(fruits)   # ["苹果", "橙子", "葡萄"]

del fruits[1:3]
print(fruits)   # ["苹果"]

# clear() - 清空列表
fruits = ["苹果", "香蕉", "橙子"]
fruits.clear()
print(fruits)   # []
```

### 修改元素

```python
fruits = ["苹果", "香蕉", "橙子", "葡萄"]

# 修改单个元素
fruits[1] = "草莓"
print(fruits)  # ["苹果", "草莓", "橙子", "葡萄"]

# 修改多个元素（切片赋值）
fruits[1:3] = ["蓝莓", "芒果"]
print(fruits)  # ["苹果", "蓝莓", "芒果", "葡萄"]

# 切片赋值可以改变列表长度
fruits[1:3] = ["梨"]
print(fruits)  # ["苹果", "梨", "葡萄"]
```

### 查找元素

```python
fruits = ["苹果", "香蕉", "橙子", "香蕉", "葡萄"]

# in 运算符 - 检查元素是否存在
print("香蕉" in fruits)    # True
print("西瓜" in fruits)    # False

# index() - 返回元素的索引（第一个匹配项）
print(fruits.index("香蕉"))   # 1
# fruits.index("西瓜")  # ValueError: '西瓜' is not in list

# index() 指定搜索范围
print(fruits.index("香蕉", 2))  # 3（从索引 2 开始搜索）

# count() - 统计元素出现次数
print(fruits.count("香蕉"))    # 2
print(fruits.count("西瓜"))     # 0
```

### 列表排序

```python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

# sort() - 原地排序（修改原列表）
numbers.sort()
print(numbers)  # [1, 1, 2, 3, 4, 5, 6, 9]

numbers.sort(reverse=True)
print(numbers)  # [9, 6, 5, 4, 3, 2, 1, 1]

# sorted() - 返回新列表（不修改原列表）
numbers = [3, 1, 4, 1, 5]
sorted_nums = sorted(numbers)
print(numbers)       # [3, 1, 4, 1, 5]（原列表不变）
print(sorted_nums)   # [1, 1, 3, 4, 5]

# 自定义排序（使用 key 参数）
words = ["apple", "pie", "banana", "cat"]
words.sort(key=len)  # 按长度排序
print(words)  # ["pie", "cat", "apple", "banana"]

# 按多个条件排序
students = [("Alice", 85), ("Bob", 90), ("Charlie", 85)]
students.sort(key=lambda x: (-x[1], x[0]))  # 按分数降序，分数相同按名字升序
print(students)  # [('Bob', 90), ('Alice', 85), ('Charlie', 85)]
```

### 列表反转

```python
numbers = [1, 2, 3, 4, 5]

# reverse() - 原地反转
numbers.reverse()
print(numbers)  # [5, 4, 3, 2, 1]

# 切片反转（返回新列表）
numbers = [1, 2, 3, 4, 5]
reversed_nums = numbers[::-1]
print(reversed_nums)  # [5, 4, 3, 2, 1]

# reversed() - 返回反向迭代器
numbers = [1, 2, 3, 4, 5]
for num in reversed(numbers):
    print(num, end=" ")  # 5 4 3 2 1
```

### 其他常用操作

```python
fruits = ["苹果", "香蕉", "橙子"]

# len() - 获取长度
print(len(fruits))  # 3

# max(), min(), sum() - 数值列表操作
numbers = [1, 2, 3, 4, 5]
print(max(numbers))   # 5
print(min(numbers))   # 1
print(sum(numbers))   # 15

# 列表拼接
list1 = [1, 2]
list2 = [3, 4]
print(list1 + list2)  # [1, 2, 3, 4]

# 列表重复
print([0] * 5)  # [0, 0, 0, 0, 0]

# copy() - 浅拷贝
original = [1, 2, 3]
copied = original.copy()
copied.append(4)
print(original)  # [1, 2, 3]
print(copied)     # [1, 2, 3, 4]
```

### 列表方法汇总

| 方法 | 描述 | 时间复杂度 |
|------|------|-----------|
| `append(x)` | 在末尾添加元素 | O(1) |
| `extend(iterable)` | 在末尾添加多个元素 | O(k) |
| `insert(i, x)` | 在指定位置插入元素 | O(n) |
| `remove(x)` | 删除第一个匹配元素 | O(n) |
| `pop([i])` | 删除并返回指定位置元素 | O(1) 末尾 / O(n) 其他 |
| `clear()` | 清空列表 | O(1) |
| `index(x)` | 返回元素索引 | O(n) |
| `count(x)` | 统计元素出现次数 | O(n) |
| `sort()` | 原地排序 | O(n log n) |
| `reverse()` | 原地反转 | O(n) |
| `copy()` | 返回浅拷贝 | O(n) |

### 常见错误示例

```python
# 错误 1：索引越界
fruits = ["苹果", "香蕉"]
# print(fruits[5])  # IndexError: list index out of range

# 正确做法：先检查长度
if len(fruits) > 5:
    print(fruits[5])

# 错误 2：删除元素时遍历列表
numbers = [1, 2, 3, 2, 4]
# for num in numbers:
#     if num == 2:
#         numbers.remove(num)  # 会漏删！

# 正确做法：使用列表推导式或反向遍历
numbers = [num for num in numbers if num != 2]

# 错误 3：混淆 append 和 extend
list1 = [1, 2, 3]
# list1.append([4, 5])  # [1, 2, 3, [4, 5]]，不是期望的结果

# 正确做法
list1.extend([4, 5])  # [1, 2, 3, 4, 5]

# 错误 4：列表作为默认参数
def add_item(item, my_list=[]):  # 危险！默认列表会被共享
    my_list.append(item)
    return my_list

# 正确做法
def add_item(item, my_list=None):
    if my_list is None:
        my_list = []
    my_list.append(item)
    return my_list

# 错误 5：浅拷贝的陷阱
original = [[1, 2], [3, 4]]
copied = original.copy()
copied[0][0] = 999
print(original[0])  # [999, 2] - 原列表也被修改了！

# 正确做法：使用深拷贝
import copy
original = [[1, 2], [3, 4]]
deep_copied = copy.deepcopy(original)
deep_copied[0][0] = 999
print(original[0])  # [1, 2] - 原列表不受影响
```

### 最佳实践

```python
# 1. 使用列表推导式代替循环创建列表
# 不推荐
squares = []
for x in range(10):
    squares.append(x**2)

# 推荐
squares = [x**2 for x in range(10)]

# 2. 使用 enumerate 获取索引和值
fruits = ["苹果", "香蕉", "橙子"]
# 不推荐
for i in range(len(fruits)):
    print(i, fruits[i])

# 推荐
for i, fruit in enumerate(fruits):
    print(i, fruit)

# 3. 使用 zip 同时遍历多个列表
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
for name, age in zip(names, ages):
    print(f"{name}: {age}")

# 4. 使用 in 检查成员关系
fruits = ["苹果", "香蕉", "橙子"]
if "香蕉" in fruits:
    print("找到了香蕉")

# 5. 使用切片创建列表副本
original = [1, 2, 3]
copied = original[:]  # 或 original.copy()
```

---

## 元组 (Tuple)

元组是**不可变**的有序序列，一旦创建就不能修改。元组通常用于存储不应该被改变的数据集合。

### 创建元组

```python
# 方式一：使用圆括号
point = (3, 4)
colors = ("红", "绿", "蓝")

# 方式二：省略括号（元组打包）
coordinates = 10, 20, 30
print(type(coordinates))  # <class 'tuple'>

# 方式三：单元素元组（注意逗号）
single = (42,)    # 正确：单元素元组
not_tuple = (42)  # 错误：这只是数字 42，不是元组
print(type(single))    # <class 'tuple'>
print(type(not_tuple))  # <class 'int'>

# 方式四：空元组
empty_tuple1 = ()
empty_tuple2 = tuple()

# 方式五：使用 tuple() 构造函数
from_list = tuple([1, 2, 3])    # (1, 2, 3)
from_string = tuple("hello")    # ('h', 'e', 'l', 'l', 'o')
from_range = tuple(range(3))     # (0, 1, 2)
```

### 元组的不可变性

```python
point = (3, 4)

# 元组元素不能修改
# point[0] = 5  # TypeError: 'tuple' object does not support item assignment

# 元组不能添加或删除元素
# point.append(5)  # AttributeError: 'tuple' object has no attribute 'append'

# 但元组可以包含可变对象
nested = ([1, 2], [3, 4])
nested[0].append(3)  # 这是允许的！
print(nested)  # ([1, 2, 3], [3, 4])

# 元组可以重新赋值（创建新元组）
point = (3, 4)
point = (5, 6)  # 创建新元组，不是修改原元组
print(point)  # (5, 6)
```

### 元组拆包

```python
# 基本拆包
point = (3, 4)
x, y = point
print(f"x={x}, y={y}")  # x=3, y=4

# 交换变量
a, b = 1, 2
a, b = b, a
print(a, b)  # 2 1

# 扩展拆包（使用 *）
numbers = (1, 2, 3, 4, 5)
first, *middle, last = numbers
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5

# 忽略某些值
coordinates = (10, 20, 30)
x, _, z = coordinates  # 使用 _ 忽略中间值
print(x, z)  # 10 30

# 嵌套拆包
nested = ((1, 2), (3, 4))
(a, b), (c, d) = nested
print(a, b, c, d)  # 1 2 3 4
```

### 元组操作

```python
# 索引和切片（与列表相同）
colors = ("红", "绿", "蓝", "黄")
print(colors[0])     # "红"
print(colors[-1])    # "黄"
print(colors[1:3])   # ("绿", "蓝")

# 拼接和重复
tuple1 = (1, 2)
tuple2 = (3, 4)
print(tuple1 + tuple2)  # (1, 2, 3, 4)
print(tuple1 * 3)       # (1, 2, 1, 2, 1, 2)

# 成员检查
print("红" in colors)   # True
print("紫" in colors)   # False

# 长度、最大值、最小值
numbers = (3, 1, 4, 1, 5, 9)
print(len(numbers))    # 6
print(max(numbers))    # 9
print(min(numbers))    # 1
print(sum(numbers))    # 23

# 计数和索引
numbers = (1, 2, 3, 2, 2, 4)
print(numbers.count(2))  # 3
print(numbers.index(3))   # 2
```

### 元组作为函数返回值

```python
# 返回多个值
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

stats = get_stats([1, 2, 3, 4, 5])
print(stats)  # (1, 5, 15)

# 直接拆包
minimum, maximum, total = get_stats([1, 2, 3, 4, 5])
print(minimum, maximum, total)  # 1 5 15

# 返回坐标
def get_position():
    return 100, 200

x, y = get_position()
```

### 元组作为字典键

```python
# 元组可以作为字典的键（因为不可变）
locations = {}
locations[(0, 0)] = "原点"
locations[(1, 0)] = "东"
locations[(0, 1)] = "北"

print(locations[(0, 0)])  # "原点"

# 列表不能作为字典键（因为可变）
# locations[[0, 0]] = "原点"  # TypeError: unhashable type: 'list'
```

### 命名元组

```python
from collections import namedtuple

# 创建命名元组类
Point = namedtuple('Point', ['x', 'y'])
Person = namedtuple('Person', 'name age city')

# 创建实例
p = Point(3, 4)
print(p.x, p.y)  # 3 4
print(p[0], p[1])  # 3 4（仍然可以通过索引访问）

person = Person("Alice", 25, "Beijing")
print(person.name)   # "Alice"
print(person.age)    # 25

# 命名元组的方法
print(p._asdict())   # {'x': 3, 'y': 4}（转换为字典）
p2 = p._replace(x=5)  # 创建新实例
print(p2)  # Point(x=5, y=4)
```

### 元组 vs 列表

| 特性 | 元组 | 列表 |
|------|------|------|
| 可变性 | 不可变 | 可变 |
| 语法 | `(1, 2, 3)` | `[1, 2, 3]` |
| 作为字典键 | 可以 | 不可以 |
| 性能 | 更快、内存更小 | 稍慢 |
| 用途 | 固定数据、函数返回值 | 动态数据集合 |

### 最佳实践

```python
# 1. 使用元组表示固定数据
DAYS_OF_WEEK = ("周一", "周二", "周三", "周四", "周五", "周六", "周日")
RGB_RED = (255, 0, 0)

# 2. 函数返回多个值时使用元组
def divide_with_remainder(a, b):
    return a // b, a % b

quotient, remainder = divide_with_remainder(17, 5)

# 3. 使用元组保护数据不被意外修改
def process_data(data):
    data = tuple(data)  # 转换为元组，防止修改
    # ... 处理数据
    return data

# 4. 元组比列表更节省内存
import sys
list_data = [1, 2, 3, 4, 5]
tuple_data = (1, 2, 3, 4, 5)
print(sys.getsizeof(list_data))   # 更大
print(sys.getsizeof(tuple_data))  # 更小
```

---

## 字典 (Dict)

字典存储**键值对**，是 Python 中最重要的数据结构之一。字典的键必须是不可变类型（如字符串、数字、元组），值可以是任意类型。

### 创建字典

```python
# 方式一：使用花括号
person = {
    "name": "Alice",
    "age": 20,
    "city": "Beijing"
}

# 方式二：使用 dict() 构造函数
person = dict(name="Alice", age=20, city="Beijing")

# 方式三：使用键值对列表
person = dict([("name", "Alice"), ("age", 20), ("city", "Beijing")])

# 方式四：空字典
empty_dict1 = {}
empty_dict2 = dict()

# 方式五：字典推导式
squares = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 方式六：fromkeys() 创建具有相同值的字典
keys = ["a", "b", "c"]
d = dict.fromkeys(keys)      # {'a': None, 'b': None, 'c': None}
d = dict.fromkeys(keys, 0)   # {'a': 0, 'b': 0, 'c': 0}
```

### 访问字典

```python
person = {"name": "Alice", "age": 20, "city": "Beijing"}

# 使用键访问
print(person["name"])  # "Alice"

# 键不存在会报错
# print(person["gender"])  # KeyError: 'gender'

# 使用 get() 方法（推荐）
print(person.get("name"))           # "Alice"
print(person.get("gender"))         # None（键不存在返回 None）
print(person.get("gender", "未知"))  # "未知"（指定默认值）

# 检查键是否存在
print("name" in person)     # True
print("gender" in person)   # False

# 获取所有键、值、键值对
print(person.keys())    # dict_keys(['name', 'age', 'city'])
print(person.values())  # dict_values(['Alice', 20, 'Beijing'])
print(person.items())   # dict_items([('name', 'Alice'), ('age', 20), ('city', 'Beijing')])
```

### 修改字典

```python
person = {"name": "Alice", "age": 20}

# 修改值
person["age"] = 21
print(person)  # {'name': 'Alice', 'age': 21}

# 添加新键值对
person["email"] = "alice@example.com"
print(person)  # {'name': 'Alice', 'age': 21, 'email': 'alice@example.com'}

# update() 方法 - 合并字典
person = {"name": "Alice", "age": 20}
new_info = {"age": 21, "city": "Shanghai"}
person.update(new_info)
print(person)  # {'name': 'Alice', 'age': 21, 'city': 'Shanghai'}

# update() 也可以接受键值对参数
person.update(email="alice@example.com", phone="123456")

# setdefault() - 如果键不存在则添加
person = {"name": "Alice"}
person.setdefault("age", 20)     # 添加新键值对
person.setdefault("name", "Bob") # 键已存在，不修改
print(person)  # {'name': 'Alice', 'age': 20}
```

### 删除字典元素

```python
person = {"name": "Alice", "age": 20, "city": "Beijing", "email": "a@b.com"}

# del 语句 - 删除指定键
del person["email"]
print(person)  # {'name': 'Alice', 'age': 20, 'city': 'Beijing'}

# pop() - 删除并返回值
age = person.pop("age")
print(age)      # 20
print(person)   # {'name': 'Alice', 'city': 'Beijing'}

# pop() 指定默认值（键不存在时不报错）
result = person.pop("gender", "不存在")
print(result)   # "不存在"

# popitem() - 删除并返回最后一个键值对（Python 3.7+ 按插入顺序）
item = person.popitem()
print(item)     # ('city', 'Beijing')

# clear() - 清空字典
person.clear()
print(person)   # {}
```

### 遍历字典

```python
person = {"name": "Alice", "age": 20, "city": "Beijing"}

# 遍历键
for key in person:
    print(key)

for key in person.keys():
    print(key)

# 遍历值
for value in person.values():
    print(value)

# 遍历键值对（推荐）
for key, value in person.items():
    print(f"{key}: {value}")

# 带索引遍历
for index, (key, value) in enumerate(person.items()):
    print(f"{index}. {key}: {value}")
```

### 字典方法详解

```python
person = {"name": "Alice", "age": 20}

# get(key, default) - 安全获取值
print(person.get("name"))           # "Alice"
print(person.get("gender"))         # None
print(person.get("gender", "未知"))  # "未知"

# setdefault(key, default) - 获取值，不存在则添加
person = {"name": "Alice"}
result = person.setdefault("age", 20)
print(result)   # 20
print(person)   # {'name': 'Alice', 'age': 20}

# update() - 合并字典或添加键值对
person = {"name": "Alice"}
person.update({"age": 20, "city": "Beijing"})
person.update(email="alice@example.com")
print(person)

# pop(key, default) - 删除并返回值
person = {"name": "Alice", "age": 20}
print(person.pop("age"))       # 20
print(person.pop("gender", "无"))  # "无"（键不存在返回默认值）

# popitem() - 删除并返回最后插入的键值对
person = {"name": "Alice", "age": 20}
item = person.popitem()
print(item)  # ('age', 20)

# keys(), values(), items() - 返回视图对象
person = {"name": "Alice", "age": 20}
keys = person.keys()
values = person.values()
items = person.items()

# 视图对象是动态的，会随字典变化而更新
person["city"] = "Beijing"
print(list(keys))    # ['name', 'age', 'city']

# copy() - 浅拷贝
original = {"name": "Alice", "scores": [90, 85]}
copied = original.copy()
copied["name"] = "Bob"
print(original["name"])  # "Alice"（原字典不受影响）

# 注意：浅拷贝对嵌套对象的影响
copied["scores"].append(95)
print(original["scores"])  # [90, 85, 95]（原字典的列表也被修改）

# fromkeys() - 创建新字典
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)
print(d)  # {'a': 0, 'b': 0, 'c': 0}
```

### 字典推导式

```python
# 基本语法：{key: value for item in iterable}

# 示例 1：平方字典
squares = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 示例 2：带条件过滤
even_squares = {x: x**2 for x in range(1, 10) if x % 2 == 0}
# {2: 4, 4: 16, 6: 36, 8: 64}

# 示例 3：交换键值
original = {"a": 1, "b": 2, "c": 3}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# 示例 4：转换值
prices = {"apple": 5.5, "banana": 3.0, "orange": 4.2}
discounted = {k: v * 0.9 for k, v in prices.items()}
# {'apple': 4.95, 'banana': 2.7, 'orange': 3.78}

# 示例 5：从两个列表创建字典
keys = ["name", "age", "city"]
values = ["Alice", 20, "Beijing"]
person = {k: v for k, v in zip(keys, values)}
# {'name': 'Alice', 'age': 20, 'city': 'Beijing'}
```

### 常见错误示例

```python
# 错误 1：键不存在时直接访问
person = {"name": "Alice"}
# print(person["age"])  # KeyError: 'age'

# 正确做法：使用 get()
print(person.get("age", "未知"))

# 错误 2：使用可变对象作为键
# d = {[1, 2]: "value"}  # TypeError: unhashable type: 'list'

# 正确做法：使用不可变类型
d = {(1, 2): "value"}  # 元组可以作为键

# 错误 3：遍历时修改字典
person = {"name": "Alice", "age": 20}
# for key in person:
#     if key == "age":
#         del person[key]  # RuntimeError: dictionary changed size during iteration

# 正确做法：收集要删除的键，遍历后删除
keys_to_delete = [key for key in person if key == "age"]
for key in keys_to_delete:
    del person[key]

# 错误 4：浅拷贝陷阱
original = {"scores": [90, 85]}
copied = original.copy()
copied["scores"].append(95)
print(original["scores"])  # [90, 85, 95] - 原字典也被修改

# 正确做法：使用深拷贝
import copy
deep_copied = copy.deepcopy(original)

# 错误 5：混淆 in 操作符
person = {"name": "Alice", "age": 20}
print("Alice" in person)      # False（检查的是键）
print("name" in person)       # True
print("Alice" in person.values())  # True（检查值）
```

### 最佳实践

```python
# 1. 使用 get() 方法安全访问
person = {"name": "Alice"}
age = person.get("age", 0)  # 提供默认值

# 2. 使用 setdefault() 初始化嵌套字典
word_count = {}
words = ["apple", "banana", "apple", "orange"]
for word in words:
    word_count.setdefault(word, 0)
    word_count[word] += 1

# 或使用 defaultdict
from collections import defaultdict
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1

# 3. 使用字典推导式简化代码
# 不推荐
squares = {}
for x in range(1, 6):
    squares[x] = x ** 2

# 推荐
squares = {x: x**2 for x in range(1, 6)}

# 4. 合并字典的多种方式
dict1 = {"a": 1, "b": 2}
dict2 = {"c": 3, "d": 4}

# Python 3.5+
merged = {**dict1, **dict2}

# Python 3.9+
merged = dict1 | dict2

# 使用 update()
merged = dict1.copy()
merged.update(dict2)

# 5. 使用 items() 遍历
person = {"name": "Alice", "age": 20}
for key, value in person.items():
    print(f"{key}: {value}")
```

---

## 集合 (Set)

集合是**无序不重复**的元素集合，主要用于去重和集合运算。集合中的元素必须是不可变类型。

### 创建集合

```python
# 方式一：使用花括号
colors = {"红", "绿", "蓝"}
numbers = {1, 2, 3, 4, 5}

# 注意：空集合不能用 {}，那是空字典！
empty_dict = {}      # 这是空字典
empty_set = set()    # 这是空集合

# 方式二：使用 set() 构造函数
from_list = set([1, 2, 3, 2, 1])  # {1, 2, 3}（自动去重）
from_string = set("hello")         # {'h', 'e', 'l', 'o'}
from_tuple = set((1, 2, 3))        # {1, 2, 3}

# 方式三：集合推导式
squares = {x**2 for x in range(1, 6)}  # {1, 4, 9, 16, 25}
evens = {x for x in range(10) if x % 2 == 0}  # {0, 2, 4, 6, 8}
```

### 集合基本操作

```python
colors = {"红", "绿", "蓝"}

# 添加元素
colors.add("黄")
print(colors)  # {'红', '绿', '蓝', '黄'}

# 添加已存在的元素（无效果）
colors.add("红")
print(colors)  # 不变

# 删除元素
colors.remove("红")    # 删除元素，不存在会报错
colors.discard("紫")   # 删除元素，不存在不报错

# pop() - 随机删除并返回一个元素
item = colors.pop()
print(f"删除了: {item}")

# clear() - 清空集合
colors.clear()
print(colors)  # set()

# 复制集合
original = {1, 2, 3}
copied = original.copy()
```

### 集合运算

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# 并集（两个集合的所有元素）
print(a | b)           # {1, 2, 3, 4, 5, 6}
print(a.union(b))      # {1, 2, 3, 4, 5, 6}

# 交集（两个集合的共同元素）
print(a & b)                # {3, 4}
print(a.intersection(b))    # {3, 4}

# 差集（在 a 中但不在 b 中）
print(a - b)            # {1, 2}
print(a.difference(b))  # {1, 2}

# 对称差集（在 a 或 b 中，但不同时在两者中）
print(a ^ b)                    # {1, 2, 5, 6}
print(a.symmetric_difference(b))  # {1, 2, 5, 6}

# 子集和超集判断
a = {1, 2}
b = {1, 2, 3, 4}

print(a.issubset(b))      # True（a 是 b 的子集）
print(b.issuperset(a))    # True（b 是 a 的超集）

# 判断是否有交集
a = {1, 2}
b = {3, 4}
print(a.isdisjoint(b))    # True（没有交集）
```

### 集合更新操作

```python
a = {1, 2, 3}
b = {3, 4, 5}

# update() - 并集更新
a.update(b)
print(a)  # {1, 2, 3, 4, 5}

# intersection_update() - 交集更新
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a.intersection_update(b)
print(a)  # {3, 4}

# difference_update() - 差集更新
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a.difference_update(b)
print(a)  # {1, 2}

# symmetric_difference_update() - 对称差集更新
a = {1, 2, 3}
b = {2, 3, 4}
a.symmetric_difference_update(b)
print(a)  # {1, 4}
```

### 不可变集合 (frozenset)

```python
# frozenset 是不可变的集合
fs = frozenset([1, 2, 3, 2, 1])
print(fs)  # frozenset({1, 2, 3})

# 不能添加或删除元素
# fs.add(4)  # AttributeError: 'frozenset' object has no attribute 'add'

# 可以作为字典的键或集合的元素
d = {frozenset([1, 2]): "value"}
s = {frozenset([1, 2]), frozenset([3, 4])}

# 支持集合运算
a = frozenset([1, 2, 3])
b = frozenset([2, 3, 4])
print(a | b)  # frozenset({1, 2, 3, 4})
print(a & b)  # frozenset({2, 3})
```

### 集合推导式

```python
# 基本语法：{expression for item in iterable}

# 示例 1：平方集合
squares = {x**2 for x in range(1, 6)}
# {1, 4, 9, 16, 25}

# 示例 2：带条件过滤
evens = {x for x in range(10) if x % 2 == 0}
# {0, 2, 4, 6, 8}

# 示例 3：字符串去重
chars = {char.upper() for char in "hello world"}
# {'H', 'E', 'L', 'O', ' ', 'W', 'R', 'D'}

# 示例 4：从列表去重
numbers = [1, 2, 2, 3, 3, 3, 4]
unique = {x for x in numbers}
# {1, 2, 3, 4}
```

### 常见错误示例

```python
# 错误 1：使用空花括号创建空集合
empty = {}  # 这是空字典，不是空集合！
print(type(empty))  # <class 'dict'>

# 正确做法
empty = set()
print(type(empty))  # <class 'set'>

# 错误 2：集合包含可变元素
# s = {[1, 2], [3, 4]}  # TypeError: unhashable type: 'list'

# 正确做法：使用元组或 frozenset
s = {(1, 2), (3, 4)}  # 元组可以作为集合元素

# 错误 3：remove() 删除不存在的元素
colors = {"红", "绿"}
# colors.remove("蓝")  # KeyError: '蓝'

# 正确做法：使用 discard()
colors.discard("蓝")  # 不报错

# 错误 4：依赖集合顺序
s = {3, 1, 2}
# 不要假设集合的顺序
# print(s[0])  # TypeError: 'set' object is not subscriptable

# 如果需要有序，使用列表或有序集合
from collections import OrderedDict

# 错误 5：遍历时修改集合
s = {1, 2, 3, 4}
# for item in s:
#     s.remove(item)  # RuntimeError: Set changed size during iteration

# 正确做法：收集要删除的元素
to_remove = {item for item in s if item < 3}
s -= to_remove
```

### 最佳实践

```python
# 1. 使用集合去重
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 5]
unique = list(set(numbers))  # [1, 2, 3, 4, 5]（顺序可能改变）

# 保持顺序的去重
from collections import OrderedDict
unique_ordered = list(OrderedDict.fromkeys(numbers))

# 2. 使用集合进行成员测试（比列表快得多）
valid_ids = {1, 2, 3, 4, 5}  # 使用集合
# valid_ids = [1, 2, 3, 4, 5]  # 列表会慢很多
if user_id in valid_ids:
    print("有效用户")

# 3. 使用集合运算简化代码
required = {"read", "write"}
granted = {"read", "execute", "write"}

# 检查是否拥有所有权限
if required.issubset(granted):
    print("拥有所有必需权限")

# 检查是否拥有任一权限
if required & granted:
    print("拥有部分权限")

# 4. 使用集合推导式
# 不推荐
squares = set()
for x in range(10):
    squares.add(x**2)

# 推荐
squares = {x**2 for x in range(10)}

# 5. 使用 frozenset 作为字典键
graph = {
    frozenset([1, 2]): "edge1",
    frozenset([2, 3]): "edge2"
}
```

---

## 嵌套数据结构

Python 的数据结构可以相互嵌套，形成复杂的数据组织形式。

### 列表的列表（二维列表）

```python
# 创建二维列表
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# 访问元素
print(matrix[0])      # [1, 2, 3]（第一行）
print(matrix[0][1])   # 2（第一行第二列）

# 遍历二维列表
for row in matrix:
    for item in row:
        print(item, end=" ")
    print()

# 使用 enumerate
for i, row in enumerate(matrix):
    for j, item in enumerate(row):
        print(f"matrix[{i}][{j}] = {item}")

# 创建指定大小的二维列表
rows, cols = 3, 4
# 错误方式（引用问题）
# matrix = [[0] * cols] * rows  # 所有行引用同一列表！

# 正确方式
matrix = [[0 for _ in range(cols)] for _ in range(rows)]
# 或
matrix = [[0] * cols for _ in range(rows)]
```

### 字典的列表

```python
# 学生信息列表
students = [
    {"name": "Alice", "age": 20, "score": 90},
    {"name": "Bob", "age": 22, "score": 85},
    {"name": "Charlie", "age": 21, "score": 95}
]

# 访问数据
print(students[0]["name"])  # "Alice"

# 遍历
for student in students:
    print(f"{student['name']}: {student['score']}")

# 查找特定学生
target = next((s for s in students if s["name"] == "Bob"), None)
print(target)  # {'name': 'Bob', 'age': 22, 'score': 85}

# 排序
sorted_students = sorted(students, key=lambda x: x["score"], reverse=True)
```

### 字典的字典

```python
# 嵌套字典
users = {
    "alice": {
        "name": "Alice",
        "age": 20,
        "email": "alice@example.com"
    },
    "bob": {
        "name": "Bob",
        "age": 22,
        "email": "bob@example.com"
    }
}

# 访问嵌套数据
print(users["alice"]["email"])  # "alice@example.com"

# 安全访问（避免 KeyError）
email = users.get("charlie", {}).get("email", "未知")

# 遍历嵌套字典
for username, info in users.items():
    print(f"{username}: {info['name']}")
```

### 列表的字典

```python
# 分类数据
categories = {
    "fruits": ["苹果", "香蕉", "橙子"],
    "vegetables": ["胡萝卜", "西兰花", "菠菜"],
    "meats": ["牛肉", "猪肉", "鸡肉"]
}

# 访问
print(categories["fruits"])     # ["苹果", "香蕉", "橙子"]
print(categories["fruits"][0])   # "苹果"

# 添加数据
categories["fruits"].append("葡萄")

# 遍历
for category, items in categories.items():
    print(f"{category}: {', '.join(items)}")
```

### 复杂嵌套结构

```python
# 复杂的数据结构示例
company = {
    "name": "Tech Corp",
    "departments": [
        {
            "name": "Engineering",
            "manager": "Alice",
            "employees": [
                {"name": "Bob", "role": "Developer"},
                {"name": "Charlie", "role": "Tester"}
            ]
        },
        {
            "name": "Marketing",
            "manager": "David",
            "employees": [
                {"name": "Eve", "role": "Designer"}
            ]
        }
    ]
}

# 访问深层嵌套数据
print(company["departments"][0]["employees"][0]["name"])  # "Bob"

# 遍历复杂结构
for dept in company["departments"]:
    print(f"部门: {dept['name']}, 经理: {dept['manager']}")
    for emp in dept["employees"]:
        print(f"  - {emp['name']}: {emp['role']}")
```

### 处理嵌套结构的工具

```python
# 使用 pprint 美化输出
from pprint import pprint

data = {
    "users": [
        {"id": 1, "name": "Alice", "tags": ["admin", "user"]},
        {"id": 2, "name": "Bob", "tags": ["user"]}
    ]
}
pprint(data)

# 使用 json 格式化输出
import json
print(json.dumps(data, indent=2, ensure_ascii=False))

# 深拷贝嵌套结构
import copy
original = {"a": [1, 2, 3], "b": {"c": 4}}
deep_copy = copy.deepcopy(original)
deep_copy["a"].append(4)
print(original["a"])  # [1, 2, 3]（不受影响）
```

---

## 推导式详解

推导式（Comprehension）是 Python 的特色语法，可以用简洁的方式创建数据结构。

### 列表推导式

```python
# 基本语法：[expression for item in iterable]

# 示例 1：创建平方列表
squares = [x**2 for x in range(1, 6)]
# [1, 4, 9, 16, 25]

# 示例 2：带条件过滤
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# 示例 3：带条件表达式
result = ["偶数" if x % 2 == 0 else "奇数" for x in range(5)]
# ['偶数', '奇数', '偶数', '奇数', '偶数']

# 示例 4：嵌套循环
pairs = [(x, y) for x in range(3) for y in range(3)]
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# 示例 5：带条件的嵌套循环
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]
# [(0,1), (0,2), (1,0), (1,2), (2,0), (2,1)]

# 示例 6：处理字符串
words = ["hello", "world", "python"]
upper_words = [word.upper() for word in words]
# ['HELLO', 'WORLD', 'PYTHON']

# 示例 7：二维列表扁平化
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [item for row in matrix for item in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 示例 8：条件过滤和转换
numbers = [1, -2, 3, -4, 5, -6]
abs_values = [abs(x) for x in numbers if x < 0]
# [2, 4, 6]
```

### 字典推导式

```python
# 基本语法：{key: value for item in iterable}

# 示例 1：创建平方字典
squares = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 示例 2：带条件过滤
even_squares = {x: x**2 for x in range(1, 10) if x % 2 == 0}
# {2: 4, 4: 16, 6: 36, 8: 64}

# 示例 3：交换键值
original = {"a": 1, "b": 2, "c": 3}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# 示例 4：从两个列表创建字典
keys = ["name", "age", "city"]
values = ["Alice", 20, "Beijing"]
person = {k: v for k, v in zip(keys, values)}
# {'name': 'Alice', 'age': 20, 'city': 'Beijing'}

# 示例 5：统计字符出现次数
text = "hello world"
char_count = {char: text.count(char) for char in set(text)}
# {'h': 1, 'e': 1, 'l': 3, 'o': 2, ' ': 1, 'w': 1, 'r': 1, 'd': 1}

# 示例 6：过滤字典
scores = {"Alice": 90, "Bob": 75, "Charlie": 85, "David": 60}
passed = {name: score for name, score in scores.items() if score >= 80}
# {'Alice': 90, 'Charlie': 85}
```

### 集合推导式

```python
# 基本语法：{expression for item in iterable}

# 示例 1：创建平方集合
squares = {x**2 for x in range(1, 6)}
# {1, 4, 9, 16, 25}

# 示例 2：去重
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 5]
unique = {x for x in numbers}
# {1, 2, 3, 4, 5}

# 示例 3：带条件过滤
evens = {x for x in range(10) if x % 2 == 0}
# {0, 2, 4, 6, 8}

# 示例 4：字符串处理
text = "Hello World"
chars = {char.lower() for char in text if char.isalpha()}
# {'h', 'e', 'l', 'o', 'w', 'r', 'd'}

# 示例 5：提取列表中的唯一长度
words = ["apple", "banana", "cherry", "date", "elderberry"]
lengths = {len(word) for word in words}
# {5, 6, 4, 10}
```

### 生成器表达式

```python
# 生成器表达式使用圆括号，惰性求值，节省内存

# 列表推导式（立即计算，占用内存）
squares_list = [x**2 for x in range(1000000)]

# 生成器表达式（惰性计算，节省内存）
squares_gen = (x**2 for x in range(1000000))

# 生成器表达式可以迭代
for square in squares_gen:
    if square > 100:
        break
    print(square)

# 常用于 sum、max、min 等函数
total = sum(x**2 for x in range(100))  # 不需要额外的方括号
maximum = max(x**2 for x in range(100))

# 带条件的生成器表达式
evens = (x for x in range(100) if x % 2 == 0)
print(list(evens)[:10])  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```

### 推导式性能对比

```python
import time

# 列表推导式 vs for 循环
def test_list_comprehension():
    return [x**2 for x in range(10000)]

def test_for_loop():
    result = []
    for x in range(10000):
        result.append(x**2)
    return result

# 列表推导式通常更快
start = time.time()
test_list_comprehension()
print(f"列表推导式: {time.time() - start:.4f}s")

start = time.time()
test_for_loop()
print(f"for 循环: {time.time() - start:.4f}s")

# 生成器表达式 vs 列表推导式（内存效率）
import sys

list_comp = [x**2 for x in range(10000)]
gen_exp = (x**2 for x in range(10000))

print(f"列表推导式内存: {sys.getsizeof(list_comp)} bytes")
print(f"生成器表达式内存: {sys.getsizeof(gen_exp)} bytes")
```

### 推导式最佳实践

```python
# 1. 保持简洁，复杂逻辑使用 for 循环
# 推荐
squares = [x**2 for x in range(10)]

# 太复杂，不推荐
# result = [process(item) for sublist in data if condition1(item)
#           for item in sublist if condition2(item) for key in item.keys()]

# 2. 使用生成器表达式处理大数据
# 不推荐（占用大量内存）
# data = [process(x) for x in range(10000000)]

# 推荐（节省内存）
data = (process(x) for x in range(10000000))

# 3. 嵌套推导式的可读性
# 二维列表
matrix = [[i * j for j in range(5)] for i in range(5)]

# 扁平化
flat = [item for row in matrix for item in row]

# 4. 使用有意义的变量名
# 不推荐
result = [(x, y) for x in range(3) for y in range(3)]

# 推荐
coordinates = [(row, col) for row in range(3) for col in range(3)]
```

---

## 数据结构选择指南

| 数据结构 | 特点 | 适用场景 |
|---------|------|---------|
| 列表 (List) | 有序、可变、允许重复 | 需要按顺序存储和修改数据 |
| 元组 (Tuple) | 有序、不可变、允许重复 | 存储固定数据、作为字典键 |
| 字典 (Dict) | 键值对、无序、键唯一 | 快速查找、存储关联数据 |
| 集合 (Set) | 无序、不重复 | 去重、集合运算、成员测试 |

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch06_data_structures) 完成以下任务：

1. **列表操作** - 列表的增删改查
2. **字典应用** - 用字典统计词频
3. **集合运算** - 求两个集合的交集和并集

---

## 🔑 章节要点

1. **列表**：最常用的数据结构，支持索引、切片、增删改查等丰富操作
2. **元组**：不可变序列，适合存储固定数据和作为字典键
3. **字典**：键值对存储，查找效率高，适合存储关联数据
4. **集合**：自动去重，支持集合运算，成员测试效率高
5. **推导式**：简洁高效地创建数据结构
6. **嵌套结构**：复杂数据的灵活组织方式

---

**[下一章预告]** → 字符串处理：字符串的常用操作和方法