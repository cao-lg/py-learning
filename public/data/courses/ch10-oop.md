# 面向对象编程

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>面向对象编程（OOP）是一种组织代码的方式，通过"类"和"对象"来抽象和模拟现实世界。</p>
</div>

## 类和对象

```python
# 定义类
class Person:
    # 类属性
    species = "Human"
    
    # 构造函数
    def __init__(self, name, age):
        self.name = name    # 实例属性
        self.age = age
    
    # 实例方法
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    # 魔术方法
    def __str__(self):
        return f"Person({self.name}, {self.age})"

# 创建对象
alice = Person("Alice", 20)
bob = Person("Bob", 25)

print(alice.greet())        # "Hello, I'm Alice"
print(alice.species)        # "Human"
print(alice)                # "Person(Alice, 20)"
```

## 继承

```python
# 子类继承父类
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)  # 调用父类构造函数
        self.grade = grade
    
    # 重写方法
    def greet(self):
        return f"Hi, I'm {self.name}, grade {self.grade}"

student = Student("Tom", 15, "A")
print(student.greet())  # "Hi, I'm Tom, grade A"
```

## 多态

```python
def introduce(person):
    print(person.greet())

introduce(alice)    # "Hello, I'm Alice"
introduce(student)   # "Hi, I'm Tom, grade A"
```

## 访问控制

```python
class BankAccount:
    def __init__(self, balance):
        self._balance = balance    # 受保护属性（约定）
        self.__pin = "1234"       # 私有属性（名称改写）
    
    def get_balance(self):
        return self._balance
    
    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
            return True
        return False

account = BankAccount(1000)
print(account.get_balance())  # 1000
# print(account._balance)    # 可以访问，但不推荐
# print(account.__pin)       # 报错，私有属性不能直接访问
```

## 魔术方法

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):      # 加法 +
        return Vector(self.x + other.x, self.y + other.y)
    
    def __str__(self):             # 字符串表示
        return f"Vector({self.x}, {self.y})"
    
    def __len__(self):             # len()
        return 2
    
    def __getitem__(self, index):  # 索引访问 []
        if index == 0:
            return self.x
        return self.y

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2
print(v3)        # "Vector(4, 6)"
print(len(v3))   # 2
print(v3[0])     # 4
```

## 类方法 vs 静态方法

```python
class Math:
    @classmethod
    def double(cls, x):
        """类方法，可以访问类属性"""
        return x * 2
    
    @staticmethod
    def add(a, b):
        """静态方法，与类无关的独立函数"""
        return a + b

print(Math.double(5))    # 10
print(Math.add(3, 4))    # 7
```

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch10_oop) 完成以下任务：

1. **创建类** - 定义一个表示矩形的类
2. **继承应用** - 创建学生类继承人类
3. **魔术方法** - 实现向量的加法和比较

---

## 🎉 课程完成！

恭喜你完成了 Python 基础系列课程的学习！

| 章节 | 主题 | 状态 |
|------|------|------|
| 1 | Python 简介 | ✅ |
| 2 | 变量和数据类型 | ✅ |
| 3 | 运算符 | ✅ |
| 4 | 控制流 | ✅ |
| 5 | 函数 | ✅ |
| 6 | 数据结构 | ✅ |
| 7 | 字符串处理 | ✅ |
| 8 | 文件操作 | ✅ |
| 9 | 异常处理 | ✅ |
| 10 | 面向对象编程 | ✅ |

> 🚀 **下一步**：开始做练习题，巩固所学知识！
