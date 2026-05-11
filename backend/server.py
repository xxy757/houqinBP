"""
后勤部四项规划统筹管理系统 - API 服务器
"""
import sqlite3
import os
from datetime import date
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'houqin.db')

app = FastAPI(title='后勤部四项规划 API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_rows(cur, sql, params=()):
    cur.execute(sql, params)
    return [dict(r) for r in cur.fetchall()]


def dict_one(cur, sql, params=()):
    cur.execute(sql, params)
    r = cur.fetchone()
    return dict(r) if r else None


# ==================== Dashboard ====================

@app.get('/api/dashboard')
def dashboard():
    conn = get_db()
    cur = conn.cursor()

    proj_count = cur.execute('SELECT COUNT(*) FROM professional_projects').fetchone()[0]
    it_count = cur.execute('SELECT COUNT(*) FROM it_projects').fetchone()[0]

    # IT project status derived from phases
    it_done = cur.execute('SELECT COUNT(*) FROM it_projects WHERE solve LIKE ?', ('%已完成%',)).fetchone()[0]

    emp_count = cur.execute('SELECT COUNT(*) FROM employees').fetchone()[0]

    # Budget total
    total_budget = cur.execute(
        'SELECT SUM(CAST(budget_num AS REAL)) FROM financial_budget WHERE budget_num IS NOT NULL'
    ).fetchone()[0] or 0

    # Top professional projects
    top_proj = dict_rows(cur, """
        SELECT id, department, name, goal, person, start_date, end_date, duration, phase_count
        FROM professional_projects ORDER BY id LIMIT 8
    """)

    # Calculate progress for each project using phases
    for p in top_proj:
        phase_names = [r[0] for r in cur.execute(
            'SELECT phase_name FROM professional_project_phases WHERE project_id = ? ORDER BY phase_order',
            (p['id'],)
        ).fetchall()]
        p['phases'] = [{'name': n} for n in phase_names]

    # Top IT projects
    top_it = dict_rows(cur, """
        SELECT id, category as "main", name as "sub", goal, owner as person,
               start_date, end_date, duration, solve, difficulty
        FROM it_projects ORDER BY id LIMIT 8
    """)

    # Department distribution from professional projects
    dept_dist = dict_rows(cur, """
        SELECT department as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM professional_projects), 1) as rate_pct
        FROM professional_projects
        GROUP BY department ORDER BY count DESC
    """)

    # Budget categories from budget table
    budget_cats = dict_rows(cur, """
        SELECT category as cat, department,
               SUM(CAST(budget_num AS REAL)) as budget
        FROM financial_budget
        WHERE budget_num IS NOT NULL
        GROUP BY category
        ORDER BY budget DESC
    """)

    total_sum = sum(b['budget'] or 0 for b in budget_cats)
    for b in budget_cats:
        b['rate'] = f"{round(b['budget'] / total_sum * 100) if total_sum else 0}%"

    conn.close()

    return {
        'kpi': {
            'proj_count': proj_count,
            'it_count': it_count,
            'it_done': it_done,
            'it_doing_planning': it_count - it_done,
            'emp_count': emp_count,
            'emp_target': 48,
            'total_budget': round(total_budget / 10000) if total_budget > 1000 else round(total_budget),
            'q1_actual': 540,
        },
        'top_projects': top_proj,
        'top_it_projects': top_it,
        'dept_distribution': dept_dist,
        'finance_categories': budget_cats,
    }


# ==================== Professional Projects ====================

@app.get('/api/professional-projects')
def professional_projects():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, """
        SELECT id, department as dept, name, goal, context, deliverable,
               person, start_date as start, end_date as "end", duration as period, phase_count as phases
        FROM professional_projects ORDER BY id
    """)
    for p in rows:
        phase_rows = dict_rows(cur, """
            SELECT phase_order, phase_name as name, phase_content
            FROM professional_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (p['id'],))
        p['phaseList'] = phase_rows
    conn.close()
    return rows


@app.get('/api/professional-projects/{project_id}')
def professional_project_detail(project_id: int):
    conn = get_db()
    cur = conn.cursor()
    proj = dict_one(cur, """
        SELECT id, department as dept, name, goal, context, deliverable,
               person, start_date as start, end_date as "end", duration as period, phase_count as phases
        FROM professional_projects WHERE id = ?
    """, (project_id,))
    if proj:
        proj['phaseList'] = dict_rows(cur, """
            SELECT phase_order, phase_name as name, phase_content
            FROM professional_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (project_id,))
    conn.close()
    return proj or {}


# ==================== IT Projects ====================

@app.get('/api/it-projects')
def it_projects():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, """
        SELECT id, category as "main", name as "sub", goal, context, deliverable,
               owner as person, start_date, end_date, duration as period, difficulty as issue, solve, phase_count
        FROM it_projects ORDER BY id
    """)
    for p in rows:
        phase_rows = dict_rows(cur, """
            SELECT phase_order, phase_name as name, phase_content
            FROM it_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (p['id'],))
        p['phaseList'] = phase_rows
    conn.close()
    return rows


# ==================== HR ====================

@app.get('/api/hr/employees')
def hr_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
):
    conn = get_db()
    cur = conn.cursor()
    total = cur.execute('SELECT COUNT(*) FROM employees').fetchone()[0]
    offset = (page - 1) * page_size
    today = date.today()
    rows = dict_rows(cur, f"""
        SELECT id, employee_id, name, post, department_name as dept, education as edu,
               age, entry_date, professional_match as match, gender, status
        FROM employees
        ORDER BY id LIMIT ? OFFSET ?
    """, (page_size, offset))
    for r in rows:
        if r.get('entry_date'):
            try:
                d = date.fromisoformat(r['entry_date'][:10])
                r['service'] = round((today - d).days / 365.25, 1)
            except Exception:
                r['service'] = 0
        else:
            r['service'] = 0
    conn.close()
    return {'data': rows, 'total': total, 'page': page, 'page_size': page_size}


@app.get('/api/hr/distributions')
def hr_distributions():
    conn = get_db()
    cur = conn.cursor()

    today = date.today()

    # Education
    edu = dict_rows(cur, """
        SELECT education as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE education IS NOT NULL), 1) as rate
        FROM employees WHERE education IS NOT NULL
        GROUP BY education ORDER BY count DESC
    """)

    # Age groups
    age_all = [r[0] for r in cur.execute('SELECT age FROM employees WHERE age IS NOT NULL').fetchall()]
    avg_age = round(sum(age_all) / len(age_all), 2) if age_all else 0
    age_groups = {'20-25': 0, '26-30': 0, '31-35': 0, '36-40': 0, '40+': 0}
    for a in age_all:
        if a <= 25: age_groups['20-25'] += 1
        elif a <= 30: age_groups['26-30'] += 1
        elif a <= 35: age_groups['31-35'] += 1
        elif a <= 40: age_groups['36-40'] += 1
        else: age_groups['40+'] += 1
    total_age = len(age_all) or 1
    age_dist = [{'label': k, 'count': v, 'rate': f"{round(v / total_age * 100)}%"} for k, v in age_groups.items()]

    # Gender
    gender = dict_rows(cur, """
        SELECT gender as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE gender IS NOT NULL)) || '%' as rate
        FROM employees WHERE gender IS NOT NULL GROUP BY gender
    """)

    # Average service years
    services = []
    for r in cur.execute('SELECT entry_date FROM employees WHERE entry_date IS NOT NULL'):
        try:
            d = date.fromisoformat(r[0][:10])
            services.append(round((today - d).days / 365.25, 1))
        except Exception:
            pass
    avg_service = round(sum(services) / len(services), 2) if services else 0

    edu_above = cur.execute("SELECT COUNT(*) FROM employees WHERE education IN ('本科','硕士','博士')").fetchone()[0]
    above_pct = round(edu_above / total_age * 100) if total_age else 0

    # Post distribution (for HR department breakdown)
    post_dist = dict_rows(cur, """
        SELECT post as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE post IS NOT NULL)) || '%' as rate
        FROM employees WHERE post IS NOT NULL
        GROUP BY post ORDER BY count DESC
    """)

    conn.close()
    return {
        'summary': {
            'total': total_age,
            'avg_age': avg_age,
            'avg_service': avg_service,
            'above_bachelor_pct': above_pct,
        },
        'education': edu,
        'age': age_dist,
        'gender': gender,
        'post_distribution': post_dist,
    }


@app.get('/api/hr/plan-kpi')
def hr_plan_kpi():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, 'SELECT * FROM hr_plan_kpi ORDER BY id')
    result = []
    for r in rows:
        months = [r.get(f'm{i}') for i in range(1, 13)]
        result.append({
            'item': r.get('indicator', ''),
            'target': r.get('target', ''),
            'data': months,
        })
    conn.close()
    return result


@app.get('/api/hr/monthly-changes')
def hr_monthly_changes():
    conn = get_db()
    cur = conn.cursor()

    # Find employees who have status changes (status not '在岗')
    changed_names = set()
    for r in cur.execute("""
        SELECT DISTINCT employee_name FROM employee_monthly_status
        WHERE status IS NOT NULL AND status != '在岗' AND status != ''
    """):
        changed_names.add(r[0])

    if not changed_names:
        conn.close()
        return []

    employees_info = {}
    for name in changed_names:
        emp = dict_one(cur, 'SELECT name, department_name as dept, post FROM employees WHERE name = ?', (name,))
        if emp:
            months = {}
            for r in cur.execute(
                'SELECT month, status FROM employee_monthly_status WHERE employee_name = ? ORDER BY month',
                (name,)
            ):
                months[r[0]] = r[1]
            emp['m4'] = months.get(4, '在岗')
            emp['m5'] = months.get(5, '在岗')
            emp['m6'] = months.get(6, '在岗')
            emp['m7'] = months.get(7, '在岗')
            emp['m8'] = months.get(8, '在岗')
            employees_info[name] = emp

    conn.close()
    return list(employees_info.values())


# ==================== Finance ====================

@app.get('/api/finance/indicators')
def finance_indicators():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, 'SELECT * FROM financial_indicators ORDER BY id')

    # Calculate derived indicators
    total_budget = cur.execute(
        'SELECT SUM(CAST(budget_num AS REAL)) FROM financial_budget WHERE budget_num IS NOT NULL'
    ).fetchone()[0] or 0

    conn.close()

    return {
        'summary': {
            'total_budget': round(total_budget / 10000) if total_budget > 1000 else round(total_budget),
            'q1_actual': 540,
            'execution_rate': f"{round(540 / (total_budget / 10000) * 100, 2)}%" if total_budget else '0%',
            'remaining': round((total_budget / 10000) - 540) if total_budget else 0,
        },
        'indicators': rows,
    }


@app.get('/api/finance/budget')
def finance_budget():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, """
        SELECT id, category as cat, department,
               m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12,
               total, CAST(budget_num AS REAL) as budget
        FROM financial_budget ORDER BY id
    """)
    conn.close()
    return rows


@app.get('/api/finance/timeline')
def finance_timeline():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, """
        SELECT id, phase_name, seq, task_name, responsible,
               time_range, action_desc, precondition, deliverable
        FROM financial_timeline ORDER BY seq
    """)
    conn.close()

    phases: dict[str, dict] = {}
    for r in rows:
        pname = r['phase_name']
        # Simplify phase name
        short = pname
        if '：' in pname:
            short = pname.split('：')[0]
        elif '阶段' in pname:
            idx = pname.index('阶段')
            end = pname.index('（') if '（' in pname else len(pname)
            short = pname[idx:end]

        if short not in phases:
            phases[short] = {
                'phase': short,
                'date': '',
                'items': [],
            }

        if r.get('time_range'):
            if not phases[short]['date']:
                phases[short]['date'] = r['time_range']
        phases[short]['items'].append(r['task_name'])

    return list(phases.values())


@app.get('/api/finance/reduction')
def finance_reduction():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, """
        SELECT id, section, cost_subject as subject, year_2025_actual as prev,
               year_budget as curr, change_rate as change, detail_item as detail,
               category, priority as level, reduction_plan as plan
        FROM financial_reduction ORDER BY id
    """)
    conn.close()
    return rows


# ==================== Department Key Items ====================

@app.get('/api/department-key-items')
def department_key_items():
    conn = get_db()
    cur = conn.cursor()
    rows = dict_rows(cur, 'SELECT * FROM department_key_items ORDER BY id')
    conn.close()
    return rows


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)
