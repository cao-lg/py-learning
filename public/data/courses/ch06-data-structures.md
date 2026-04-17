# 数据结构

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>Python 提供了四种内置数据结构：列表、元组、字典和集合，用于组织和存储数据。</p>
</div>

## 列表 (List)

列表是**可变**的有序序列：

```python
# 创建列表
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]

# 索引和切片
fruits[0]     # "苹果"（第一个元素）
fruits[-1]    # "橙子"（最后一个元素）
fruits[1:3]   # ["香蕉", "橙子"]（切片）

# 修改列表
fruits.append("葡萄")    # 末尾添加
fruits.insert(1, "梨")  # 指定位置插入
fruits.remove("香蕉")    # 删除元素
popped = fruits.pop()    # 弹出并返回最后一个元素

# 列表操作
len(fruits)    # 长度
sorted(fruits) # 排序（返回新列表）
fruits.sort() # 原地排序
```

## 元组 (Tuple)

元组是**不可变**的有序序列：

```python
# 创建元组
point = (3, 4)
colors = ("红", "绿", "蓝")

# 不可修改
# point[0] = 5  # 会报错！

# 元组解包
x, y = point
print(f"x={x}, y={y}")  # x=3, y=4
```

## 字典 (Dict)

字典存储**键值对**：

```python
# 创建字典
person = {
    "name": "Alice",
    "age": 20,
    "city": "Beijing"
}

# 访问和修改
print(person["name"])     # "Alice"
person["age"] = 21       # 修改值
person["email"] = "a@b.com"  # 添加新键值对

# 字典方法
person.keys()    # 所有键
person.values()  # 所有值
person.items()   # 所有键值对
person.get("name")     # 安全获取（不存在返回 None）
person.get("gender", "未知")  # 默认值
```

## 集合 (Set)

集合是**无序不重复**的元素集合：

```python
# 创建集合
colors = {"红", "绿", "蓝"}
nums = {1, 2, 3, 2, 1}  # 自动去重：{1, 2, 3}

# 集合操作
colors.add("黄")     # 添加元素
colors.remove("红")  # 删除元素（不存在会报错）
colors.discard("紫") # 删除（不存在不报错）

# 数学运算
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)   # {1, 2, 3, 4}  并集
print(a & b)   # {2, 3}         交集
print(a - b)   # {1}             差集
print(a ^ b)   # {1, 4}         对称差集
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch06_data_structures) 完成以下任务：

1. **列表操作** - 列表的增删改查
2. **字典应用** - 用字典统计词频
3. **集合运算** - 求两个集合的交集和并集

---

**[下一章预告]** → 字符串处理：字符串的常用操作和方法
