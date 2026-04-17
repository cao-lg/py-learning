# 函数

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>函数是组织代码的基本单元，可以提高代码的复用性和可读性。</p>
</div>

## 定义和调用函数

```python
# 定义函数
def greet():
    print("Hello!")

# 调用函数
greet()  # 输出: Hello!

# 带参数的函数
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # 输出: Hello, Alice!
```

## 返回值

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)  # 8
```

## 默认参数

```python
def greet(name="World"):
    print(f"Hello, {name}!")

greet()         # Hello, World!
greet("Alice")  # Hello, Alice!
```

## 可变参数 *args 和 **kwargs

```python
# *args - 接收任意数量的位置参数
def sum_all(*numbers):
    total = 0
    for n in numbers:
        total += n
    return total

print(sum_all(1, 2, 3))      # 6
print(sum_all(1, 2, 3, 4, 5)) # 15

# **kwargs - 接收任意数量的关键字参数
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=20, city="Beijing")
```

## Lambda 表达式

```python
# 普通函数
def square(x):
    return x ** 2

# Lambda 表达式
square = lambda x: x ** 2
print(square(5))  # 25

# 与 map、filter 结合
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch05_functions) 完成以下任务：

1. **定义函数** - 创建一个计算阶乘的函数
2. **递归函数** - 用递归实现斐波那契数列
3. **Lambda 应用** - 使用 lambda 和 map 处理数据

---

**[下一章预告]** → 数据结构：列表、元组、字典、集合
