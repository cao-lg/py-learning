# 运算符

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>运算符用于对数据进行各种运算。本章将介绍算术、比较、逻辑和赋值运算符。</p>
</div>

## 算术运算符

```python
a, b = 10, 3

print(a + b)   # 13  加法
print(a - b)   # 7   减法
print(a * b)   # 30  乘法
print(a / b)   # 3.3333333333333335  除法
print(a // b)  # 3   整除（向下取整）
print(a % b)   # 1   取模（余数）
print(a ** b)  # 1000 幂运算（10的3次方）
```

## 比较运算符

返回布尔值 `True` 或 `False`：

```python
x, y = 5, 10

print(x == y)  # False  等于
print(x != y)  # True   不等于
print(x < y)   # True   小于
print(x > y)   # False  大于
print(x <= y)  # True   小于等于
print(x >= y)  # False  大于等于
```

## 逻辑运算符

```python
a, b = True, False

print(a and b)  # False  逻辑与（两者都为 True 才为 True）
print(a or b)   # True   逻辑或（至少一个为 True 就为 True）
print(not a)    # False  逻辑非（取反）
```

## 赋值运算符

```python
x = 10

x += 5    # x = x + 5  → 15
x -= 3    # x = x - 3  → 12
x *= 2    # x = x * 2  → 24
x /= 4    # x = x / 4  → 6.0
x //= 2   # x = x // 2 → 3.0
x %= 2    # x = x % 2  → 1.0
```

## 运算符优先级

```
优先级从高到低：
1. ()         括号
2. **         幂运算
3. * / // %   乘、除、整除、取模
4. + -        加、减
5. < <= > >=  比较运算符
6. == !=      等于、不等于
7. =          赋值运算符
```

```python
# 优先级示例
result = 2 + 3 * 4      # 14 (先算乘法)
result = (2 + 3) * 4   # 20 (先算括号)
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch03_operators) 完成以下任务：

1. **算术运算** - 计算并输出 `15 * 7 + 23`
2. **比较运算** - 判断 `100 > 50 and 100 < 200` 的结果
3. **闰年判断** - 用运算符判断某年份是否为闰年

---

**[下一章预告]** → 控制流：条件语句和循环
