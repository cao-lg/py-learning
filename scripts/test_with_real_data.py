#!/usr/bin/env python3
"""使用实际考试数据测试判题逻辑"""

import json
import re
import sys
from io import StringIO
from typing import List, Dict, Any, Tuple

def extract_function_name(instruction: str) -> str:
    match = re.search(r'定义函数\s+`(\w+)\s*\(', instruction)
    return match[1] if match else '_student_func'

def calculate_score(passed_count: int, total_count: int, weight: int) -> int:
    if total_count == 0:
        return weight
    return round((passed_count / total_count) * weight)

def normalize_output(output: str) -> str:
    return output.strip().replace('\r\n', '\n').replace(' ', '')

def compare_outputs(expected: str, actual: str) -> Tuple[bool, int]:
    norm_expected = normalize_output(expected)
    norm_actual = normalize_output(actual)
    matched = norm_expected == norm_actual
    diff_lines = 0
    if not matched:
        diff_lines = abs(len(norm_expected.split('\n')) - len(norm_actual.split('\n')))
    return matched, diff_lines

def test_function(code: str, func_name: str, mock_inputs: List[Dict]) -> Dict:
    """测试函数"""
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
    """测试输出"""
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

    matched, _ = compare_outputs(expected, output)
    return {'passed': matched, 'expected': expected, 'actual': output.strip()}

def run_exam_tests(exam_file: str, version: str):
    """运行考试的所有测试"""
    with open(exam_file, 'r', encoding='utf-8') as f:
        exam = json.load(f)

    print(f"\n{'='*60}")
    print(f"测试: {exam['title']} ({version}卷)")
    print(f"{'='*60}")

    results = []
    for q in exam['questions']:
        qid = q['id']
        qtype = q['type']
        title = q['title']
        weight = q.get('scoring', {}).get('points', 10) if 'scoring' in q else 10

        print(f"\n【{qid}】{title} ({qtype}) - 权重: {weight}")

        if qtype == 'function':
            func_name = extract_function_name(q['instruction'])
            mock_inputs = q.get('testConfig', {}).get('mockInputs', [])

            if not mock_inputs:
                print(f"  ⚠️ 警告: 没有mockInputs测试用例!")
                # 尝试从expected推断
                expected = q.get('testConfig', {}).get('expected')
                if expected:
                    mock_inputs = [{'args': [], 'expected': expected}]
                    print(f"  使用expected作为默认测试: {expected}")

            if mock_inputs:
                result = test_function(q['initialCode'] + '\n' + code_snippet(q), func_name, mock_inputs)

                if 'error' in result:
                    print(f"  错误: {result['error']}")
                else:
                    print(f"  通过: {result['passed']}/{result['total']}")
                    for r in result.get('results', []):
                        if not r.get('passed'):
                            print(f"    ✗ args={r['args']}, expected={r['expected']}, actual={r.get('actual', r.get('error'))}")
            else:
                print(f"  ⚠️ 无法测试: 没有测试用例")
                result = {'passed': 0, 'total': 0}

            # 验证函数名提取
            print(f"  函数名: {func_name}")

        elif qtype == 'output':
            expected = q.get('testConfig', {}).get('expected', '')
            if not expected:
                print(f"  ⚠️ 警告: 没有expected!")
                result = {'passed': False}
            else:
                # 尝试提取示例代码
                result = test_output(code_snippet(q), expected)
                if 'error' in result:
                    print(f"  错误: {result['error']}")
                else:
                    print(f"  通过: {'✓' if result['passed'] else '✗'}")
                    if not result['passed']:
                        print(f"    预期: {result['expected'][:50]}...")
                        print(f"    实际: {result['actual'][:50]}..." if result['actual'] else '    实际: (空)')

    return results

def code_snippet(q: Dict) -> str:
    """从题目生成测试代码"""
    title = q['title']

    # 为常见题型生成示例答案
    if '阶乘' in title:
        return """
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
"""
    elif '质数' in title or 'is_prime' in q.get('instruction', ''):
        return """
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
    elif '乘法表' in title:
        return """
for i in range(1, 6):
    row = []
    for j in range(1, i + 1):
        row.append(f"{j}×{i}={i*j}")
    print(' '.join(row))
"""
    elif '斐波那契' in title:
        return """
a, b = 1, 1
print(a, a, b, end=' ')
for _ in range(4):
    a, b = b, a + b
    print(b, end=' ')
"""
    elif '倒计时' in title:
        return """
print(' '.join(str(i) for i in range(10, 0, -1)))
"""
    elif '列表去重' in title:
        return """
def remove_duplicates(lst):
    seen = []
    for item in lst:
        if item not in seen:
            seen.append(item)
    return seen
"""
    elif '字符串反转' in title:
        return """
def reverse_string(s):
    return s[::-1]
"""
    elif '回文' in title:
        return """
def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
"""
    elif '列表排序' in title:
        return """
def sort_list(lst):
    return sorted(lst)
"""
    elif '计算总和' in title or '求和' in title:
        return """
def calculate_sum(lst):
    return sum(lst)
"""
    elif '字符串大写' in title:
        return """
def to_uppercase(s):
    return s.upper()
"""
    elif '字符串小写' in title:
        return """
def to_lowercase(s):
    return s.lower()
"""
    elif '判断偶数' in title:
        return """
def is_even(n):
    return n % 2 == 0
"""
    elif '判断奇数' in title:
        return """
def is_odd(n):
    return n % 2 != 0
"""
    elif '列表反转' in title:
        return """
def reverse_list(lst):
    return lst[::-1]
"""
    elif '字典合并' in title:
        return """
def merge_dicts(d1, d2):
    result = d1.copy()
    result.update(d2)
    return result
"""
    elif '字典键值反转' in title:
        return """
def invert_dict(d):
    return {v: k for k, v in d.items()}
"""
    elif '统计字符' in title:
        return """
def count_chars(s):
    result = {}
    for c in s:
        result[c] = result.get(c, 0) + 1
    return result
"""
    elif '字符串计数' in title:
        return """
def count_words(s):
    words = s.split()
    result = {}
    for w in words:
        result[w] = result.get(w, 0) + 1
    return result
"""
    elif '计算平均值' in title:
        return """
def calculate_average(lst):
    return sum(lst) / len(lst) if lst else 0.0
"""
    elif '列表元素类型' in title:
        return """
def get_types(lst):
    return [type(x).__name__ for x in lst]
"""
    elif '过滤' in title:
        return """
def filter_positive(lst):
    return [x for x in lst if x > 0]
"""
    elif '连接' in title and '字符串' in title:
        return """
def join_strings(strs, separator):
    return separator.join(strs)
"""
    elif '分割' in title:
        return """
def split_string(s, delimiter):
    return s.split(delimiter)
"""
    elif '替换' in title:
        return """
def replace_string(s, old, new):
    return s.replace(old, new)
"""
    elif '判断数字' in title:
        return """
def is_number(s):
    try:
        float(s)
        return True
    except:
        return False
"""
    elif '字符串长度' in title:
        return """
def string_length(s):
    return len(s)
"""
    elif '最大值' in title:
        return """
def find_max(lst):
    return max(lst) if lst else None
"""
    elif '交集' in title:
        return """
def list_intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))
"""
    elif '字典值排序' in title:
        return """
def sort_dict_values(d):
    return sorted(d.keys(), key=lambda k: d[k])
"""
    elif '首字母大写' in title:
        return """
def capitalize_words(s):
    return s.title()
"""
    elif '筛选' in title and '偶数' in title:
        return """
def filter_even(lst):
    return [x for x in lst if x % 2 == 0]
"""
    elif '列表元素平方' in title or 'square' in title.lower():
        return """
def square_elements(lst):
    return [x * x for x in lst]
"""
    else:
        return f"# TODO: 实现 {title}"

def main():
    import os

    exam_dir = '/workspace/py-learning/public/data/exam'

    # 测试期末考试A卷
    run_exam_tests(f'{exam_dir}/final_exam_A.json', 'A')

    # 测试期中考试
    # run_exam_tests(f'{exam_dir}/mid_term.json', 'mid')

    print(f"\n{'='*60}")
    print("测试完成")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
