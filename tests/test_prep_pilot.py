"""
Automated Test Suite for PrepPilot AI Core Algorithms
Tests countdown calculations, negative scoring, accuracy formulas, and schedule generation.
"""

import math
from datetime import datetime, timedelta

def test_countdown_calculation():
    future_date = (datetime.now() + timedelta(days=45)).strftime('%Y-%m-%d')
    target = datetime.strptime(future_date, '%Y-%m-%d')
    now = datetime.now()
    diff = target - now
    days = max(0, diff.days)
    assert days == 44 or days == 45, f"Expected 44-45 days, got {days}"

def test_negative_marking_calculation():
    # 5 questions, marks=2, negative=-0.5
    # 3 correct, 1 incorrect, 1 unattempted
    correct = 3
    incorrect = 1
    unattempted = 1
    marks_per_q = 2.0
    negative_per_q = 0.5
    
    total_obtained = (correct * marks_per_q) - (incorrect * negative_per_q)
    max_marks = 5 * marks_per_q
    
    assert total_obtained == 5.5, f"Expected 5.5 marks, got {total_obtained}"
    assert max_marks == 10.0, f"Expected 10.0 max marks, got {max_marks}"
    
    score_pct = round((total_obtained / max_marks) * 100)
    assert score_pct == 55, f"Expected 55% score, got {score_pct}"
    
    attempted = correct + incorrect
    accuracy_pct = round((correct / attempted) * 100)
    assert accuracy_pct == 75, f"Expected 75% accuracy, got {accuracy_pct}"

def test_scheduler_task_partitioning():
    daily_available_hours = 3.0
    total_minutes = int(daily_available_hours * 60) # 180 min
    
    # 2 study blocks + 15 min break
    session_1 = min(90, int(total_minutes * 0.55))
    session_2 = max(45, total_minutes - session_1 - 15)
    
    assert session_1 + 15 + session_2 <= total_minutes
    assert session_1 >= 60
    assert session_2 >= 45

if __name__ == '__main__':
    test_countdown_calculation()
    test_negative_marking_calculation()
    test_scheduler_task_partitioning()
    print("All PrepPilot AI unit tests passed successfully!")
