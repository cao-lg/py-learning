#!/usr/bin/env python3
"""为所有函数题添加mockInputs测试用例"""

import json
import os
import re

def extract_function_name(instruction):
    """从instruction中提取函数名"""
    match = re.search(r'定义函数\s+`(\w+)\s*\(', instruction)
    if match:
        return match[1]
    return None

def extract_example_args(instruction, func_name):
    """从instruction中提取示例参数"""
    # 尝试从示例中提取参数
    examples = []
    
    # 匹配类似 [1, 3, 2, 2, 1] → [1, 3, 2] 的格式
    lines = instruction.split('\n')
    for line in lines:
        if '→' in line or '->' in line:
            # 提取输入部分
            parts = line.split('→') if '→' in line else line.split('->')
            if len(parts) >= 2:
                input_part = parts[0].strip()
                # 尝试解析输入
                try:
                    # 如果是列表/字典格式
                    if input_part.startswith('[') or input_part.startswith('{'):
                        # 可能是单个参数
                        examples.append({'args': [input_part], 'raw': input_part})
                    elif input_part.startswith("'") or input_part.startswith('"'):
                        examples.append({'args': [input_part], 'raw': input_part})
                    else:
                        # 可能是数字或多个参数
                        examples.append({'args': [input_part], 'raw': input_part})
                except:
                    pass
    
    return examples

def generate_mock_inputs_for_question(q):
    """为单个题目生成mockInputs"""
    if q['type'] != 'function':
        return None
    
    func_name = extract_function_name(q['instruction'])
    if not func_name:
        return None
    
    expected = q['testConfig'].get('expected')
    mock_inputs = []
    
    # 根据题目类型生成测试用例
    title = q['title']
    
    # 预定义的测试用例模板
    test_templates = {
        '列表去重': [
            {'args': [[1, 3, 2, 2, 1]], 'expected': [1, 3, 2]},
            {'args': [['a', 'b', 'a', 'c']], 'expected': ['a', 'b', 'c']},
            {'args': [[]], 'expected': []},
        ],
        '字典合并': [
            {'args': [{'a': 1, 'b': 2}, {'b': 3, 'c': 4}], 'expected': {'a': 1, 'b': 3, 'c': 4}},
            {'args': [{}, {'x': 10}], 'expected': {'x': 10}},
        ],
        '字符串计数': [
            {'args': ['hello world hello'], 'expected': {'hello': 2, 'world': 1}},
            {'args': ['python python python'], 'expected': {'python': 3}},
            {'args': [''], 'expected': {}},
        ],
        '列表排序': [
            {'args': [[3, 1, 4, 1, 5]], 'expected': [1, 1, 3, 4, 5]},
            {'args': [['c', 'a', 'b']], 'expected': ['a', 'b', 'c']},
        ],
        '判断回文': [
            {'args': ['racecar'], 'expected': True},
            {'args': ['hello'], 'expected': False},
            {'args': ['A man, a plan, a canal: Panama'], 'expected': True},
        ],
        '计算总和': [
            {'args': [[1, 2, 3, 4, 5]], 'expected': 15},
            {'args': [[10, -5, 3]], 'expected': 8},
            {'args': [[]], 'expected': 0},
        ],
        '字符串反转': [
            {'args': ['hello'], 'expected': 'olleh'},
            {'args': ['python'], 'expected': 'nohtyp'},
            {'args': [''], 'expected': ''},
        ],
        '列表元素平方': [
            {'args': [[1, 2, 3, 4]], 'expected': [1, 4, 9, 16]},
            {'args': [[-2, 0, 5]], 'expected': [4, 0, 25]},
            {'args': [[]], 'expected': []},
        ],
        '字符串分割': [
            {'args': ['hello,world,python', ','], 'expected': ['hello', 'world', 'python']},
            {'args': ['1-2-3-4', '-'], 'expected': ['1', '2', '3', '4']},
        ],
        '判断数字': [
            {'args': ['123'], 'expected': True},
            {'args': ['3.14'], 'expected': True},
            {'args': ['hello'], 'expected': False},
        ],
        '列表反转': [
            {'args': [[1, 2, 3]], 'expected': [3, 2, 1]},
            {'args': [['a', 'b', 'c']], 'expected': ['c', 'b', 'a']},
            {'args': [[]], 'expected': []},
        ],
        '字典键值反转': [
            {'args': [{'a': 1, 'b': 2}], 'expected': {1: 'a', 2: 'b'}},
            {'args': [{1: 'x', 2: 'y'}], 'expected': {'x': 1, 'y': 2}},
        ],
        '统计字符出现': [
            {'args': ['hello'], 'expected': {'h': 1, 'e': 1, 'l': 2, 'o': 1}},
            {'args': ['python'], 'expected': {'p': 1, 'y': 1, 't': 1, 'h': 1, 'o': 1, 'n': 1}},
            {'args': [''], 'expected': {}},
        ],
        '字符串大写': [
            {'args': ['hello'], 'expected': 'HELLO'},
            {'args': ['Python'], 'expected': 'PYTHON'},
            {'args': [''], 'expected': ''},
        ],
        '计算平均值': [
            {'args': [[1, 2, 3, 4, 5]], 'expected': 3.0},
            {'args': [[10, 20, 30]], 'expected': 20.0},
            {'args': [[]], 'expected': 0.0},
        ],
        '列表元素类型': [
            {'args': [[1, 'hello', 3.14, True]], 'expected': ['int', 'str', 'float', 'bool']},
            {'args': [[]], 'expected': []},
        ],
        '列表元素过滤': [
            {'args': [[1, -2, 3, -4, 5]], 'expected': [1, 3, 5]},
            {'args': [[-1, -2, -3]], 'expected': []},
            {'args': [[]], 'expected': []},
        ],
        '字符串连接': [
            {'args': [['hello', 'world', 'python'], ' '], 'expected': 'hello world python'},
            {'args': [['a', 'b', 'c'], '-'], 'expected': 'a-b-c'},
        ],
        '判断偶数': [
            {'args': [4], 'expected': True},
            {'args': [7], 'expected': False},
            {'args': [0], 'expected': True},
        ],
        '列表交集': [
            {'args': [[1, 2, 3], [2, 3, 4]], 'expected': [2, 3]},
            {'args': [['a', 'b', 'c'], ['c', 'd', 'e']], 'expected': ['c']},
            {'args': [[], [1, 2, 3]], 'expected': []},
        ],
        '字典值排序': [
            {'args': [{'a': 3, 'b': 1, 'c': 2}], 'expected': ['b', 'c', 'a']},
            {'args': [{'x': 10, 'y': 5, 'z': 15}], 'expected': ['y', 'x', 'z']},
        ],
        '首字母大写': [
            {'args': ['hello world'], 'expected': 'Hello World'},
            {'args': ['python programming'], 'expected': 'Python Programming'},
            {'args': [''], 'expected': ''},
        ],
        '列表元素筛选': [
            {'args': [[1, 2, 3, 4, 5, 6]], 'expected': [2, 4, 6]},
            {'args': [[10, 15, 20, 25]], 'expected': [10, 20]},
            {'args': [[]], 'expected': []},
        ],
        '字符串小写': [
            {'args': ['HELLO'], 'expected': 'hello'},
            {'args': ['Python'], 'expected': 'python'},
            {'args': [''], 'expected': ''},
        ],
        '计算最大值': [
            {'args': [[1, 5, 3, 9, 2]], 'expected': 9},
            {'args': [[-5, -1, -3]], 'expected': -1},
        ],
        '字符串长度': [
            {'args': ['hello'], 'expected': 5},
            {'args': ['python'], 'expected': 6},
            {'args': [''], 'expected': 0},
        ],
        '列表元素求和': [
            {'args': [[1, 2, 3, 4, 5]], 'expected': 15},
            {'args': [[10, -5, 3]], 'expected': 8},
            {'args': [[]], 'expected': 0},
        ],
        '字符串替换': [
            {'args': ['hello world', 'world', 'python'], 'expected': 'hello python'},
            {'args': ['123-456-789', '-', ''], 'expected': '123456789'},
        ],
        '判断奇数': [
            {'args': [3], 'expected': True},
            {'args': [6], 'expected': False},
            {'args': [-1], 'expected': True},
        ],
    }
    
    # 查找匹配的模板
    for key, tests in test_templates.items():
        if key in title:
            return tests
    
    # 如果没有模板，返回空
    return []

def update_exam_file(filepath):
    """更新考试文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = False
    for q in data['questions']:
        if q['type'] == 'function':
            mock_inputs = generate_mock_inputs_for_question(q)
            if mock_inputs and len(mock_inputs) > 0:
                q['testConfig']['mockInputs'] = mock_inputs
                updated = True
                print(f"  Updated: {q['title']} ({q['id']})")
    
    if updated:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved: {filepath}")
    
    return updated

def main():
    exam_dir = '/workspace/py-learning/public/data/exam'
    
    # 处理期末考试A/B/C卷
    for version in ['A', 'B', 'C']:
        filepath = os.path.join(exam_dir, f'final_exam_{version}.json')
        if os.path.exists(filepath):
            print(f"\nProcessing: {filepath}")
            update_exam_file(filepath)
    
    # 处理期中考试
    filepath = os.path.join(exam_dir, 'mid_term.json')
    if os.path.exists(filepath):
        print(f"\nProcessing: {filepath}")
        update_exam_file(filepath)
    
    print("\nDone!")

if __name__ == '__main__':
    main()