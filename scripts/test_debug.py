#!/usr/bin/env python3
"""测试判题逻辑 - 调试版"""

import json
import re
from typing import List, Dict, Any, Tuple

# ============== 模拟判题逻辑 ==============

def extract_function_name(instruction: str) -> str:
    """从instruction中提取函数名"""
    match = re.search(r'定义函数\s+`(\w+)\s*\(', instruction)
    if match:
        return match[1]
    return '_student_func'


def calculate_score(passed_count: int, total_count: int, weight: int) -> int:
    """计算得分"""
    if total_count == 0:
        return weight
    ratio = passed_count / total_count
    return round(ratio * weight)


def normalize_output(output: str) -> str:
    """标准化输出"""
    return output.strip().replace('\r\n', '\n').replace(' ', '')


def compare_outputs(expected: str, actual: str) -> Tuple[bool, int]:
    """比较输出是否匹配"""
    norm_expected = normalize_output(expected)
    norm_actual = normalize_output(actual)
    matched = norm_expected == norm_actual
    diff_lines = 0
    if not matched:
        exp_lines = norm_expected.split('\n')
        act_lines = norm_actual.split('\n')
        diff_lines = abs(len(exp_lines) - len(act_lines))
    return matched, diff_lines


# ============== 调试版测试函数题 ==============

def test_function_question_debug(title: str, instruction: str, code: str,
                                 mock_inputs: List[Dict], weight: int = 10) -> Dict:
    """测试函数题"""
    func_name = extract_function_name(instruction)

    # 提取示例中的expected
    expected_from_example = None
    for line in instruction.split('\n'):
        if '→' in line:
            parts = line.split('→')
            if len(parts) >= 2:
                result = parts[1].strip()
                if result in ['True', 'False']:
                    expected_from_example = result == 'True'
                    break

    print(f"  提取的函数名: {func_name}")

    # 准备一个全局命名空间来执行代码
    global_namespace = {}
    try:
        exec(code, global_namespace)
        print(f"  代码执行成功")
    except Exception as e:
        print(f"  代码执行错误: {e}")
        return {'error': str(e), 'score': 0}

    if func_name not in global_namespace:
        print(f"  错误: 函数 {func_name} 未定义!")
        return {'error': f'Function {func_name} not found', 'score': 0}

    results = []
    passed_count = 0

    for i, tc in enumerate(mock_inputs):
        args = tc.get('args', [])
        expected = tc.get('expected')

        try:
            func = global_namespace[func_name]

            if args:
                result = func(*args)
            else:
                result = func()

            print(f"  测试 {i+1}: args={args}, expected={expected}, actual={result}, type={type(result)}")

            # 比较结果 - 使用 == 比较
            if result == expected:
                results.append({'passed': True, 'expected': expected, 'actual': result})
                passed_count += 1
            else:
                results.append({'passed': False, 'expected': expected, 'actual': result})

        except Exception as e:
            print(f"  测试 {i+1} 执行错误: {e}")
            results.append({'passed': False, 'error': str(e)})

    total_tests = len(mock_inputs)
    score = calculate_score(passed_count, total_tests, weight)
    all_passed = passed_count == total_tests

    return {
        'title': title,
        'func_name': func_name,
        'weight': weight,
        'passed_count': passed_count,
        'total_tests': total_tests,
        'score': score,
        'all_passed': all_passed,
        'details': results
    }


# ============== 运行调试测试 ==============

def main():
    print("=" * 60)
    print("Python判题逻辑测试 - 调试版")
    print("=" * 60)

    # 测试阶乘实现
    print("\n【测试】阶乘计算 factorial")
    code = """
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
"""

    mock_inputs = [
        {'args': [5], 'expected': 120},
        {'args': [0], 'expected': 1},
        {'args': [1], 'expected': 1},
        {'args': [3], 'expected': 6}
    ]

    result = test_function_question_debug(
        title="阶乘计算",
        instruction="定义函数 `factorial(n)` 计算 n 的阶乘。\n\n注意：0! = 1，1! = 1",
        code=code,
        mock_inputs=mock_inputs,
        weight=10
    )

    print(f"\n  结果:")
    print(f"    通过: {result['passed_count']}/{result['total_tests']}")
    print(f"    得分: {result['score']}/{result['weight']}")

    # 测试乘法表
    print("\n【测试】输出题 - 乘法表")
    code = """
for i in range(1, 6):
    row = []
    for j in range(1, i + 1):
        row.append(f"{j}×{i}={i*j}")
    print(' '.join(row))
"""

    expected = "1×1=1\n1×2=2 2×2=4\n1×3=3 2×3=6 3×3=9\n1×4=4 2×4=8 3×4=12 4×4=16\n1×5=5 2×5=10 3×5=15 4×5=20 5×5=25"

    import sys
    from io import StringIO

    old_stdout = sys.stdout
    sys.stdout = StringIO()

    try:
        exec(code)
        output = sys.stdout.getvalue()
    except Exception as e:
        print(f"  执行错误: {e}")
        output = ""
    finally:
        sys.stdout = old_stdout

    print(f"  预期输出:")
    for line in expected.split('\n'):
        print(f"    {line}")
    print(f"  实际输出:")
    for line in output.strip().split('\n'):
        print(f"    {line}")

    matched, diff = compare_outputs(expected, output)
    print(f"\n  匹配结果: {'✓' if matched else '✗'}")


if __name__ == '__main__':
    main()
