# 运算符

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>运算符用于对数据进行各种运算。本章将详细介绍算术、比较、逻辑、位运算、身份、成员运算符，以及运算符优先级、三元运算符、Walrus运算符等重要知识点。</p>
</div>

## 算术运算符

算术运算符用于执行数学运算。

```python
a, b = 10, 3

print(a + b)   # 13  加法
print(a - b)   # 7   减法
print(a * b)   # 30  乘法
print(a / b)   # 3.3333333333333335  除法（结果总是浮点数）
print(a // b)  # 3   整除（向下取整）
print(a % b)   # 1   取模（余数）
print(a ** b)  # 1000 幂运算（10的3次方）
```

### 整除运算符详解

整除运算符 `//` 会向下取整（向负无穷方向）：

```python
# 正数整除
print(10 // 3)   # 3
print(7 // 2)    # 3

# 负数整除（注意向下取整）
print(-10 // 3)  # -4（不是-3，因为-3.33...向下取整是-4）
print(10 // -3)  # -4
print(-10 // -3) # 3

# 与 int() 函数的区别
print(int(-3.7))   # -3（向零取整）
print(-10 // 3)     # -4（向下取整）
```

### 取模运算符详解

取模运算符 `%` 返回除法的余数，结果的符号与除数相同：

```python
print(10 % 3)   # 1
print(-10 % 3)  # 2（余数符号与除数相同）
print(10 % -3)  # -2

# 判断奇偶数
num = 7
if num % 2 == 0:
    print("偶数")
else:
    print("奇数")  # 输出：奇数
```

### 幂运算符详解

```python
# 正整数幂
print(2 ** 10)   # 1024

# 负指数
print(2 ** -1)   # 0.5（即 1/2）
print(4 ** -2)   # 0.0625（即 1/16）

# 分数指数（开方）
print(9 ** 0.5)  # 3.0（即 √9）
print(8 ** (1/3))  # 2.0（即 ∛8）

# 负数的幂
print((-2) ** 3)  # -8
print((-2) ** 2)  # 4
```

### 一元运算符

```python
x = 5
print(-x)   # -5（负号）
print(+x)   # 5（正号，通常省略）
```

---

## 比较运算符

比较运算符用于比较两个值，返回布尔值 `True` 或 `False`。

```python
x, y = 5, 10

print(x == y)  # False  等于
print(x != y)  # True   不等于
print(x < y)   # True   小于
print(x > y)   # False  大于
print(x <= y)  # True   小于等于
print(x >= y)  # False  大于等于
```

### 链式比较

Python 支持链式比较，使代码更简洁：

```python
x = 5

# 链式比较
print(1 < x < 10)    # True（等价于 1 < x and x < 10）
print(1 < x <= 5)    # True
print(0 <= x <= 10)  # True

# 多个比较
a, b, c = 1, 2, 3
print(a < b < c)     # True
print(a < b > c)     # False（等价于 a < b and b > c）

# 实际应用：检查数值范围
age = 25
if 18 <= age <= 60:
    print("适龄工作人口")
```

### 不同类型的比较

```python
# 数值类型可以相互比较
print(5 == 5.0)      # True
print(5 < 5.1)       # True

# 字符串比较（按字典序）
print('apple' < 'banana')  # True
print('Apple' < 'apple')   # True（大写字母ASCII码更小）

# None 的比较
x = None
print(x is None)    # True（推荐使用 is 而非 ==）
print(x == None)    # True（不推荐）
```

---

## 逻辑运算符

逻辑运算符用于组合布尔表达式。

```python
a, b = True, False

print(a and b)  # False  逻辑与（两者都为 True 才为 True）
print(a or b)   # True   逻辑或（至少一个为 True 就为 True）
print(not a)    # False  逻辑非（取反）
```

### 短路求值详解

Python 的 `and` 和 `or` 运算符具有短路求值特性：

**`and` 短路求值**：如果第一个操作数为假，则不会计算第二个操作数。

```python
# and 短路：第一个为 False，直接返回第一个值
print(False and print("不会执行"))   # False
print(0 and "hello")                 # 0
print("" and [1, 2, 3])              # ''（空字符串）

# and 正常执行：第一个为 True，返回第二个值
print(True and "hello")              # "hello"
print(5 and 10)                      # 10
```

**`or` 短路求值**：如果第一个操作数为真，则不会计算第二个操作数。

```python
# or 短路：第一个为 True，直接返回第一个值
print(True or print("不会执行"))    # True
print("hello" or "world")          # "hello"
print([1, 2] or [])                 # [1, 2]

# or 正常执行：第一个为 False，返回第二个值
print(False or "hello")             # "hello"
print(0 or 100)                     # 100
print(None or "默认值")              # "默认值"
```

### 短路求值的实际应用

```python
# 1. 提供默认值
name = input("请输入姓名：") or "匿名用户"
print(f"你好，{name}")

# 2. 安全访问（避免空值错误）
data = None
result = data and data.get("key")  # 如果 data 为 None，不会调用 get
print(result)  # None

# 3. 条件检查优化
user = None
# 如果 user 为 None，不会执行 user.is_admin，避免报错
if user and user.is_admin:
    print("管理员权限")

# 4. 链式默认值
value = None or False or 0 or "最终默认值"
print(value)  # "最终默认值"
```

### 逻辑运算符的返回值

逻辑运算符返回的是决定结果的那个值，而不一定是布尔值：

```python
# and 返回第一个为假的值，或最后一个值
print(3 and 5)      # 5（都为真，返回最后一个）
print(0 and 5)      # 0（第一个为假，返回它）
print(3 and 0)      # 0（第二个为假，返回它）

# or 返回第一个为真的值，或最后一个值
print(0 or 5)       # 5（第一个为假，返回第二个）
print(3 or 5)       # 3（第一个为真，返回它）
print(0 or "" or None)  # None（都为假，返回最后一个）
```

### 布尔上下文中的值

在布尔上下文中，以下值被视为 `False`（假值/Falsy）：

```python
# Falsy 值
falsy_values = [False, None, 0, 0.0, 0j, '', "", (), [], {}, set(), range(0)]

for val in falsy_values:
    print(f"{repr(val)} -> {bool(val)}")

# Truthy 值（除了 Falsy 以外的所有值）
truthy_values = [True, 1, -1, 0.1, "hello", [0], (0,), {"a": 1}]
```

---

## 位运算符

位运算符对整数的二进制位进行操作。

```python
a, b = 60, 13  # 60 = 0011 1100, 13 = 0000 1101

print(a & b)   # 12  按位与（AND）：0000 1100
print(a | b)   # 61  按位或（OR）：0011 1101
print(a ^ b)   # 49  按位异或（XOR）：0011 0001
print(~a)      # -61 按位取反（NOT）：1100 0011（补码表示）
print(a << 2)  # 240 左移：1111 0000（相当于乘以 2^2 = 4）
print(a >> 2)  # 15  右移：0000 1111（相当于除以 2^2 = 4）
```

### 位运算详解

```python
# 按位与（AND）：两位都为1才为1
print(5 & 3)   # 1  (101 & 011 = 001)

# 按位或（OR）：有一位为1就为1
print(5 | 3)   # 7  (101 | 011 = 111)

# 按位异或（XOR）：两位不同为1，相同为0
print(5 ^ 3)   # 6  (101 ^ 011 = 110)

# 按位取反（NOT）：0变1，1变0
print(~5)      # -6（注意：Python使用补码表示负数）

# 左移：相当于乘以 2^n
print(5 << 1)  # 10 (5 * 2)
print(5 << 2)  # 20 (5 * 4)

# 右移：相当于除以 2^n（向下取整）
print(20 >> 1) # 10 (20 // 2)
print(20 >> 2) # 5  (20 // 4)
```

### 位运算的实际应用

```python
# 1. 快速判断奇偶数
num = 7
if num & 1:
    print("奇数")
else:
    print("偶数")

# 2. 交换两个数（不使用临时变量）
a, b = 5, 3
a ^= b
b ^= a
a ^= b
print(a, b)  # 3 5

# 3. 权限标志位
READ = 1      # 001
WRITE = 2     # 010
EXECUTE = 4   # 100

permission = READ | WRITE  # 011
print(permission & READ)     # 1（有读权限）
print(permission & EXECUTE)   # 0（无执行权限）

# 4. 快速乘除
n = 100
print(n << 1)   # 200（乘以2）
print(n >> 1)   # 50（除以2）
```

---

## 身份运算符

身份运算符用于比较两个对象的内存地址。

```python
a = [1, 2, 3]
b = [1, 2, 3]
c = a

# is：判断是否是同一个对象（内存地址相同）
print(a is c)      # True（c 引用 a 指向的对象）
print(a is b)      # False（b 是新列表，内存地址不同）

# is not：判断是否不是同一个对象
print(a is not b)  # True

# == 与 is 的区别
print(a == b)      # True（值相等）
print(a is b)      # False（不是同一个对象）
```

### is 与 == 的区别

```python
# == 比较值是否相等
# is 比较是否是同一个对象（内存地址）

# 小整数缓存（-5 到 256）
x = 256
y = 256
print(x is y)      # True（小整数被缓存）

x = 257
y = 257
print(x is y)      # 可能是 False（超出缓存范围）

# 字符串缓存
s1 = "hello"
s2 = "hello"
print(s1 is s2)    # True（字符串常量被缓存）

s3 = "hello" * 1000
s4 = "hello" * 1000
print(s3 is s4)    # 可能是 False（长字符串可能不被缓存）

# None 的比较（推荐使用 is）
x = None
if x is None:      # 推荐
    print("x 是 None")
if x == None:      # 不推荐
    print("x 是 None")
```

### 身份运算符的最佳实践

```python
# 1. 检查 None 时使用 is
def find_item(lst, target):
    result = None
    for item in lst:
        if item == target:
            result = item
            break
    if result is None:
        return "未找到"
    return result

# 2. 检查布尔值时使用 is（可选，但更明确）
flag = True
if flag is True:    # 明确检查 True
    print("flag 是 True")

# 3. 检查哨兵值
_sentinel = object()

def process(value=_sentinel):
    if value is _sentinel:
        print("未提供参数")
    else:
        print(f"处理: {value}")
```

---

## 成员运算符

成员运算符用于判断一个值是否在序列中。

```python
fruits = ['apple', 'banana', 'orange']

# in：判断是否在序列中
print('apple' in fruits)      # True
print('grape' in fruits)      # False

# not in：判断是否不在序列中
print('grape' not in fruits)  # True
print('apple' not in fruits)  # False
```

### 不同类型的成员运算

```python
# 列表
numbers = [1, 2, 3, 4, 5]
print(3 in numbers)          # True

# 元组
coordinates = (10, 20)
print(10 in coordinates)      # True

# 字符串
text = "Hello, Python!"
print("Python" in text)      # True
print("python" in text)       # False（区分大小写）

# 字典（检查键）
person = {'name': 'Alice', 'age': 25}
print('name' in person)       # True（检查键）
print('Alice' in person)      # False（不检查值）
print('Alice' in person.values())  # True（检查值）

# 集合
colors = {'red', 'green', 'blue'}
print('red' in colors)        # True

# range
print(5 in range(10))         # True
print(15 in range(10))        # False
```

### 成员运算符的性能

```python
# 列表：O(n) 时间复杂度
large_list = list(range(100000))
# 99999 in large_list  # 较慢，需要遍历

# 集合：O(1) 时间复杂度
large_set = set(range(100000))
# 99999 in large_set   # 非常快，哈希查找

# 性能对比
import time

def test_membership(container, value):
    start = time.time()
    for _ in range(10000):
        _ = value in container
    return time.time() - start

lst = list(range(10000))
st = set(range(10000))

# print(f"列表查找: {test_membership(lst, 9999):.4f}秒")
# print(f"集合查找: {test_membership(st, 9999):.4f}秒")
```

---

## 赋值运算符

### 基本赋值

```python
x = 10        # 基本赋值
a = b = c = 0 # 多重赋值（同一对象）
x, y, z = 1, 2, 3  # 解包赋值
```

### 复合赋值运算符

```python
x = 10

x += 5    # x = x + 5  → 15
x -= 3    # x = x - 3  → 12
x *= 2    # x = x * 2  → 24
x /= 4    # x = x / 4  → 6.0
x //= 2   # x = x // 2 → 3.0
x %= 2    # x = x % 2  → 1.0
x **= 3   # x = x ** 3 → 1.0

# 位运算复合赋值
y = 60
y &= 13   # y = y & 13
y |= 13   # y = y | 13
y ^= 13   # y = y ^ 13
y <<= 2   # y = y << 2
y >>= 2   # y = y >> 2
```

### 解包赋值详解

```python
# 列表解包
numbers = [1, 2, 3]
a, b, c = numbers
print(a, b, c)  # 1 2 3

# 元组解包
point = (10, 20)
x, y = point
print(x, y)  # 10 20

# 扩展解包（使用 *）
first, *rest = [1, 2, 3, 4, 5]
print(first)  # 1
print(rest)   # [2, 3, 4, 5]

*beginning, last = [1, 2, 3, 4, 5]
print(beginning)  # [1, 2, 3, 4]
print(last)       # 5

first, *middle, last = [1, 2, 3, 4, 5]
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5

# 字典解包（解包键）
person = {'name': 'Alice', 'age': 25}
key1, key2 = person
print(key1, key2)  # name age

# 嵌套解包
nested = [(1, 2), (3, 4)]
(a, b), (c, d) = nested
print(a, b, c, d)  # 1 2 3 4
```

### 海象运算符（Walrus Operator `:=`）

Python 3.8+ 引入的海象运算符允许在表达式内部进行赋值：

```python
# 基本语法
if (n := 10) > 5:
    print(f"n = {n}，大于5")
# 输出：n = 10，大于5
```

#### 海象运算符的实际应用

```python
# 1. 在 while 循环中使用
lines = ['第一行', '第二行', '第三行']
i = 0
while (i := i + 1) <= len(lines):
    if i <= len(lines):
        print(f"{i}: {lines[i-1]}")

# 2. 简化列表推导
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 不使用海象运算符
filtered = [x for x in data if x * 2 > 10]
doubled = [x * 2 for x in data if x * 2 > 10]

# 使用海象运算符（避免重复计算）
filtered = [d for x in data if (d := x * 2) > 10]
print(filtered)  # [12, 14, 16, 18, 20]

# 3. 读取文件时的使用
# with open('data.txt') as f:
#     while (line := f.readline()) != '':
#         process(line)

# 4. 在条件表达式中复用计算结果
import re
text = "Hello, Python!"

# 不使用海象运算符
match = re.search(r'Python', text)
if match:
    print(f"找到: {match.group()}")

# 使用海象运算符
if match := re.search(r'Python', text):
    print(f"找到: {match.group()}")

# 5. 处理用户输入
# while (user_input := input("请输入(q退出): ")) != 'q':
#     print(f"你输入了: {user_input}")
```

#### 海象运算符注意事项

```python
# 1. 海象运算符需要括号来明确优先级
nums = [1, 2, 3]
# 错误：nums_len := len(nums)  # 语法错误
nums_len = len(nums)  # 正确：普通赋值
if (n := len(nums)) > 2:  # 正确：在表达式中使用
    print(f"列表有 {n} 个元素")

# 2. 海象运算符创建的变量在作用域外也可用
if (x := 10) > 5:
    pass
print(x)  # 10（变量仍然存在）

# 3. 不能用于属性赋值
# obj.attr := value  # 语法错误
```

---

## 三元运算符（条件表达式）

Python 的三元运算符语法：`value_if_true if condition else value_if_false`

```python
age = 20

# 基本用法
status = "成年" if age >= 18 else "未成年"
print(status)  # 成年

# 等价于
if age >= 18:
    status = "成年"
else:
    status = "未成年"
```

### 三元运算符详解

```python
# 1. 简单条件
x, y = 10, 20
max_value = x if x > y else y
print(max_value)  # 20

# 2. 嵌套三元运算符（不推荐，可读性差）
score = 85
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D"
print(grade)  # B

# 更好的写法：使用 if-elif-else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"

# 3. 在函数调用中使用
def get_discount(is_member):
    return 0.9 if is_member else 1.0

price = 100
final_price = price * get_discount(True)
print(final_price)  # 90.0

# 4. 在列表推导中使用
numbers = [1, 2, 3, 4, 5]
labels = ["偶数" if n % 2 == 0 else "奇数" for n in numbers]
print(labels)  # ['奇数', '偶数', '奇数', '偶数', '奇数']

# 5. 处理可能为 None 的值
name = None
display_name = name if name is not None else "匿名"
print(display_name)  # 匿名

# 或使用 or 运算符（注意 Falsy 值）
name = ""
display_name = name or "匿名"  # 空字符串也会使用默认值
print(display_name)  # 匿名
```

### 三元运算符与 and/or 的区别

```python
# 三元运算符更明确
result = "yes" if condition else "no"

# and/or 模拟三元（不推荐，容易出错）
result = condition and "yes" or "no"
# 问题：如果 "yes" 是假值，结果会出错

# 示例
flag = True
value = 0  # 假值

# 三元运算符（正确）
result1 = value if flag else "default"
print(result1)  # 0

# and/or 模拟（可能出错）
result2 = flag and value or "default"
print(result2)  # "default"（错误！因为 value 是假值）
```

---

## 运算符优先级

### 完整优先级列表（从高到低）

| 优先级 | 运算符 | 描述 |
|--------|--------|------|
| 1 | `()` | 括号（最高优先级） |
| 2 | `**` | 幂运算 |
| 3 | `+x`, `-x`, `~x` | 一元正号、负号、按位取反 |
| 4 | `*`, `/`, `//`, `%` | 乘、除、整除、取模 |
| 5 | `+`, `-` | 加、减 |
| 6 | `<<`, `>>` | 左移、右移 |
| 7 | `&` | 按位与 |
| 8 | `^` | 按位异或 |
| 9 | `\|` | 按位或 |
| 10 | `in`, `not in`, `is`, `is not`, `<`, `<=`, `>`, `>=`, `!=`, `==` | 比较运算符、身份运算符、成员运算符 |
| 11 | `not` | 逻辑非 |
| 12 | `and` | 逻辑与 |
| 13 | `or` | 逻辑或 |
| 14 | `if-else` | 条件表达式（三元运算符） |
| 15 | `:=` | 海象运算符 |
| 16 | `=`, `+=`, `-=`, `*=`, `/=`, `//=`, `%=`, `**=`, `&=`, `\|=`, `^=`, `<<=`, `>>=` | 赋值运算符（最低优先级） |

### 优先级示例

```python
# 1. 算术运算符优先级
result = 2 + 3 * 4       # 14（先乘后加）
result = (2 + 3) * 4     # 20（括号优先）
result = 2 ** 3 ** 2     # 512（幂运算从右向左结合）
result = (2 ** 3) ** 2   # 64

# 2. 比较运算符优先级
result = 1 < 2 < 3       # True（链式比较）
result = 1 < 2 and 2 < 3 # True（等价写法）

# 3. 逻辑运算符优先级
result = True or False and False   # True（and 优先于 or）
result = (True or False) and False # False

# 4. 位运算符优先级
result = 5 & 3 | 4       # 5（先 & 后 |）
result = 5 & (3 | 4)     # 4

# 5. 混合运算
result = 1 + 2 * 3 > 5 and True  # True
# 解析过程：
# 1. 2 * 3 = 6
# 2. 1 + 6 = 7
# 3. 7 > 5 = True
# 4. True and True = True

# 6. 三元运算符优先级
x = 5
result = x if x > 0 else -x  # 5
result = x + 1 if x > 0 else -x  # 6（三元运算符优先级低于算术）
result = (x + 1) if x > 0 else (-x)  # 更清晰的写法
```

### 结合性

```python
# 左结合（从左到右）
result = 10 - 5 - 2   # 3，等价于 (10 - 5) - 2
result = 10 / 5 / 2   # 1.0，等价于 (10 / 5) / 2

# 右结合（从右到左）
result = 2 ** 3 ** 2  # 512，等价于 2 ** (3 ** 2)
result = a = b = 5   # 从右向左赋值

# 比较运算符可以链式
result = 1 < 2 < 3   # True，等价于 1 < 2 and 2 < 3
```

---

## 注意事项和最佳实践

### 1. 浮点数精度问题

```python
# 浮点数比较可能出错
a = 0.1 + 0.2
print(a)           # 0.30000000000000004
print(a == 0.3)    # False！

# 解决方案：使用容差比较
tolerance = 1e-9
print(abs(a - 0.3) < tolerance)  # True

# 或使用 Decimal
from decimal import Decimal
a = Decimal('0.1') + Decimal('0.2')
print(a == Decimal('0.3'))  # True
```

### 2. 整除与负数

```python
# 整除向负无穷取整
print(-7 // 2)   # -4（不是 -3）
print(7 // -2)   # -4

# 取模结果符号与除数相同
print(-7 % 2)    # 1
print(7 % -2)    # -1
```

### 3. is 与 == 的正确使用

```python
# ✅ 正确：使用 is 检查 None
if x is None:
    pass

# ❌ 错误：使用 == 检查 None（虽然结果正确，但不推荐）
if x == None:
    pass

# ✅ 正确：使用 == 比较值
if a == b:
    pass

# ❌ 错误：使用 is 比较值（可能出错）
if a is b:  # 只有在恰好是同一对象时才为 True
    pass
```

### 4. 短路求值的利用

```python
# ✅ 利用短路求值避免错误
data = None
if data and data.get('key'):
    print(data['key'])

# ❌ 不利用短路求值会报错
data = None
if data.get('key'):  # AttributeError: 'NoneType' object has no attribute 'get'
    print(data['key'])
```

### 5. 可变对象的默认参数

```python
# ❌ 错误：使用可变对象作为默认参数
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2]（不是预期的 [2]）

# ✅ 正确：使用 None 作为默认值
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

---

## 常见错误示例

### 1. 混淆 = 和 ==

```python
# ❌ 错误：在条件中使用 =
if x = 5:  # SyntaxError
    pass

# ✅ 正确：使用 ==
if x == 5:
    pass
```

### 2. 链式比较的误解

```python
# ❌ 错误理解
x = 5
print(x == 5 or 10)  # True（不是 10）
print(x == 5 and 10)  # 10（不是 True）

# ✅ 正确理解
# or 返回第一个真值
# and 返回第一个假值或最后一个值
```

### 3. 整数除法精度丢失

```python
# ❌ 错误：忘记整数除法
result = 5 / 2  # 2.5（浮点数）
result = 5 // 2  # 2（整数，丢失精度）

# ✅ 正确：根据需求选择
average = (a + b) / 2   # 需要小数
count = total // 10     # 需要整数
```

### 4. 位运算符优先级

```python
# ❌ 错误：忘记位运算符优先级
result = 5 & 3 + 1  # 1（先算 3+1=4，再算 5&4=4）
# 实际计算：5 & (3 + 1) = 5 & 4 = 4

# ✅ 正确：使用括号明确优先级
result = (5 & 3) + 1  # 2
```

### 5. 海象运算符语法错误

```python
# ❌ 错误：海象运算符需要括号
if n := 10 > 5:  # 语法错误
    pass

# ✅ 正确
if (n := 10) > 5:
    pass
```

### 6. 三元运算符嵌套过深

```python
# ❌ 错误：嵌套过深，难以阅读
result = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F"

# ✅ 正确：使用 if-elif-else
if score >= 90:
    result = "A"
elif score >= 80:
    result = "B"
elif score >= 70:
    result = "C"
elif score >= 60:
    result = "D"
else:
    result = "F"
```

### 7. 修改迭代中的列表

```python
# ❌ 错误：在迭代中修改列表
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # 可能跳过元素

# ✅ 正确：创建新列表或使用列表推导
numbers = [num for num in numbers if num % 2 != 0]
```

---

## 运算符速查表

### 算术运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `+` | 加法 | `5 + 3` | `8` |
| `-` | 减法 | `5 - 3` | `2` |
| `*` | 乘法 | `5 * 3` | `15` |
| `/` | 除法 | `5 / 2` | `2.5` |
| `//` | 整除 | `5 // 2` | `2` |
| `%` | 取模 | `5 % 2` | `1` |
| `**` | 幂运算 | `2 ** 3` | `8` |

### 比较运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `==` | 等于 | `5 == 5` | `True` |
| `!=` | 不等于 | `5 != 3` | `True` |
| `>` | 大于 | `5 > 3` | `True` |
| `<` | 小于 | `5 < 3` | `False` |
| `>=` | 大于等于 | `5 >= 5` | `True` |
| `<=` | 小于等于 | `5 <= 3` | `False` |

### 逻辑运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `and` | 逻辑与 | `True and False` | `False` |
| `or` | 逻辑或 | `True or False` | `True` |
| `not` | 逻辑非 | `not True` | `False` |

### 位运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `&` | 按位与 | `5 & 3` | `1` |
| `\|` | 按位或 | `5 \| 3` | `7` |
| `^` | 按位异或 | `5 ^ 3` | `6` |
| `~` | 按位取反 | `~5` | `-6` |
| `<<` | 左移 | `5 << 1` | `10` |
| `>>` | 右移 | `5 >> 1` | `2` |

### 身份运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `is` | 是同一对象 | `a is b` | `True/False` |
| `is not` | 不是同一对象 | `a is not b` | `True/False` |

### 成员运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `in` | 在序列中 | `'a' in 'abc'` | `True` |
| `not in` | 不在序列中 | `'d' not in 'abc'` | `True` |

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch03_operators) 完成以下任务：

1. **算术运算** - 计算并输出 `15 * 7 + 23`
2. **比较运算** - 判断 `100 > 50 and 100 < 200` 的结果
3. **闰年判断** - 用运算符判断某年份是否为闰年
4. **位运算** - 使用位运算判断一个数是否为 2 的幂
5. **三元运算符** - 使用三元运算符找出两个数中的较大值
6. **海象运算符** - 在列表推导中使用海象运算符避免重复计算

---

**[下一章预告]** → 控制流：条件语句和循环