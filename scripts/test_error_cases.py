#!/usr/bin/env python3
"""测试判题逻辑 - 验证错误答案会失败"""

import json
import sys
from io import StringIO
from typing import List, Dict, Any, Tuple

def extract_function_name(instruction: str) -> str:
    import re
    match = re.search(r'定义函数\s+`(\w+)\s*\(', instruction)
    return match[1] if match else '_student_func'

def calculate_score(passed_count: int, total_count: int, weight: int) -> int:
    if total_count == 0:
        return weight
    return round((passed_count / total_count) * weight)

def normalize_output(output: str) -> str:
    return output.strip().replace('\r\n', '\n').replace(' ', '')

def test_function(code: str, func_name: str, mock_inputs: List[Dict]) -> Dict:
    ns = {}
    try:
        exec(code, ns)
    except Exception as e:
        return {'error': str(e), 'passed': 0, 'total': len(mock_inputs)}

    if func_name not in ns:
        return {'error': f'Function {func_name} not found', 'passed': 0, 'total': len(mock_inputs)}

    func = ns[func_name]
    results = []
    passed = 0

    for tc in mock_inputs:
        args = tc.get('args', [])
        expected = tc.get('expected')
        try:
            result = func(*args) if args else func()
            ok = (result == expected)
            results.append({'args': args, 'expected': expected, 'actual': result, 'passed': ok})
            if ok:
                passed += 1
        except Exception as e:
            results.append({'args': args, 'expected': expected, 'error': str(e), 'passed': False})

    return {'passed': passed, 'total': len(mock_inputs), 'results': results}

def test_output(code: str, expected: str) -> Dict:
    old_stdout = sys.stdout
    sys.stdout = buf = StringIO()
    try:
        exec(code)
        output = buf.getvalue()
    except Exception as e:
        sys.stdout = old_stdout
        return {'error': str(e), 'passed': False, 'actual': ''}
    finally:
        sys.stdout = old_stdout

    norm_expected = normalize_output(expected)
    norm_actual = normalize_output(output)
    matched = norm_expected == norm_actual
    return {'passed': matched, 'expected': expected, 'actual': output.strip()}

def main():
    print("=" * 60)
    print("测试判题逻辑 - 验证错误答案会失败")
    print("=" * 60)

    # ============== 测试1: 正确的阶乘应该通过 ==============
    print("\n【测试1】正确的阶乘实现 - 应该通过")
    code = """
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
"""
    result = test_function(code, 'factorial', [
        {'args': [5], 'expected': 120},
        {'args': [0], 'expected': 1},
    ])
    print(f"  通过: {result['passed']}/{result['total']}")
    score = calculate_score(result['passed'], result['total'], 10)
    print(f"  得分: {score}/10 {'✓' if result['passed'] == result['total'] else '✗'}")

    # ============== 测试2: 错误的阶乘实现（返回固定值）应该失败 ==============
    print("\n【测试2】错误的阶乘实现（返回固定值1）- 应该失败")
    code_wrong = """
def factorial(n):
    return 1  # 错误：总是返回1
"""
    result = test_function(code_wrong, 'factorial', [
        {'args': [5], 'expected': 120},
        {'args': [3], 'expected': 6},
    ])
    print(f"  通过: {result['passed']}/{result['total']}")
    score = calculate_score(result['passed'], result['total'], 10)
    print(f"  得分: {score}/10 {'✓' if score < 10 else '✗ 错误：应该得0分但得了' + str(score)}")

    # ============== 测试3: 正确的is_prime应该通过 ==============
    print("\n【测试3】正确的is_prime实现 - 应该通过")
    code = """
def is_prime(n):
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for x in range(3, n, 2):
        if n % x == 0:
            return False
    return True
"""
    result = test_function(code, 'is_prime', [
        {'args': [2], 'expected': True},
        {'args': [3], 'expected': True},
        {'args': [4], 'expected': False},
        {'args': [7], 'expected': True},
        {'args': [1], 'expected': False},
        {'args': [9], 'expected': False},
    ])
    print(f"  通过: {result['passed']}/{result['total']}")
    score = calculate_score(result['passed'], result['total'], 10)
    print(f"  得分: {score}/10 {'✓' if result['passed'] == result['total'] else '✗'}")

    # ============== 测试4: 错误的is_prime实现（提交了阶乘函数）应该失败 ==============
    print("\n【测试4】错误的实现（提交了factorial当作is_prime）- 应该失败")
    code_wrong = """
def is_prime(n):
    if n == 0 or n == 1:
        return 1
    return n * is_prime(n - 1)
"""
    result = test_function(code_wrong, 'is_prime', [
        {'args': [2], 'expected': True},
        {'args': [3], 'expected': True},
    ])
    print(f"  通过: {result['passed']}/{result['total']}")
    score = calculate_score(result['passed'], result['total'], 10)
    print(f"  得分: {score}/10 {'✓' if score < 10 else '✗ 错误：应该得低分但得了' + str(score)}")

    # ============== 测试5: 正确的乘法表应该通过 ==============
    print("\n【测试5】正确的乘法表实现 - 应该通过")
    code = """
for i in range(1, 6):
    row = []
    for j in range(1, i + 1):
        row.append(f"{j}×{i}={i*j}")
    print(' '.join(row))
"""
    expected = "1×1=1\n1×2=2 2×2=4\n1×3=3 2×3=6 3×3=9\n1×4=4 2×4=8 3×4=12 4×4=16\n1×5=5 2×5=10 3×5=15 4×5=20 5×5=25"
    result = test_output(code, expected)
    score = calculate_score(1 if result['passed'] else 0, 1, 16)
    print(f"  结果: {'通过' if result['passed'] else '失败'}")
    print(f"  得分: {score}/16 {'✓' if result['passed'] else '✗'}")

    # ============== 测试6: 错误的乘法表应该失败 ==============
    print("\n【测试6】错误的乘法表实现 - 应该失败")
    code_wrong = """
print("错误输出")
"""
    result = test_output(code_wrong, expected)
    score = calculate_score(1 if result['passed'] else 0, 1, 16)
    print(f"  结果: {'通过' if result['passed'] else '失败'}")
    print(f"  得分: {score}/16 {'✓' if score == 0 else '✗ 错误：应该得0分但得了' + str(score)}")

    # ============== 测试7: 分数计算验证 ==============
    print("\n【测试7】分数计算验证")
    test_cases = [
        (4, 4, 10, 10, "全部通过"),
        (3, 4, 10, 8, "75%通过"),
        (2, 4, 10, 5, "50%通过"),
        (1, 4, 10, 3, "25%通过"),
        (0, 4, 10, 0, "0%通过"),
        (1, 1, 16, 16, "100%通过，16分题"),
    ]
    for passed, total, weight, expected_score, desc in test_cases:
        actual_score = calculate_score(passed, total, weight)
        status = "✓" if actual_score == expected_score else "✗"
        print(f"  {status} {desc}: {actual_score}/{weight} (预期: {expected_score})")

    print("\n" + "=" * 60)
    print("所有验证测试完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()
