#!/usr/bin/env python3
"""测试判题逻辑"""

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


# ============== 测试用例 ==============

def test_function_question(title: str, instruction: str, code: str,
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
                if result.startswith('[') or result.startswith('{') or result.startswith("'"):
                    expected_from_example = result
                    break

    results = []
    passed_count = 0

    for tc in mock_inputs:
        args = tc.get('args', [])
        expected = tc.get('expected')

        # 模拟执行函数
        try:
            local_vars = {}
            exec(code, {}, local_vars)

            if func_name in local_vars:
                func = local_vars[func_name]
                if args:
                    result = func(*args)
                else:
                    result = func()

                # 比较结果
                if str(result) == str(expected):
                    results.append({'passed': True, 'expected': expected, 'actual': result})
                    passed_count += 1
                else:
                    results.append({'passed': False, 'expected': expected, 'actual': result})
            else:
                results.append({'passed': False, 'error': f'Function {func_name} not found'})
        except Exception as e:
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


def test_output_question(title: str, code: str, expected: str, weight: int = 10) -> Dict:
    """测试输出题"""
    # 模拟执行代码
    try:
        import sys
        from io import StringIO

        old_stdout = sys.stdout
        sys.stdout = StringIO()

        exec(code)

        output = sys.stdout.getvalue()
        sys.stdout = old_stdout

        matched, diff_lines = compare_outputs(expected, output)
        passed_count = 1 if matched else 0
        score = calculate_score(passed_count, 1, weight)

        return {
            'title': title,
            'weight': weight,
            'passed_count': passed_count,
            'total_tests': 1,
            'score': score,
            'all_passed': matched,
            'expected': expected,
            'actual': output.strip(),
            'matched': matched
        }
    except Exception as e:
        return {
            'title': title,
            'error': str(e),
            'score': 0
        }


# ============== 运行测试 ==============

def main():
    print("=" * 60)
    print("Python判题逻辑测试")
    print("=" * 60)

    all_passed = True

    # 测试1: 函数题 - 正确的阶乘实现
    print("\n【测试1】函数题 - 正确的阶乘实现")
    result = test_function_question(
        title="阶乘计算",
        instruction="定义函数 `factorial(n)` 计算 n 的阶乘。\n\n注意：0! = 1，1! = 1",
        code="""
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
""",
        mock_inputs=[
            {'args': [5], 'expected': 120},
            {'args': [0], 'expected': 1},
            {'args': [1], 'expected': 1},
            {'args': [3], 'expected': 6}
        ],
        weight=10
    )
    print(f"  函数名: {result['func_name']}")
    print(f"  通过: {result['passed_count']}/{result['total_tests']}")
    print(f"  得分: {result['score']}/{result['weight']}")
    print(f"  状态: {'✓ PASSED' if result['all_passed'] else '✗ FAILED'}")
    if not result['all_passed']:
        all_passed = False

    # 测试2: 函数题 - 错误的阶乘实现（提交了错误的函数）
    print("\n【测试2】函数题 - 错误的实现（提交了is_prime）")
    result = test_function_question(
        title="阶乘计算",
        instruction="定义函数 `factorial(n)` 计算 n 的阶乘。",
        code="""
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True
""",
        mock_inputs=[
            {'args': [5], 'expected': 120},
            {'args': [0], 'expected': 1},
        ],
        weight=10
    )
    print(f"  函数名: {result['func_name']}")
    print(f"  通过: {result['passed_count']}/{result['total_tests']}")
    print(f"  得分: {result['score']}/{result['weight']}")
    print(f"  状态: {'✓ PASSED' if result['all_passed'] else '✗ FAILED (预期失败)'}")
    if result['all_passed']:
        all_passed = False
        print("  ⚠️ 错误！应该失败但通过了")

    # 测试3: 函数题 - 正确的is_prime实现
    print("\n【测试3】函数题 - 正确的is_prime实现")
    result = test_function_question(
        title="判断质数",
        instruction="定义函数 `is_prime(n)` 判断 n 是否为质数，返回 True 或 False。",
        code="""
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
""",
        mock_inputs=[
            {'args': [2], 'expected': True},
            {'args': [3], 'expected': True},
            {'args': [4], 'expected': False},
            {'args': [7], 'expected': True},
            {'args': [1], 'expected': False},
            {'args': [9], 'expected': False}
        ],
        weight=10
    )
    print(f"  函数名: {result['func_name']}")
    print(f"  通过: {result['passed_count']}/{result['total_tests']}")
    print(f"  得分: {result['score']}/{result['weight']}")
    print(f"  状态: {'✓ PASSED' if result['all_passed'] else '✗ FAILED'}")
    if not result['all_passed']:
        all_passed = False

    # 测试4: 输出题 - 正确的乘法表
    print("\n【测试4】输出题 - 正确的乘法表")
    result = test_output_question(
        title="乘法表",
        code="""
for i in range(1, 6):
    row = []
    for j in range(1, i + 1):
        row.append(f"{j}×{i}={i*j}")
    print(' '.join(row))
""",
        expected="1×1=1\n1×2=2 2×2=4\n1×3=3 2×3=6 3×3=9\n1×4=4 2×4=8 3×4=12 4×4=16\n1×5=5 2×5=10 3×5=15 4×5=20 5×5=25",
        weight=16
    )
    print(f"  通过: {result['passed_count']}/{result['total_tests']}")
    print(f"  得分: {result['score']}/{result['weight']}")
    print(f"  状态: {'✓ PASSED' if result['all_passed'] else '✗ FAILED'}")
    if not result['all_passed']:
        all_passed = False

    # 测试5: 输出题 - 错误的输出
    print("\n【测试5】输出题 - 错误的输出")
    result = test_output_question(
        title="乘法表",
        code="""
print("错误输出")
""",
        expected="1×1=1\n1×2=2 2×2=4",
        weight=16
    )
    print(f"  通过: {result['passed_count']}/{result['total_tests']}")
    print(f"  得分: {result['score']}/{result['weight']}")
    print(f"  状态: {'✓ FAILED (预期失败)' if not result['all_passed'] else '✗ 应该失败但通过了'}")
    if result['all_passed']:
        all_passed = False
        print("  ⚠️ 错误！应该失败但通过了")

    # 测试6: 测试分数计算
    print("\n【测试6】分数计算验证")
    test_cases = [
        (4, 4, 10, 10),  # 全部通过
        (3, 4, 10, 8),   # 75%通过
        (2, 4, 10, 5),   # 50%通过
        (0, 4, 10, 0),   # 0%通过
        (1, 1, 16, 16),  # 100%通过，16分题
    ]
    for passed, total, weight, expected_score in test_cases:
        actual_score = calculate_score(passed, total, weight)
        status = "✓" if actual_score == expected_score else "✗"
        print(f"  {status} {passed}/{total} * {weight} = {actual_score} (预期: {expected_score})")
        if actual_score != expected_score:
            all_passed = False

    # 测试7: 函数名提取
    print("\n【测试7】函数名提取")
    test_instructions = [
        ("定义函数 `remove_duplicates(lst)`", "remove_duplicates"),
        ("定义函数 `factorial(n)` 计算", "factorial"),
        ("定义函数 `is_prime(n)` 判断", "is_prime"),
        ("定义函数 `merge_dicts(d1, d2)` 合并", "merge_dicts"),
    ]
    for instruction, expected_name in test_instructions:
        actual_name = extract_function_name(instruction)
        status = "✓" if actual_name == expected_name else "✗"
        print(f"  {status} {expected_name} <- {actual_name}")
        if actual_name != expected_name:
            all_passed = False

    # 总结
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ 所有测试通过！")
    else:
        print("✗ 部分测试失败")
    print("=" * 60)


if __name__ == '__main__':
    main()
