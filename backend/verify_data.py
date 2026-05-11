import sqlite3
conn = sqlite3.connect('data/houqin.db')
cur = conn.cursor()

print("=== 专业项目 ===")
cur.execute('SELECT id, department, name, phase_count, person FROM professional_projects LIMIT 5')
for r in cur.fetchall():
    print(f"  id={r[0]}, dept={r[1]}, name={r[2]}, phases={r[3]}, person={r[4]}")

print("\n=== 阶段数据 ===")
cur.execute('SELECT p.name, pp.phase_order, pp.phase_name FROM professional_project_phases pp JOIN professional_projects p ON p.id=pp.project_id LIMIT 6')
for r in cur.fetchall():
    print(f"  {r[0]} -> {r[1]}.{r[2]}")

print("\n=== 信息化 ===")
cur.execute('SELECT id, category, name FROM it_projects LIMIT 5')
for r in cur.fetchall():
    print(f"  id={r[0]}, cat={r[1]}, name={r[2]}")

print(f"\n=== IT阶段: {cur.execute('SELECT COUNT(*) FROM it_project_phases').fetchone()[0]} 条 ===")

print(f"\n=== 月度状态: {cur.execute('SELECT COUNT(*) FROM employee_monthly_status').fetchone()[0]} 条 ===")

print("\n=== 员工 ===")
cur.execute('SELECT name, post, department_name, education FROM employees LIMIT 5')
for r in cur.fetchall():
    print(f"  {r[0]}, {r[1]}, {r[2]}, {r[3]}")

print("\n=== 财务指标 ===")
cur.execute('SELECT indicator_name, value, unit FROM financial_indicators')
for r in cur.fetchall():
    print(f"  {r[0]}={r[1]} {r[2]}")

conn.close()
