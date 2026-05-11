"""驾驶舱总览 - KPI + 四维概览"""
from fastapi import APIRouter
from database import get_db

router = APIRouter()


@router.get("/dashboard")
def dashboard():
    db = get_db()
    cur = db.cursor()

    # 专业项目统计
    cur.execute("SELECT COUNT(*) FROM professional_projects")
    proj_total = cur.fetchone()[0]

    # 信息化项目统计
    cur.execute("SELECT COUNT(*) FROM it_projects")
    it_total = cur.fetchone()[0]

    # 人力统计
    cur.execute("SELECT COUNT(*) FROM employees")
    hr_total = cur.fetchone()[0]

    # 财务指标
    cur.execute("SELECT indicator_name, value, unit FROM financial_indicators")
    fin_indicators = [dict(r) for r in cur.fetchall()]

    # 专业项目摘要（前8个）
    cur.execute("""
        SELECT id, department, name, duration, person, start_date, end_date, phase_count
        FROM professional_projects ORDER BY id LIMIT 8
    """)
    proj_list = [dict(r) for r in cur.fetchall()]

    # 信息化项目摘要
    cur.execute("""
        SELECT id, category, name, duration, difficulty
        FROM it_projects ORDER BY id LIMIT 8
    """)
    it_list = [dict(r) for r in cur.fetchall()]

    # 部门人力分布
    cur.execute("""
        SELECT department_name as dept, COUNT(*) as count,
               ROUND(COUNT(*)*100.0/(SELECT COUNT(*) FROM employees), 1) as rate
        FROM employees WHERE department_name IS NOT NULL
        GROUP BY department_name ORDER BY count DESC
    """)
    dept_dist = [dict(r) for r in cur.fetchall()]

    # 费用结构（取第一条预算数据）
    cur.execute("SELECT category, budget_num FROM financial_budget WHERE budget_num IS NOT NULL LIMIT 8")
    fin_struct = [dict(r) for r in cur.fetchall()]

    db.close()
    return {
        "kpi": {
            "proj_total": proj_total,
            "it_total": it_total,
            "hr_total": hr_total,
            "fin_indicators": fin_indicators,
        },
        "proj_summary": proj_list,
        "it_summary": it_list,
        "dept_distribution": dept_dist,
        "fin_structure": fin_struct,
    }
