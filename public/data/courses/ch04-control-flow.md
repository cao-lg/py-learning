# 控制流

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>控制流决定程序执行的顺序。本章介绍条件语句（if-elif-else）、循环语句（for、while）以及各种控制流工具，是编写逻辑程序的基础。</p>
</div>

## 条件语句 if-elif-else

### 基础语法

```python
# 最简单的 if 语句
age = 18

if age >= 18:
    print("已成年")

# if-else 二选一
age = 15

if age >= 18:
    print("已成年")
else:
    print("未成年")
```

### if-elif-else 完整语法

```python
# 完整的多条件判断
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")    # 这个会被执行
elif score >= 60:
    print("及格")
else:
    print("不及格")

# 注意：条件是从上到下依次判断的
# 一旦某个条件满足，后面的条件不会再检查
score = 95

if score >= 60:
    print("及格")      # 这个会被执行
elif score >= 80:
    print("良好")      # 不会执行
elif score >= 90:
    print("优秀")      # 不会执行

# 正确写法：从严格条件开始
if score >= 90:
    print("优秀")      # 这个会被执行
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

### 多个条件组合

```python
# 使用 and、or、not 组合条件
age = 25
has_license = True

# and - 所有条件都满足
if age >= 18 and has_license:
    print("可以驾驶")

# or - 满足任一条件
day = "周六"

if day == "周六" or day == "周日":
    print("周末休息")

# not - 取反
is_raining = False

if not is_raining:
    print("可以出门散步")

# 复杂条件组合
age = 20
is_student = True
has_id = True

if (age >= 18 and has_id) or is_student:
    print("可以享受优惠")
```

### 三元表达式（条件表达式）

```python
# 基本语法：value_if_true if condition else value_if_false
age = 20

# 传统写法
if age >= 18:
    status = "成年"
else:
    status = "未成年"

# 三元表达式写法（更简洁）
status = "成年" if age >= 18 else "未成年"
print(status)  # 输出：成年

# 实际应用示例
score = 75
result = "及格" if score >= 60 else "不及格"
print(result)  # 输出：及格

# 用于返回值
def get_grade(score):
    return "优秀" if score >= 90 else "良好" if score >= 80 else "及格" if score >= 60 else "不及格"

print(get_grade(85))  # 输出：良好

# 用于列表赋值
numbers = [1, 2, 3, 4, 5]
labels = ["偶数" if n % 2 == 0 else "奇数" for n in numbers]
print(labels)  # 输出：['奇数', '偶数', '奇数', '偶数', '奇数']
```

## 嵌套条件

```python
# 嵌套 if 语句
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("可以进入")
    else:
        print("需要购票")
else:
    print("年龄不符合")

# 嵌套层数不宜过多，建议用 and 合并
# 上面的代码可以改写为：
if age >= 18 and has_ticket:
    print("可以进入")
elif age >= 18 and not has_ticket:
    print("需要购票")
else:
    print("年龄不符合")

# 多层嵌套示例（不推荐，可读性差）
score = 85
attendance = 90

if score >= 60:
    if attendance >= 80:
        if score >= 90:
            print("优秀学生")
        else:
            print("合格学生")
    else:
        print("出勤率不足")
else:
    print("成绩不合格")

# 改进写法
if score >= 90 and attendance >= 80:
    print("优秀学生")
elif score >= 60 and attendance >= 80:
    print("合格学生")
elif score >= 60:
    print("出勤率不足")
else:
    print("成绩不合格")
```

## 循环语句

### for 循环

#### 基本遍历

```python
# 遍历列表
fruits = ["苹果", "香蕉", "橙子"]

for fruit in fruits:
    print(fruit)
# 输出：
# 苹果
# 香蕉
# 橙子

# 遍历字符串
for char in "Python":
    print(char)
# 输出：P y t h o n（每个字符一行）

# 遍历字典
person = {"name": "张三", "age": 25, "city": "北京"}

# 遍历键
for key in person:
    print(key)
# 输出：name age city

# 遍历键值对
for key, value in person.items():
    print(f"{key}: {value}")
# 输出：
# name: 张三
# age: 25
# city: 北京

# 只遍历值
for value in person.values():
    print(value)
# 输出：张三 25 北京
```

#### range() 函数详解

```python
# range(stop) - 从 0 到 stop-1
for i in range(5):
    print(i)
# 输出：0 1 2 3 4

# range(start, stop) - 从 start 到 stop-1
for i in range(1, 6):
    print(i)
# 输出：1 2 3 4 5

# range(start, stop, step) - 指定步长
for i in range(0, 10, 2):
    print(i)
# 输出：0 2 4 6 8

# 倒序遍历
for i in range(5, 0, -1):
    print(i)
# 输出：5 4 3 2 1

# range 对象是惰性的，不占用大量内存
r = range(1000000)  # 不会立即创建 100 万个数字
print(r)  # range(0, 1000000)

# 转换为列表
print(list(range(5)))  # [0, 1, 2, 3, 4]
print(list(range(2, 10, 2)))  # [2, 4, 6, 8]
```

#### enumerate() 函数

```python
# 同时获取索引和元素
fruits = ["苹果", "香蕉", "橙子"]

for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
# 输出：
# 0: 苹果
# 1: 香蕉
# 2: 橙子

# 指定起始索引
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}: {fruit}")
# 输出：
# 1: 苹果
# 2: 香蕉
# 3: 橙子

# 实际应用：追踪元素位置
scores = [85, 92, 78, 95, 88]

for i, score in enumerate(scores):
    if score >= 90:
        print(f"第 {i+1} 位同学成绩优秀：{score}分")
# 输出：
# 第 2 位同学成绩优秀：92分
# 第 4 位同学成绩优秀：95分
```

#### zip() 函数

```python
# 并行遍历多个序列
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
cities = ["北京", "上海", "广州"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age}岁, 来自{city}")
# 输出：
# 张三, 25岁, 来自北京
# 李四, 30岁, 来自上海
# 王五, 28岁, 来自广州

# zip 以最短的序列为准
list1 = [1, 2, 3, 4, 5]
list2 = ['a', 'b', 'c']

for num, letter in zip(list1, list2):
    print(f"{num}: {letter}")
# 输出：
# 1: a
# 2: b
# 3: c

# 使用 zip 创建字典
keys = ['name', 'age', 'city']
values = ['张三', 25, '北京']
person = dict(zip(keys, values))
print(person)  # {'name': '张三', 'age': 25, 'city': '北京'}

# 同时遍历索引和多个序列
for i, (name, age) in enumerate(zip(names, ages)):
    print(f"{i+1}. {name}: {age}岁")
```

### while 循环

#### 基本语法

```python
# 基本结构
count = 0

while count < 5:
    print(count)
    count += 1
# 输出：0 1 2 3 4

# 注意：一定要有改变条件的语句，否则会无限循环
# 错误示例（无限循环）：
# while True:
#     print("永远执行")
```

#### while 循环详解

```python
# 计算 1 到 100 的和
total = 0
num = 1

while num <= 100:
    total += num
    num += 1

print(f"1到100的和是：{total}")  # 5050

# 用户输入验证
password = ""

while password != "123456":
    password = input("请输入密码：")
    if password != "123456":
        print("密码错误，请重试")

print("登录成功！")

# 带计数器的循环
attempts = 0
max_attempts = 3

while attempts < max_attempts:
    password = input("请输入密码：")
    attempts += 1
    
    if password == "123456":
        print("登录成功！")
        break
    else:
        remaining = max_attempts - attempts
        if remaining > 0:
            print(f"密码错误，还剩 {remaining} 次机会")
        else:
            print("账户已锁定")

# while-else 结构
num = 2
divisor = 2

while divisor < num:
    if num % divisor == 0:
        print(f"{num} 不是质数")
        break
    divisor += 1
else:
    print(f"{num} 是质数")
```

#### while vs for 的选择

```python
# for 循环：已知迭代次数，遍历序列
# 适合：遍历列表、字符串、范围等
for i in range(10):
    print(i)

# while 循环：未知迭代次数，依赖条件
# 适合：用户输入、等待事件、游戏循环等
import random

target = random.randint(1, 100)
guess = 0

while guess != target:
    guess = int(input("猜一个数字（1-100）："))
    if guess < target:
        print("太小了")
    elif guess > target:
        print("太大了")

print("猜对了！")
```

## break、continue 和 pass

### break - 退出循环

```python
# break - 完全退出循环
for i in range(10):
    if i == 5:
        break
    print(i)
# 输出：0 1 2 3 4

# 实际应用：查找元素
numbers = [3, 7, 2, 9, 5]
target = 9
found = False

for num in numbers:
    if num == target:
        found = True
        print(f"找到目标：{num}")
        break

if not found:
    print("未找到目标")

# 在嵌套循环中使用 break
for i in range(3):
    for j in range(3):
        if i == 1 and j == 1:
            break  # 只退出内层循环
        print(f"({i}, {j})")
# 输出：
# (0, 0) (0, 1) (0, 2)
# (1, 0)
# (2, 0) (2, 1) (2, 2)
```

### continue - 跳过当前迭代

```python
# continue - 跳过本次循环，继续下一次
for i in range(5):
    if i == 2:
        continue
    print(i)
# 输出：0 1 3 4

# 实际应用：过滤数据
numbers = [1, -2, 3, -4, 5, -6]

for num in numbers:
    if num < 0:
        continue  # 跳过负数
    print(f"正数：{num}")
# 输出：
# 正数：1
# 正数：3
# 正数：5

# 打印奇数
for i in range(1, 11):
    if i % 2 == 0:
        continue
    print(i)
# 输出：1 3 5 7 9
```

### pass - 占位语句

```python
# pass - 什么都不做，用作占位符
for i in range(5):
    pass  # TODO: 稍后实现

if True:
    pass  # 先占位，避免语法错误

# 定义空函数或类
def my_function():
    pass  # 稍后实现

class MyClass:
    pass  # 空类

# pass vs continue 的区别
for i in range(5):
    if i == 2:
        pass
    print(i)
# 输出：0 1 2 3 4（pass 不影响循环）

for i in range(5):
    if i == 2:
        continue
    print(i)
# 输出：0 1 3 4（continue 跳过了 i=2）
```

## 循环 else 子句

```python
# 循环正常结束时会执行 else
for i in range(3):
    print(i)
else:
    print("循环正常结束")
# 输出：
# 0
# 1
# 2
# 循环正常结束

# break 退出时不执行 else
for i in range(10):
    if i == 3:
        break
    print(i)
else:
    print("不会执行，因为被 break 打断")
# 输出：0 1 2

# 实际应用：查找质数
def is_prime(n):
    if n < 2:
        return False
    
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            break  # 找到因子，不是质数
    else:
        return True  # 循环正常结束，是质数
    
    return False

print(is_prime(7))   # True
print(is_prime(12))  # False

# 实际应用：搜索验证
def find_item(items, target):
    for index, item in enumerate(items):
        if item == target:
            return index
    else:
        return -1  # 未找到

print(find_item([1, 2, 3, 4, 5], 3))   # 2
print(find_item([1, 2, 3, 4, 5], 10))  # -1

# while 循环的 else
count = 0

while count < 3:
    print(count)
    count += 1
else:
    print("while 循环正常结束")
# 输出：0 1 2 while 循环正常结束
```

## 嵌套循环

```python
# 嵌套 for 循环 - 打印九九乘法表
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="  ")
    print()  # 换行

# 输出：
# 1×1=1
# 1×2=2  2×2=4
# 1×3=3  2×3=6  3×3=9
# ...以此类推

# 嵌套循环 - 遍历二维列表
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

for row in matrix:
    for element in row:
        print(element, end=" ")
    print()
# 输出：
# 1 2 3
# 4 5 6
# 7 8 9

# 使用 enumerate 遍历二维列表
for i, row in enumerate(matrix):
    for j, element in enumerate(row):
        print(f"matrix[{i}][{j}] = {element}")

# 嵌套循环 - 查找元素
def find_in_matrix(matrix, target):
    for i, row in enumerate(matrix):
        for j, element in enumerate(row):
            if element == target:
                return (i, j)
    return None

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(find_in_matrix(matrix, 5))  # (1, 1)

# 嵌套循环 - 打印图案
# 直角三角形
for i in range(1, 6):
    for j in range(i):
        print("*", end="")
    print()
# 输出：
# *
# **
# ***
# ****
# *****

# 倒直角三角形
for i in range(5, 0, -1):
    for j in range(i):
        print("*", end="")
    print()
# 输出：
# *****
# ****
# ***
# **
# *
```

## 推导式

### 列表推导式

```python
# 基本语法：[expression for item in iterable]
numbers = [1, 2, 3, 4, 5]

# 创建平方列表
squares = [x ** 2 for x in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# 带条件的列表推导式
# 只保留偶数
evens = [x for x in numbers if x % 2 == 0]
print(evens)  # [2, 4]

# 带条件表达式的推导式
# 偶数平方，奇数立方
result = [x ** 2 if x % 2 == 0 else x ** 3 for x in numbers]
print(result)  # [1, 4, 27, 16, 125]

# 嵌套列表推导式 - 展平二维列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [element for row in matrix for element in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 等价于：
flattened = []
for row in matrix:
    for element in row:
        flattened.append(element)

# 嵌套循环的列表推导式
pairs = [(x, y) for x in range(3) for y in range(3)]
print(pairs)
# [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]

# 实际应用：处理字符串列表
words = ["hello", "world", "python"]
upper_words = [word.upper() for word in words]
print(upper_words)  # ['HELLO', 'WORLD', 'PYTHON']

# 过滤并转换
scores = [85, 92, 78, 95, 88, 60]
passed = [f"及格:{score}" for score in scores if score >= 60]
print(passed)  # ['及格:85', '及格:92', '及格:78', '及格:95', '及格:88', '及格:60']
```

### 字典推导式

```python
# 基本语法：{key_expr: value_expr for item in iterable}
# 创建平方字典
numbers = [1, 2, 3, 4, 5]
squares_dict = {x: x ** 2 for x in numbers}
print(squares_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 从两个列表创建字典
keys = ['name', 'age', 'city']
values = ['张三', 25, '北京']
person = {k: v for k, v in zip(keys, values)}
print(person)  # {'name': '张三', 'age': 25, 'city': '北京'}

# 带条件的字典推导式
scores = {'张三': 85, '李四': 92, '王五': 58, '赵六': 78}
passed = {name: score for name, score in scores.items() if score >= 60}
print(passed)  # {'张三': 85, '李四': 92, '赵六': 78}

# 交换键值
original = {'a': 1, 'b': 2, 'c': 3}
swapped = {v: k for k, v in original.items()}
print(swapped)  # {1: 'a', 2: 'b', 3: 'c'}

# 转换值
prices = {'apple': 5, 'banana': 3, 'orange': 4}
discounted = {fruit: price * 0.8 for fruit, price in prices.items()}
print(discounted)  # {'apple': 4.0, 'banana': 2.4, 'orange': 3.2}

# 实际应用：统计字符出现次数
text = "hello world"
char_count = {char: text.count(char) for char in set(text) if char != ' '}
print(char_count)  # {'h': 1, 'e': 1, 'l': 3, 'o': 2, 'w': 1, 'r': 1, 'd': 1}
```

### 集合推导式

```python
# 基本语法：{expression for item in iterable}
# 创建平方集合
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique_squares = {x ** 2 for x in numbers}
print(unique_squares)  # {16, 1, 4, 9}（集合自动去重）

# 从字符串创建字符集合
text = "hello world"
chars = {char.upper() for char in text if char != ' '}
print(chars)  # {'H', 'E', 'L', 'O', 'W', 'R', 'D'}

# 带条件的集合推导式
numbers = range(10)
evens = {x for x in numbers if x % 2 == 0}
print(evens)  # {0, 2, 4, 6, 8}

# 过滤重复值
data = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = {x for x in data}
print(unique)  # {1, 2, 3, 4}

# 实际应用：提取唯一单词
sentence = "the quick brown fox jumps over the lazy dog"
words = sentence.split()
unique_words = {word.lower() for word in words}
print(unique_words)  # {'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog'}
```

### 生成器表达式

```python
# 生成器表达式 - 类似列表推导式，但使用圆括号
# 惰性计算，节省内存
numbers = range(1000000)

# 列表推导式 - 立即创建所有元素
squares_list = [x ** 2 for x in numbers]  # 占用大量内存

# 生成器表达式 - 按需生成
squares_gen = (x ** 2 for x in numbers)   # 几乎不占内存

print(type(squares_list))  # <class 'list'>
print(type(squares_gen))   # <class 'generator'>

# 使用生成器
for square in squares_gen:
    if square > 100:
        break
print("生成器可以按需迭代")

# 生成器只能迭代一次
gen = (x for x in range(5))
print(list(gen))  # [0, 1, 2, 3, 4]
print(list(gen))  # [] - 已经迭代完毕

# 实际应用：大数据处理
# 计算大文件的行数（不加载全部内容）
# line_count = sum(1 for line in open('large_file.txt'))

# 计算满足条件的元素个数
numbers = range(1, 101)
even_count = sum(1 for x in numbers if x % 2 == 0)
print(even_count)  # 50
```

---

## ⚠️ 注意事项和最佳实践

### 条件语句最佳实践

```python
# ✅ 好的做法：使用明确的布尔判断
name = "张三"

if name:  # 非空字符串为 True
    print(f"欢迎，{name}")

# ❌ 避免：不必要的比较
if name != "":
    print(f"欢迎，{name}")

# ✅ 好的做法：使用 in 检查多个值
day = "周六"

if day in ["周六", "周日"]:
    print("周末")

# ❌ 避免：重复的 or 条件
if day == "周六" or day == "周日":
    print("周末")

# ✅ 好的做法：提前返回，减少嵌套
def check_user(age, has_ticket):
    if age < 18:
        return "年龄不符合"
    if not has_ticket:
        return "需要购票"
    return "可以进入"

# ❌ 避免：深层嵌套
def check_user_bad(age, has_ticket):
    if age >= 18:
        if has_ticket:
            return "可以进入"
        else:
            return "需要购票"
    else:
        return "年龄不符合"
```

### 循环最佳实践

```python
# ✅ 好的做法：使用 enumerate 获取索引
items = ["a", "b", "c"]

for i, item in enumerate(items):
    print(f"{i}: {item}")

# ❌ 避免：使用 range(len())
for i in range(len(items)):
    print(f"{i}: {items[i]}")

# ✅ 好的做法：直接遍历元素
for item in items:
    print(item)

# ❌ 避免：不必要的索引
for i in range(len(items)):
    print(items[i])

# ✅ 好的做法：使用 zip 并行遍历
names = ["张三", "李四"]
ages = [25, 30]

for name, age in zip(names, ages):
    print(f"{name}: {age}岁")

# ❌ 避免：使用索引并行遍历
for i in range(len(names)):
    print(f"{names[i]}: {ages[i]}岁")

# ✅ 好的做法：使用推导式创建列表
squares = [x ** 2 for x in range(10)]

# ❌ 避免：用循环 append（效率较低）
squares = []
for x in range(10):
    squares.append(x ** 2)
```

---

## 🐛 常见错误示例

### 条件语句常见错误

```python
# ❌ 错误：使用赋值运算符 = 而非比较运算符 ==
x = 5

if x = 10:  # SyntaxError
    print("x is 10")

# ✅ 正确
if x == 10:
    print("x is 10")

# ❌ 错误：忘记冒号
if x > 0  # SyntaxError
    print("正数")

# ✅ 正确
if x > 0:
    print("正数")

# ❌ 错误：缩进不一致
if x > 0:
    print("正数")
  print("这行缩进错误")  # IndentationError

# ✅ 正确
if x > 0:
    print("正数")
    print("缩进一致")

# ❌ 错误：条件判断顺序错误
score = 85

if score >= 60:
    print("及格")
elif score >= 80:
    print("良好")  # 永远不会执行

# ✅ 正确：从严格条件开始
if score >= 80:
    print("良好")
elif score >= 60:
    print("及格")

# ❌ 错误：使用 == 比较浮点数
x = 0.1 + 0.2

if x == 0.3:  # False，因为浮点数精度问题
    print("等于 0.3")

# ✅ 正确：使用容差比较
tolerance = 1e-9

if abs(x - 0.3) < tolerance:
    print("约等于 0.3")
```

### 循环常见错误

```python
# ❌ 错误：无限循环
count = 0

while count < 5:
    print(count)
    # 忘记更新 count，导致无限循环

# ✅ 正确
count = 0

while count < 5:
    print(count)
    count += 1

# ❌ 错误：在遍历时修改列表
numbers = [1, 2, 3, 4, 5]

for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # 危险！可能跳过元素

# ✅ 正确：使用列表推导式或复制
numbers = [1, 2, 3, 4, 5]
numbers = [num for num in numbers if num % 2 != 0]

# 或者遍历副本
numbers = [1, 2, 3, 4, 5]

for num in numbers[:]:  # 遍历副本
    if num % 2 == 0:
        numbers.remove(num)

# ❌ 错误：range 范围理解错误
for i in range(5):
    print(i)  # 输出 0, 1, 2, 3, 4（不包括 5）

# ❌ 错误：以为 range(5) 是 1-5
for i in range(1, 6):  # 这才是 1-5
    print(i)

# ❌ 错误：在 for 循环中修改循环变量
for i in range(5):
    print(i)
    i = 10  # 无效！下次迭代 i 会被重置

# ❌ 错误：混淆 break 和 continue
for i in range(5):
    if i == 2:
        break  # 退出整个循环
    print(i)
# 输出：0 1

for i in range(5):
    if i == 2:
        continue  # 跳过本次迭代
    print(i)
# 输出：0 1 3 4
```

### 推导式常见错误

```python
# ❌ 错误：推导式过于复杂
result = [x ** 2 if x % 2 == 0 else x ** 3 if x > 0 else -x for x in range(-5, 6) if x != 0]
# 难以阅读和维护

# ✅ 正确：复杂逻辑使用普通循环
result = []
for x in range(-5, 6):
    if x == 0:
        continue
    if x % 2 == 0:
        result.append(x ** 2)
    elif x > 0:
        result.append(x ** 3)
    else:
        result.append(-x)

# ❌ 错误：忘记方括号
squares = x ** 2 for x in range(5)  # SyntaxError

# ✅ 正确
squares = [x ** 2 for x in range(5)]

# ❌ 错误：在推导式中使用 print
[print(x) for x in range(5)]  # 创建了 [None, None, None, None, None] 列表

# ✅ 正确：直接使用循环
for x in range(5):
    print(x)

# ❌ 错误：生成器表达式只能迭代一次
gen = (x for x in range(5))
print(list(gen))  # [0, 1, 2, 3, 4]
print(list(gen))  # [] - 已经耗尽

# ✅ 正确：需要多次使用时创建列表
lst = [x for x in range(5)]
print(lst)  # [0, 1, 2, 3, 4]
print(lst)  # [0, 1, 2, 3, 4]
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch04_control_flow) 完成以下任务：

1. **奇偶判断** - 用 if 语句判断一个数的奇偶性
2. **FizzBuzz** - 经典编程题：打印 1-15 的 FizzBuzz
3. **质数判断** - 判断一个数是否为质数
4. **九九乘法表** - 使用嵌套循环打印九九乘法表
5. **列表推导式练习** - 使用推导式过滤和转换数据
6. **猜数字游戏** - 使用 while 循环实现猜数字游戏

---

**[下一章预告]** → 函数：封装代码，提高复用性