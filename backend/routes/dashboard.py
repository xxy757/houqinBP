"""驾驶舱总览 - KPI + 四维概览"""
from fastapi import APIRouter
from database import get_db

router = APIRouter()


@router.get("/dashboard")
def dashboard():
    db = get_db()
    cur = db.cursor()

    proj_count = cur.execute("SELECT COUNT(*) FROM professional_projects").fetchone()[0]
    it_count = cur.execute("SELECT COUNT(*) FROM it_projects").fetchone()[0]

    it_done = cur.execute(
        "SELECT COUNT(*) FROM it_projects WHERE solve LIKE ?", ("%已完成%",)
    ).fetchone()[0]

    emp_count = cur.execute("SELECT COUNT(*) FROM employees").fetchone()[0]

    total_budget = cur.execute(
        "SELECT SUM(CAST(budget_num AS REAL)) FROM financial_budget WHERE budget_num IS NOT NULL"
    ).fetchone()[0] or 0

    top_proj = [
        dict(r) for r in cur.execute("""
            SELECT id, department, name, goal, person, start_date, end_date, duration, phase_count
            FROM professional_projects ORDER BY id LIMIT 8
        """).fetchall()
    ]

    for p in top_proj:
        phase_names = [
            r[0] for r in cur.execute(
                "SELECT phase_name FROM professional_project_phases WHERE project_id = ? ORDER BY phase_order",
                (p["id"],),
            ).fetchall()
        ]
        p["phases"] = [{"name": n} for n in phase_names]

    top_it = [
        dict(r) for r in cur.execute("""
            SELECT id, category as main, name as sub, goal, owner as person,
                   start_date, end_date, duration, solve, difficulty
            FROM it_projects ORDER BY id LIMIT 8
        """).fetchall()
    ]

    dept_dist = [
        dict(r) for r in cur.execute("""
            SELECT department as label, COUNT(*) as count,
                   ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM professional_projects), 1) as rate_pct
            FROM professional_projects
            GROUP BY department ORDER BY count DESC
        """).fetchall()
    ]

    budget_cats = [
        dict(r) for r in cur.execute("""
            SELECT category as cat, department,
                   SUM(CAST(budget_num AS REAL)) as budget
            FROM financial_budget
            WHERE budget_num IS NOT NULL
            GROUP BY category
            ORDER BY budget DESC
        """).fetchall()
    ]

    total_sum = sum(b["budget"] or 0 for b in budget_cats)
    for b in budget_cats:
        b["rate"] = f"{round(b['budget'] / total_sum * 100) if total_sum else 0}%"

    db.close()

    return {
        "kpi": {
            "proj_count": proj_count,
            "it_count": it_count,
            "it_done": it_done,
            "it_doing_planning": it_count - it_done,
            "emp_count": emp_count,
            "emp_target": 48,
            "total_budget": round(total_budget / 10000) if total_budget > 1000 else round(total_budget),
            "q1_actual": 540,
        },
        "top_projects": top_proj,
        "top_it_projects": top_it,
        "dept_distribution": dept_dist,
        "finance_categories": budget_cats,
    }
