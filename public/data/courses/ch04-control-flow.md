# 控制流

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>控制流决定程序执行的顺序。本章介绍条件语句（if-elif-else）和循环语句（for、while）。</p>
</div>

## 条件语句 if-elif-else

```python
# 基础语法
age = 18

if age >= 18:
    print("已成年")
else:
    print("未成年")

# 多条件判断
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")    # 这个会被执行
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

## 嵌套条件

```python
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("可以进入")
    else:
        print("需要购票")
else:
    print("年龄不符合")
```

## 循环语句

### for 循环

```python
# 遍历列表
fruits = ["苹果", "香蕉", "橙子"]

for fruit in fruits:
    print(fruit)

# 遍历数字 range()
for i in range(5):       # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):    # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2): # 0, 2, 4, 6, 8 (步长为2)
    print(i)
```

### while 循环

```python
count = 0

while count < 5:
    print(count)
    count += 1
```

## break 和 continue

```python
# break - 提前退出循环
for i in range(10):
    if i == 5:
        break    # 当 i 等于 5 时退出循环
    print(i)    # 输出 0, 1, 2, 3, 4

# continue - 跳过当前迭代
for i in range(5):
    if i == 2:
        continue  # 跳过 i == 2 的情况
    print(i)      # 输出 0, 1, 3, 4
```

## 循环 else 子句

```python
# 循环正常结束时会执行 else
for i in range(3):
    print(i)
else:
    print("循环正常结束")  # 会执行

# break 退出时不执行 else
for i in range(3):
    if i == 1:
        break
    print(i)
else:
    print("不会执行")
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch04_control_flow) 完成以下任务：

1. **奇偶判断** - 用 if 语句判断一个数的奇偶性
2. **FizzBuzz** - 经典编程题：打印 1-15 的 FizzBuzz
3. **质数判断** - 判断一个数是否为质数

---

**[下一章预告]** → 函数：封装代码，提高复用性
