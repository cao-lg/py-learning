# 面向对象编程

<div class="intro-card">
  <h3>📖 章节导学</h3>
  <p>面向对象编程（OOP）是一种组织代码的方式，通过"类"和"对象"来抽象和模拟现实世界。Python 是一门支持多范式的语言，面向对象是其核心特性之一。</p>
</div>

## 类和对象

### 类的定义和实例化

类是创建对象的蓝图，定义了一类对象共有的属性和方法。

```python
# 定义类
class Person:
    # 类属性（所有实例共享）
    species = "Human"
    count = 0
    
    # 构造函数（初始化方法）
    def __init__(self, name, age):
        # 实例属性（每个实例独有）
        self.name = name
        self.age = age
        Person.count += 1  # 统计创建的实例数量
    
    # 实例方法
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    # 魔术方法：字符串表示
    def __str__(self):
        return f"Person({self.name}, {self.age})"
    
    # 魔术方法：调试表示
    def __repr__(self):
        return f"Person(name='{self.name}', age={self.age})"

# 创建对象（实例化）
alice = Person("Alice", 20)
bob = Person("Bob", 25)

print(alice.greet())        # "Hello, I'm Alice"
print(alice.species)        # "Human"（类属性）
print(Person.species)       # "Human"（通过类名访问）
print(alice)                # "Person(Alice, 20)"（调用 __str__）
print(repr(alice))          # "Person(name='Alice', age=20)"（调用 __repr__）
print(f"创建了 {Person.count} 个实例")  # "创建了 2 个实例"
```

### 类属性 vs 实例属性

```python
class Student:
    # 类属性：所有实例共享
    school = "Python大学"
    total_students = 0
    
    def __init__(self, name, score):
        # 实例属性：每个实例独有
        self.name = name
        self.score = score
        Student.total_students += 1

s1 = Student("张三", 90)
s2 = Student("李四", 85)

print(s1.school)            # "Python大学"
print(s2.school)            # "Python大学"
print(Student.total_students)  # 2

# 修改类属性（影响所有实例）
Student.school = "清华大学"
print(s1.school)            # "清华大学"
print(s2.school)            # "清华大学"

# 通过实例修改（创建同名实例属性，不影响类属性）
s1.school = "北京大学"
print(s1.school)            # "北京大学"（实例属性）
print(s2.school)            # "清华大学"（类属性）
print(Student.school)       # "清华大学"（类属性未变）
```

### 注意事项：类属性和实例属性

```python
# ⚠️ 常见错误：可变类属性被意外修改
class MyClass:
    # 可变类属性（危险！）
    items = []
    
    def add_item(self, item):
        self.items.append(item)  # 修改的是类属性，不是实例属性

a = MyClass()
b = MyClass()
a.add_item("A")
print(a.items)  # ['A']
print(b.items)  # ['A']（b 也受影响！）

# ✅ 正确做法：在 __init__ 中初始化可变属性
class MyClass:
    def __init__(self):
        self.items = []  # 每个实例有自己的列表

a = MyClass()
b = MyClass()
a.items.append("A")
print(a.items)  # ['A']
print(b.items)  # []（b 不受影响）
```

---

## 构造函数和析构函数

### `__init__` 构造函数

```python
class Rectangle:
    """矩形类"""
    
    def __init__(self, width, height):
        """构造函数：初始化实例属性"""
        self.width = width
        self.height = height
        print(f"创建矩形: {width}x{height}")
    
    def area(self):
        return self.width * self.height

rect = Rectangle(5, 3)  # 自动调用 __init__
print(f"面积: {rect.area()}")
```

### `__new__` 创建实例

`__new__` 是真正的构造方法，在 `__init__` 之前调用。

```python
class Singleton:
    """单例模式示例"""
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        """控制实例创建过程"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            print("创建新实例")
        else:
            print("返回已有实例")
        return cls._instance
    
    def __init__(self, value):
        self.value = value

s1 = Singleton(1)  # 创建新实例
s2 = Singleton(2)  # 返回已有实例
print(s1 is s2)    # True（同一个实例）
print(s1.value)    # 2（__init__ 每次都调用）
```

### `__del__` 析构函数

```python
class FileHandler:
    """文件处理器"""
    
    def __init__(self, filename):
        self.filename = filename
        self.file = open(filename, 'w', encoding='utf-8')
        print(f"打开文件: {filename}")
    
    def write(self, content):
        self.file.write(content)
    
    def __del__(self):
        """析构函数：对象被销毁时调用"""
        if hasattr(self, 'file'):
            self.file.close()
            print(f"关闭文件: {self.filename}")

# 使用 with 语句更可靠（推荐）
handler = FileHandler("test.txt")
handler.write("Hello")
del handler  # 显式删除，触发 __del__
```

> ⚠️ **注意**：`__del__` 的调用时机不确定，不推荐依赖它进行资源清理。使用 `with` 语句和上下文管理器更可靠。

---

## 魔术方法详解

魔术方法（Magic Methods）是以双下划线开头和结尾的特殊方法，用于实现特定功能。

### 对象表示方法

```python
class Point:
    """点类"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        """str() 和 print() 调用，返回用户友好的字符串"""
        return f"({self.x}, {self.y})"
    
    def __repr__(self):
        """repr() 调用，返回可用于重建对象的字符串"""
        return f"Point({self.x}, {self.y})"
    
    def __format__(self, format_spec):
        """format() 调用"""
        if format_spec == 'polar':
            import math
            r = math.sqrt(self.x**2 + self.y**2)
            theta = math.atan2(self.y, self.x)
            return f"r={r:.2f}, θ={math.degrees(theta):.2f}°"
        return str(self)
    
    def __bytes__(self):
        """bytes() 调用"""
        return f"{self.x},{self.y}".encode()

p = Point(3, 4)
print(str(p))           # "(3, 4)"
print(repr(p))          # "Point(3, 4)"
print(f"{p:polar}")     # "r=5.00, θ=53.13°"
print(bytes(p))         # b'3,4'

# 在交互式环境中直接输入变量名显示 __repr__
# 使用 print() 显示 __str__
```

### 比较运算方法

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    
    def __eq__(self, other):
        """相等比较 =="""
        if not isinstance(other, Student):
            return NotImplemented
        return self.score == other.score
    
    def __ne__(self, other):
        """不等比较 !="""
        return not self.__eq__(other)
    
    def __lt__(self, other):
        """小于比较 <"""
        if not isinstance(other, Student):
            return NotImplemented
        return self.score < other.score
    
    def __le__(self, other):
        """小于等于 <="""
        return self.__lt__(other) or self.__eq__(other)
    
    def __gt__(self, other):
        """大于 >"""
        if not isinstance(other, Student):
            return NotImplemented
        return self.score > other.score
    
    def __ge__(self, other):
        """大于等于 >="""
        return self.__gt__(other) or self.__eq__(other)

s1 = Student("张三", 90)
s2 = Student("李四", 85)
s3 = Student("王五", 90)

print(s1 == s3)  # True（分数相同）
print(s1 > s2)   # True（90 > 85）
print(s1 < s2)   # False

# 排序
students = [s1, s2, s3]
students.sort()  # 使用 __lt__ 排序
for s in students:
    print(f"{s.name}: {s.score}")
```

### 算术运算方法

```python
class Vector:
    """二维向量"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        """加法 +"""
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other):
        """减法 -"""
        return Vector(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar):
        """乘法 *（向量 × 标量）"""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented
    
    def __rmul__(self, scalar):
        """右乘法（标量 × 向量）"""
        return self.__mul__(scalar)
    
    def __truediv__(self, scalar):
        """真除法 /"""
        return Vector(self.x / scalar, self.y / scalar)
    
    def __floordiv__(self, scalar):
        """整除 //"""
        return Vector(self.x // scalar, self.y // scalar)
    
    def __neg__(self):
        """负号 -"""
        return Vector(-self.x, -self.y)
    
    def __abs__(self):
        """绝对值 abs()"""
        return (self.x**2 + self.y**2) ** 0.5
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(3, 4)
v2 = Vector(1, 2)

print(v1 + v2)      # Vector(4, 6)
print(v1 - v2)      # Vector(2, 2)
print(v1 * 2)        # Vector(6, 8)
print(2 * v1)        # Vector(6, 8)（使用 __rmul__）
print(-v1)           # Vector(-3, -4)
print(abs(v1))       # 5.0
```

### 容器方法

```python
class Deck:
    """扑克牌组"""
    
    def __init__(self):
        suits = ['♠', '♥', '♦', '♣']
        ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        self.cards = [f"{suit}{rank}" for suit in suits for rank in ranks]
    
    def __len__(self):
        """len() 返回长度"""
        return len(self.cards)
    
    def __getitem__(self, index):
        """索引访问 []"""
        return self.cards[index]
    
    def __setitem__(self, index, value):
        """索引赋值 [] ="""
        self.cards[index] = value
    
    def __delitem__(self, index):
        """删除元素 del []"""
        del self.cards[index]
    
    def __contains__(self, item):
        """成员检测 in"""
        return item in self.cards
    
    def __iter__(self):
        """迭代器"""
        return iter(self.cards)
    
    def __reversed__(self):
        """反向迭代 reversed()"""
        return reversed(self.cards)

deck = Deck()
print(len(deck))        # 52
print(deck[0])          # '♠A'
print(deck[-1])         # '♣K'
print('♠A' in deck)     # True

# 切片
print(deck[:3])         # ['♠A', '♠2', '♠3']

# 迭代
for card in deck[:5]:
    print(card, end=' ')  # ♠A ♠2 ♠3 ♠4 ♠5
```

### 可调用对象

```python
class Multiplier:
    """乘法器"""
    
    def __init__(self, factor):
        self.factor = factor
    
    def __call__(self, x):
        """使实例可像函数一样调用"""
        return x * self.factor
    
    def __repr__(self):
        return f"Multiplier({self.factor})"

double = Multiplier(2)
triple = Multiplier(3)

print(double(5))    # 10
print(triple(5))    # 15
print(callable(double))  # True（可调用）

# 实际应用：带状态的函数
class Counter:
    """计数器函数"""
    
    def __init__(self):
        self.count = 0
    
    def __call__(self):
        self.count += 1
        return self.count

counter = Counter()
print(counter())  # 1
print(counter())  # 2
print(counter())  # 3
```

### 上下文管理器

```python
class Timer:
    """计时器上下文管理器"""
    
    def __init__(self, name):
        self.name = name
        self.start = None
        self.elapsed = None
    
    def __enter__(self):
        """进入 with 块时调用"""
        import time
        self.start = time.perf_counter()
        print(f"开始计时: {self.name}")
        return self  # 返回值赋给 as 后面的变量
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出 with 块时调用"""
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"结束计时: {self.name}, 耗时 {self.elapsed:.4f} 秒")
        # 返回 False 会传播异常，True 会抑制异常
        return False

# 使用
with Timer("循环测试"):
    total = sum(range(1000000))
# 输出:
# 开始计时: 循环测试
# 结束计时: 循环测试, 耗时 0.0xxx 秒
```

### 属性访问控制

```python
class DynamicAttr:
    """动态属性示例"""
    
    def __init__(self):
        self.data = {}
    
    def __getattr__(self, name):
        """访问不存在的属性时调用"""
        if name in self.data:
            return self.data[name]
        raise AttributeError(f"'{type(self).__name__}' 对象没有属性 '{name}'")
    
    def __setattr__(self, name, value):
        """设置属性时调用"""
        if name == 'data':
            super().__setattr__(name, value)
        else:
            self.data[name] = value
    
    def __delattr__(self, name):
        """删除属性时调用"""
        if name in self.data:
            del self.data[name]
        else:
            raise AttributeError(f"'{type(self).__name__}' 对象没有属性 '{name}'")
    
    def __dir__(self):
        """dir() 返回的属性列表"""
        return list(self.data.keys()) + ['data']

obj = DynamicAttr()
obj.name = "张三"
obj.age = 25
print(obj.name)     # "张三"
print(obj.age)      # 25
del obj.age
# print(obj.age)    # AttributeError
```

---

## 继承详解

### 单继承

```python
class Animal:
    """动物基类"""
    
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        """发声（子类应重写）"""
        raise NotImplementedError("子类必须实现此方法")
    
    def info(self):
        return f"我是 {self.name}"

class Dog(Animal):
    """狗类（继承自 Animal）"""
    
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类构造函数
        self.breed = breed
    
    def speak(self):
        return f"{self.name}: 汪汪汪！"
    
    def info(self):
        return f"我是 {self.name}，品种是 {self.breed}"

class Cat(Animal):
    """猫类（继承自 Animal）"""
    
    def speak(self):
        return f"{self.name}: 喵喵喵！"

dog = Dog("旺财", "金毛")
cat = Cat("咪咪")

print(dog.info())    # "我是 旺财，品种是 金毛"
print(dog.speak())   # "旺财: 汪汪汪！"
print(cat.speak())   # "咪咪: 喵喵喵！"
```

### 多继承

```python
class Flyable:
    """可飞行的"""
    
    def fly(self):
        return f"{self.name} 正在飞行"

class Swimmable:
    """可游泳的"""
    
    def swim(self):
        return f"{self.name} 正在游泳"

class Duck(Animal, Flyable, Swimmable):
    """鸭子（多继承）"""
    
    def speak(self):
        return f"{self.name}: 嘎嘎嘎！"

duck = Duck("唐老鸭")
print(duck.speak())  # "唐老鸭: 嘎嘎嘎！"
print(duck.fly())   # "唐老鸭 正在飞行"
print(duck.swim())  # "唐老鸭 正在游泳"
```

### super() 函数详解

```python
class A:
    def __init__(self):
        print("A.__init__")
    
    def method(self):
        print("A.method")

class B(A):
    def __init__(self):
        print("B.__init__")
        super().__init__()  # 调用父类的 __init__
    
    def method(self):
        print("B.method")
        super().method()  # 调用父类的 method

class C(A):
    def __init__(self):
        print("C.__init__")
        super().__init__()
    
    def method(self):
        print("C.method")
        super().method()

class D(B, C):
    """菱形继承"""
    
    def __init__(self):
        print("D.__init__")
        super().__init__()  # 按 MRO 顺序调用
    
    def method(self):
        print("D.method")
        super().method()

# MRO (Method Resolution Order) 方法解析顺序
print(D.__mro__)
# (<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>)

d = D()
# 输出:
# D.__init__
# B.__init__
# C.__init__
# A.__init__

d.method()
# 输出:
# D.method
# B.method
# C.method
# A.method
```

### MRO (Method Resolution Order)

```python
# 查看 MRO
print(D.mro())  # 返回列表
print(D.__mro__)  # 返回元组

# MRO 规则（C3 线性化算法）：
# 1. 子类优先于父类
# 2. 多个父类按定义顺序
# 3. 保持一致性（如果 A 在 B 前面，A 的父类也在 B 的父类前面）

class X:
    pass

class Y:
    pass

class Z(X, Y):
    pass

print(Z.mro())
# [<class '__main__.Z'>, <class '__main__.X'>, <class '__main__.Y'>, <class 'object'>]
```

---

## 方法重写和方法解析

```python
class Shape:
    """形状基类"""
    
    def __init__(self, color="black"):
        self.color = color
    
    def area(self):
        raise NotImplementedError
    
    def perimeter(self):
        raise NotImplementedError
    
    def describe(self):
        return f"颜色: {self.color}, 面积: {self.area()}, 周长: {self.perimeter()}"

class Rectangle(Shape):
    """矩形"""
    
    def __init__(self, width, height, color="black"):
        super().__init__(color)
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

class Square(Rectangle):
    """正方形（继承自矩形）"""
    
    def __init__(self, side, color="black"):
        super().__init__(side, side, color)
        self.side = side
    
    # 不需要重写 area 和 perimeter，继承自 Rectangle

rect = Rectangle(4, 5, "红色")
square = Square(3, "蓝色")

print(rect.describe())    # "颜色: 红色, 面积: 20, 周长: 18"
print(square.describe())  # "颜色: 蓝色, 面积: 9, 周长: 12"
```

---

## 多态和鸭子类型

### 多态

```python
# 多态：同一接口，不同实现
class Shape:
    def draw(self):
        pass

class Circle(Shape):
    def draw(self):
        print("绘制圆形")

class Square(Shape):
    def draw(self):
        print("绘制正方形")

class Triangle(Shape):
    def draw(self):
        print("绘制三角形")

def render(shape):
    """渲染形状（多态调用）"""
    shape.draw()

shapes = [Circle(), Square(), Triangle()]
for shape in shapes:
    render(shape)
# 输出:
# 绘制圆形
# 绘制正方形
# 绘制三角形
```

### 鸭子类型

Python 的鸭子类型："如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。"

```python
class Duck:
    def swim(self):
        print("鸭子游泳")
    
    def quack(self):
        print("嘎嘎嘎")

class Person:
    def swim(self):
        print("人游泳")
    
    def quack(self):
        print("人模仿鸭子叫")

class Robot:
    def swim(self):
        print("机器人游泳")

def make_it_quack(thing):
    """不关心类型，只关心是否有 quack 方法"""
    if hasattr(thing, 'quack'):
        thing.quack()
    else:
        print("这个东西不会叫")

duck = Duck()
person = Person()
robot = Robot()

make_it_quack(duck)    # 嘎嘎嘎
make_it_quack(person)  # 人模仿鸭子叫
make_it_quack(robot)   # 这个东西不会叫

# 鸭子类型的实际应用
class FileLike:
    """模拟文件对象"""
    
    def __init__(self, content):
        self.content = content
        self.position = 0
    
    def read(self, size=-1):
        if size == -1:
            result = self.content[self.position:]
            self.position = len(self.content)
        else:
            result = self.content[self.position:self.position + size]
            self.position += size
        return result
    
    def seek(self, position):
        self.position = position

# 可以像文件一样使用
def process_file(file_like):
    print(file_like.read(5))

file_obj = FileLike("Hello, World!")
process_file(file_obj)  # "Hello"
```

---

## 封装和访问控制

Python 没有严格的访问控制，通过命名约定实现。

```python
class BankAccount:
    """银行账户"""
    
    def __init__(self, owner, balance):
        self.owner = owner           # 公有属性
        self._balance = balance       # 受保护属性（约定）
        self.__pin = "0000"          # 私有属性（名称改写）
        self.__transaction_count = 0
    
    # 公有方法
    def deposit(self, amount):
        """存款"""
        if amount > 0:
            self._balance += amount
            self.__transaction_count += 1
            return True
        return False
    
    def withdraw(self, amount):
        """取款"""
        if 0 < amount <= self._balance:
            self._balance -= amount
            self.__transaction_count += 1
            return True
        return False
    
    def get_balance(self):
        """获取余额"""
        return self._balance
    
    def get_transaction_count(self):
        """获取交易次数"""
        return self.__transaction_count
    
    # 私有方法
    def __validate_pin(self, pin):
        """验证密码（私有方法）"""
        return pin == self.__pin
    
    def change_pin(self, old_pin, new_pin):
        """修改密码"""
        if self.__validate_pin(old_pin):
            self.__pin = new_pin
            return True
        return False

account = BankAccount("张三", 1000)

# 公有属性：可自由访问
print(account.owner)      # "张三"

# 受保护属性：技术上可访问，但约定不应直接访问
print(account._balance)   # 1000（不推荐）

# 私有属性：名称被改写，无法直接访问
# print(account.__pin)     # AttributeError
print(account._BankAccount__pin)  # "0000"（名称改写后可访问，但不推荐）

# 推荐通过公有方法访问
account.deposit(500)
print(account.get_balance())  # 1500
```

### 访问控制总结

| 命名方式 | 示例 | 访问级别 | 说明 |
|---------|------|---------|------|
| `name` | `self.name` | 公有 | 任何地方可访问 |
| `_name` | `self._name` | 受保护 | 约定不直接访问，实际可访问 |
| `__name` | `self.__name` | 私有 | 名称改写为 `_ClassName__name` |

---

## 属性装饰器 (property)

使用 `@property` 装饰器实现 getter、setter 和 deleter。

```python
class Circle:
    """圆形类"""
    
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        """getter：获取半径"""
        print("获取半径")
        return self._radius
    
    @radius.setter
    def radius(self, value):
        """setter：设置半径"""
        print("设置半径")
        if value < 0:
            raise ValueError("半径不能为负数")
        self._radius = value
    
    @radius.deleter
    def radius(self):
        """deleter：删除半径"""
        print("删除半径")
        del self._radius
    
    @property
    def area(self):
        """只读属性：面积"""
        import math
        return math.pi * self._radius ** 2
    
    @property
    def diameter(self):
        """只读属性：直径"""
        return 2 * self._radius

circle = Circle(5)
print(circle.radius)     # 获取半径，返回 5
circle.radius = 10       # 设置半径
print(circle.area)       # 314.15...（只读）
print(circle.diameter)   # 20

# del circle.radius       # 删除半径

# circle.radius = -1      # ValueError: 半径不能为负数
```

### 计算属性和缓存

```python
class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height
        self._area = None  # 缓存
    
    @property
    def width(self):
        return self._width
    
    @width.setter
    def width(self, value):
        self._width = value
        self._area = None  # 清除缓存
    
    @property
    def height(self):
        return self._height
    
    @height.setter
    def height(self, value):
        self._height = value
        self._area = None  # 清除缓存
    
    @property
    def area(self):
        """带缓存的计算属性"""
        if self._area is None:
            print("计算面积...")
            self._area = self._width * self._height
        return self._area

rect = Rectangle(4, 5)
print(rect.area)   # 计算面积... 20
print(rect.area)   # 20（使用缓存）
rect.width = 6
print(rect.area)   # 计算面积... 30（重新计算）
```

---

## 类方法和静态方法

```python
class Employee:
    """员工类"""
    
    # 类属性
    company = "科技公司"
    employee_count = 0
    raise_rate = 1.05
    
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
        Employee.employee_count += 1
    
    # 实例方法
    def get_info(self):
        """实例方法：可以访问实例和类属性"""
        return f"{self.name} - {self.company} - 薪资: {self.salary}"
    
    def apply_raise(self):
        """涨薪"""
        self.salary = int(self.salary * self.raise_rate)
    
    # 类方法
    @classmethod
    def set_company(cls, company_name):
        """类方法：修改类属性"""
        cls.company = company_name
    
    @classmethod
    def set_raise_rate(cls, rate):
        """类方法：设置涨薪比例"""
        cls.raise_rate = rate
    
    @classmethod
    def from_string(cls, emp_str):
        """类方法作为替代构造函数"""
        name, salary = emp_str.split('-')
        return cls(name, int(salary))
    
    # 静态方法
    @staticmethod
    def is_workday(date):
        """静态方法：与类和实例无关的工具方法"""
        return date.weekday() < 5  # 0-4 是工作日

# 实例方法
emp1 = Employee("张三", 5000)
print(emp1.get_info())  # "张三 - 科技公司 - 薪资: 5000"

# 类方法
Employee.set_company("创新公司")
print(emp1.get_info())  # "张三 - 创新公司 - 薪资: 5000"

# 类方法作为构造函数
emp2 = Employee.from_string("李四-6000")
print(emp2.get_info())  # "李四 - 创新公司 - 薪资: 6000"

# 静态方法
import datetime
date = datetime.date(2024, 1, 15)  # 周一
print(Employee.is_workday(date))  # True
```

### 方法类型对比

| 方法类型 | 装饰器 | 第一个参数 | 可访问 |
|---------|--------|-----------|--------|
| 实例方法 | 无 | `self` | 实例属性、类属性 |
| 类方法 | `@classmethod` | `cls` | 类属性 |
| 静态方法 | `@staticmethod` | 无 | 无（需通过类名或实例访问） |

---

## 数据类 (dataclass)

Python 3.7+ 引入的 `@dataclass` 装饰器，自动生成常用方法。

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class Person:
    """数据类：自动生成 __init__, __repr__, __eq__ 等"""
    name: str
    age: int
    email: str = ""  # 默认值
    
    def greet(self):
        return f"Hello, I'm {self.name}"

# 自动生成的 __init__
p1 = Person("张三", 25, "zhangsan@example.com")
p2 = Person("李四", 30)
p3 = Person("张三", 25, "zhangsan@example.com")

print(p1)        # Person(name='张三', age=25, email='zhangsan@example.com')
print(p1 == p3)  # True（自动生成的 __eq__）
print(p1.greet())  # "Hello, I'm 张三"
```

### dataclass 高级用法

```python
from dataclasses import dataclass, field
from typing import List, ClassVar

@dataclass
class Student:
    # 类变量（不参与实例化）
    school: ClassVar[str] = "Python大学"
    student_count: ClassVar[int] = 0
    
    # 实例变量
    name: str
    score: float
    grade: str = field(init=False)  # 不参与 __init__，后续计算
    courses: List[str] = field(default_factory=list)  # 可变默认值
    _id: int = field(default=0, repr=False)  # 不显示在 repr 中
    
    def __post_init__(self):
        """初始化后处理"""
        self.grade = self._calculate_grade()
        Student.student_count += 1
    
    def _calculate_grade(self):
        if self.score >= 90:
            return "A"
        elif self.score >= 80:
            return "B"
        elif self.score >= 70:
            return "C"
        elif self.score >= 60:
            return "D"
        return "F"

s1 = Student("张三", 85)
s2 = Student("李四", 92, _id=1)

print(s1)  # Student(name='张三', score=85.0, grade='B', courses=[])
print(s2)  # Student(name='李四', score=92.0, grade='A', courses=[])
print(Student.student_count)  # 2

# 不可变数据类
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
# p.x = 3.0  # FrozenInstanceError: cannot assign to field 'x'
```

### dataclass 参数

```python
@dataclass(
    init=True,       # 生成 __init__
    repr=True,       # 生成 __repr__
    eq=True,         # 生成 __eq__
    order=False,     # 生成 __lt__, __le__, __gt__, __ge__
    unsafe_hash=False,  # 生成 __hash__
    frozen=False,    # 实例是否不可变
)
class Config:
    debug: bool = False
    port: int = 8080

# 排序支持
@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int = 0

v1 = Version(1, 0, 0)
v2 = Version(2, 0, 0)
v3 = Version(1, 1, 0)

versions = [v1, v2, v3]
versions.sort()
print([str(v) for v in versions])
# ['Version(major=1, minor=0, patch=0)', 'Version(major=1, minor=1, patch=0)', 'Version(major=2, minor=0, patch=0)']
```

---

## 抽象类和接口

### 抽象基类 (ABC)

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    """抽象基类"""
    
    @abstractmethod
    def area(self):
        """抽象方法：计算面积"""
        pass
    
    @abstractmethod
    def perimeter(self):
        """抽象方法：计算周长"""
        pass
    
    def describe(self):
        """具体方法"""
        return f"面积: {self.area()}, 周长: {self.perimeter()}"

class Circle(Shape):
    """圆形"""
    
    def __init__(self, radius):
        self.radius = radius
    
    def area(self):
        return math.pi * self.radius ** 2
    
    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    """矩形"""
    
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

# shape = Shape()  # TypeError: 不能实例化抽象类

circle = Circle(5)
rect = Rectangle(4, 6)

print(circle.describe())  # 面积: 78.53..., 周长: 31.41...
print(rect.describe())    # 面积: 24, 周长: 20
```

### 抽象属性

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    """动物抽象类"""
    
    @property
    @abstractmethod
    def name(self):
        """抽象属性"""
        pass
    
    @abstractmethod
    def speak(self):
        """抽象方法"""
        pass

class Dog(Animal):
    """狗类"""
    
    @property
    def name(self):
        return "旺财"
    
    def speak(self):
        return "汪汪汪"

dog = Dog()
print(dog.name)   # "旺财"
print(dog.speak())  # "汪汪汪"
```

### 接口模式

```python
from abc import ABC, abstractmethod
from typing import Protocol

# 方式1：使用 ABC
class Drawable(ABC):
    @abstractmethod
    def draw(self):
        pass

class Resizable(ABC):
    @abstractmethod
    def resize(self, factor):
        pass

class Image(Drawable, Resizable):
    def draw(self):
        print("绘制图像")
    
    def resize(self, factor):
        print(f"缩放 {factor} 倍")

# 方式2：使用 Protocol (Python 3.8+)
class Serializable(Protocol):
    """协议接口（结构化子类型）"""
    
    def to_json(self) -> str:
        ...
    
    def from_json(self, data: str) -> 'Serializable':
        ...

class User:
    """无需继承，只需实现协议方法"""
    
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def to_json(self) -> str:
        import json
        return json.dumps({'name': self.name, 'age': self.age})
    
    def from_json(self, data: str) -> 'User':
        import json
        obj = json.loads(data)
        return User(obj['name'], obj['age'])

# User 自动满足 Serializable 协议
```

---

## 设计模式基础

### 单例模式

```python
# 方式1：使用 __new__
class Singleton:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, value):
        # 注意：__init__ 每次都会调用
        if not hasattr(self, 'value'):
            self.value = value

s1 = Singleton("A")
s2 = Singleton("B")
print(s1 is s2)  # True
print(s1.value)  # "A"（第一次初始化的值）

# 方式2：使用装饰器
def singleton(cls):
    instances = {}
    
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return get_instance

@singleton
class Database:
    def __init__(self, connection_string):
        self.connection_string = connection_string

db1 = Database("mysql://localhost")
db2 = Database("postgres://localhost")
print(db1 is db2)  # True

# 方式3：使用元类
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Logger(metaclass=SingletonMeta):
    def __init__(self):
        self.logs = []
    
    def log(self, message):
        self.logs.append(message)

logger1 = Logger()
logger2 = Logger()
print(logger1 is logger2)  # True
```

### 工厂模式

```python
# 简单工厂
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵喵"

class AnimalFactory:
    """简单工厂"""
    
    @staticmethod
    def create_animal(animal_type):
        if animal_type == "dog":
            return Dog()
        elif animal_type == "cat":
            return Cat()
        else:
            raise ValueError(f"未知动物类型: {animal_type}")

dog = AnimalFactory.create_animal("dog")
cat = AnimalFactory.create_animal("cat")
print(dog.speak())  # 汪汪汪
print(cat.speak())  # 喵喵喵

# 工厂方法模式
class AnimalFactory(ABC):
    """抽象工厂"""
    
    @abstractmethod
    def create_animal(self):
        pass

class DogFactory(AnimalFactory):
    def create_animal(self):
        return Dog()

class CatFactory(AnimalFactory):
    def create_animal(self):
        return Cat()

def client_code(factory: AnimalFactory):
    animal = factory.create_animal()
    print(animal.speak())

client_code(DogFactory())  # 汪汪汪
client_code(CatFactory())  # 喵喵喵

# 抽象工厂模式
class GUIFactory(ABC):
    @abstractmethod
    def create_button(self):
        pass
    
    @abstractmethod
    def create_checkbox(self):
        pass

class WindowsFactory(GUIFactory):
    def create_button(self):
        return WindowsButton()
    
    def create_checkbox(self):
        return WindowsCheckbox()

class MacFactory(GUIFactory):
    def create_button(self):
        return MacButton()
    
    def create_checkbox(self):
        return MacCheckbox()

class Button(ABC):
    @abstractmethod
    def paint(self):
        pass

class WindowsButton(Button):
    def paint(self):
        return "Windows 风格按钮"

class MacButton(Button):
    def paint(self):
        return "Mac 风格按钮"

class Checkbox(ABC):
    @abstractmethod
    def paint(self):
        pass

class WindowsCheckbox(Checkbox):
    def paint(self):
        return "Windows 风格复选框"

class MacCheckbox(Checkbox):
    def paint(self):
        return "Mac 风格复选框"
```

### 策略模式

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    """排序策略"""
    
    @abstractmethod
    def sort(self, data):
        pass

class BubbleSort(SortStrategy):
    def sort(self, data):
        print("使用冒泡排序")
        return sorted(data)

class QuickSort(SortStrategy):
    def sort(self, data):
        print("使用快速排序")
        return sorted(data)

class Sorter:
    """排序器"""
    
    def __init__(self, strategy: SortStrategy):
        self.strategy = strategy
    
    def set_strategy(self, strategy: SortStrategy):
        self.strategy = strategy
    
    def sort(self, data):
        return self.strategy.sort(data)

data = [3, 1, 4, 1, 5, 9, 2, 6]
sorter = Sorter(BubbleSort())
print(sorter.sort(data))

sorter.set_strategy(QuickSort())
print(sorter.sort(data))
```

---

## 常见错误和最佳实践

### 常见错误

```python
# ❌ 错误1：忘记 self 参数
class Wrong:
    def method():  # 缺少 self
        pass

# ✅ 正确
class Right:
    def method(self):
        pass

# ❌ 错误2：可变默认参数
class Bad:
    def __init__(self, items=[]):  # 可变默认参数
        self.items = items

b1 = Bad()
b1.items.append(1)
b2 = Bad()
print(b2.items)  # [1]（共享了同一个列表）

# ✅ 正确
class Good:
    def __init__(self, items=None):
        self.items = items if items is not None else []

# ❌ 错误3：混淆类属性和实例属性
class Counter:
    count = 0  # 类属性
    
    def increment(self):
        count += 1  # NameError: count 未定义

# ✅ 正确
class Counter:
    count = 0
    
    def increment(self):
        Counter.count += 1  # 或 self.__class__.count += 1

# ❌ 错误4：在 __init__ 外定义实例属性
class Bad:
    def __init__(self):
        self.x = 1
    
    def method(self):
        print(self.y)  # 如果未调用 set_y()，会报错
    
    def set_y(self):
        self.y = 2

# ✅ 正确：在 __init__ 中初始化所有属性
class Good:
    def __init__(self):
        self.x = 1
        self.y = None  # 或默认值
    
    def method(self):
        print(self.y)
    
    def set_y(self, value):
        self.y = value

# ❌ 错误5：循环引用导致内存泄漏
class Node:
    def __init__(self, value):
        self.value = value
        self.parent = None
        self.children = []
    
    def add_child(self, child):
        child.parent = self  # 循环引用
        self.children.append(child)

# ✅ 正确：使用弱引用
import weakref

class Node:
    def __init__(self, value):
        self.value = value
        self._parent = None
        self.children = []
    
    @property
    def parent(self):
        if self._parent is None:
            return None
        return self._parent()  # 解引用
    
    @parent.setter
    def parent(self, node):
        self._parent = weakref.ref(node)  # 弱引用
```

### 最佳实践

```python
# 1. 使用类型注解
class User:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age
    
    def get_info(self) -> str:
        return f"{self.name}, {self.age}岁"

# 2. 使用文档字符串
class Calculator:
    """计算器类
    
    提供基本的数学运算功能。
    
    Attributes:
        precision: 计算精度
    
    Example:
        >>> calc = Calculator(2)
        >>> calc.add(1, 2)
        3
    """
    
    def __init__(self, precision: int = 2):
        self.precision = precision
    
    def add(self, a: float, b: float) -> float:
        """加法运算
        
        Args:
            a: 第一个数
            b: 第二个数
        
        Returns:
            两数之和
        """
        return round(a + b, self.precision)

# 3. 使用 property 保护属性
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius
    
    @property
    def celsius(self) -> float:
        return self._celsius
    
    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度")
        self._celsius = value
    
    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9/5 + 32

# 4. 使用 __slots__ 节省内存
class Point:
    __slots__ = ['x', 'y']  # 固定属性列表
    
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 5. 使用 dataclass 简化代码
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    
    def distance_to(self, other: 'Point') -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5

# 6. 组合优于继承
class Engine:
    def start(self):
        print("引擎启动")

class Car:
    def __init__(self):
        self.engine = Engine()  # 组合
    
    def start(self):
        self.engine.start()
        print("汽车启动")

# 7. 使用上下文管理器管理资源
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False

# 使用
with FileManager("test.txt", "w") as f:
    f.write("Hello")
```

---

## 魔术方法速查表

| 方法 | 用途 | 示例 |
|------|------|------|
| `__init__` | 构造函数 | `obj = MyClass()` |
| `__new__` | 创建实例 | 单例模式 |
| `__del__` | 析构函数 | `del obj` |
| `__str__` | 字符串表示 | `str(obj)`, `print(obj)` |
| `__repr__` | 调试表示 | `repr(obj)` |
| `__eq__` | 相等比较 | `obj1 == obj2` |
| `__ne__` | 不等比较 | `obj1 != obj2` |
| `__lt__` | 小于 | `obj1 < obj2` |
| `__le__` | 小于等于 | `obj1 <= obj2` |
| `__gt__` | 大于 | `obj1 > obj2` |
| `__ge__` | 大于等于 | `obj1 >= obj2` |
| `__add__` | 加法 | `obj1 + obj2` |
| `__sub__` | 减法 | `obj1 - obj2` |
| `__mul__` | 乘法 | `obj1 * obj2` |
| `__truediv__` | 除法 | `obj1 / obj2` |
| `__floordiv__` | 整除 | `obj1 // obj2` |
| `__mod__` | 取模 | `obj1 % obj2` |
| `__pow__` | 幂运算 | `obj1 ** obj2` |
| `__neg__` | 负号 | `-obj` |
| `__abs__` | 绝对值 | `abs(obj)` |
| `__len__` | 长度 | `len(obj)` |
| `__getitem__` | 索引获取 | `obj[key]` |
| `__setitem__` | 索引设置 | `obj[key] = value` |
| `__delitem__` | 索引删除 | `del obj[key]` |
| `__contains__` | 成员检测 | `item in obj` |
| `__iter__` | 迭代器 | `for x in obj` |
| `__next__` | 下一个元素 | `next(obj)` |
| `__call__` | 可调用 | `obj()` |
| `__enter__` | 上下文进入 | `with obj:` |
| `__exit__` | 上下文退出 | `with obj:` |
| `__getattr__` | 属性获取 | `obj.attr` (不存在时) |
| `__setattr__` | 属性设置 | `obj.attr = value` |
| `__delattr__` | 属性删除 | `del obj.attr` |
| `__hash__` | 哈希值 | `hash(obj)` |
| `__bool__` | 布尔值 | `bool(obj)` |
| `__dir__` | 属性列表 | `dir(obj)` |

---

## 📝 随堂练习

👉 前往 [练习页面](/practice/ch10_oop) 完成以下任务：

1. **创建类** - 定义一个表示矩形的类，包含面积和周长计算
2. **继承应用** - 创建学生类继承人类，添加学号属性
3. **魔术方法** - 实现向量的加法、减法和比较运算
4. **属性装饰器** - 实现温度类的摄氏度和华氏度转换
5. **设计模式** - 实现一个简单的单例模式

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