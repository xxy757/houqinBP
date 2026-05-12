"""财务管控 API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()


class BudgetCreate(BaseModel):
    category: Optional[str] = None
    department: Optional[str] = None
    m1: Optional[str] = None
    m2: Optional[str] = None
    m3: Optional[str] = None
    m4: Optional[str] = None
    m5: Optional[str] = None
    m6: Optional[str] = None
    m7: Optional[str] = None
    m8: Optional[str] = None
    m9: Optional[str] = None
    m10: Optional[str] = None
    m11: Optional[str] = None
    m12: Optional[str] = None
    total: Optional[str] = None
    budget_num: Optional[str] = None


class ReductionCreate(BaseModel):
    section: Optional[str] = None
    cost_subject: Optional[str] = None
    year_2025_actual: Optional[float] = None
    year_budget: Optional[float] = None
    change_rate: Optional[str] = None
    detail_item: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    reduction_plan: Optional[str] = None


@router.get("/indicators")
def get_indicators():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("SELECT * FROM financial_indicators ORDER BY id").fetchall()]

    total_budget = cur.execute(
        "SELECT SUM(CAST(budget_num AS REAL)) FROM financial_budget WHERE budget_num IS NOT NULL"
    ).fetchone()[0] or 0

    db.close()
    return {
        "summary": {
            "total_budget": round(total_budget / 10000) if total_budget > 1000 else round(total_budget),
            "q1_actual": 540,
            "execution_rate": f"{round(540 / (total_budget / 10000) * 100, 2)}%" if total_budget else "0%",
            "remaining": round((total_budget / 10000) - 540) if total_budget else 0,
        },
        "indicators": rows,
    }


@router.get("/budget")
def get_budget():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("""
        SELECT id, category as cat, department,
               m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12,
               total, CAST(budget_num AS REAL) as budget
        FROM financial_budget ORDER BY id
    """).fetchall()]
    db.close()
    return rows


@router.post("/budget")
def create_budget(data: BudgetCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM financial_budget")
    new_id = cur.fetchone()[0]
    cur.execute("""
        INSERT INTO financial_budget (id, category, department,
            m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, total, budget_num)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (new_id, data.category, data.department,
          data.m1, data.m2, data.m3, data.m4, data.m5, data.m6,
          data.m7, data.m8, data.m9, data.m10, data.m11, data.m12,
          data.total, data.budget_num))
    db.commit()
    db.close()
    return {"id": new_id, "message": "创建成功"}


@router.put("/budget/{budget_id}")
def update_budget(budget_id: int, data: BudgetCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM financial_budget WHERE id=?", (budget_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="预算项不存在")
    cur.execute("""
        UPDATE financial_budget SET category=?, department=?,
            m1=?, m2=?, m3=?, m4=?, m5=?, m6=?, m7=?, m8=?, m9=?, m10=?, m11=?, m12=?,
            total=?, budget_num=?
        WHERE id=?
    """, (data.category, data.department,
          data.m1, data.m2, data.m3, data.m4, data.m5, data.m6,
          data.m7, data.m8, data.m9, data.m10, data.m11, data.m12,
          data.total, data.budget_num, budget_id))
    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/budget/{budget_id}")
def delete_budget(budget_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM financial_budget WHERE id=?", (budget_id,))
    if cur.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="预算项不存在")
    db.commit()
    db.close()
    return {"message": "删除成功"}


@router.get("/timeline")
def get_timeline():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("""
        SELECT id, phase_name, seq, task_name, responsible,
               time_range, action_desc, precondition, deliverable
        FROM financial_timeline ORDER BY seq
    """).fetchall()]
    db.close()

    phases: dict[str, dict] = {}
    for r in rows:
        pname = r["phase_name"]
        short = pname
        if "：" in pname:
            short = pname.split("：")[0]
        elif "阶段" in pname:
            idx = pname.index("阶段")
            end = pname.index("（") if "（" in pname else len(pname)
            short = pname[idx:end]

        if short not in phases:
            phases[short] = {
                "phase": short,
                "date": "",
                "items": [],
            }

        if r.get("time_range"):
            if not phases[short]["date"]:
                phases[short]["date"] = r["time_range"]
        phases[short]["items"].append(r["task_name"])

    return list(phases.values())


@router.get("/reduction")
def get_reduction():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("""
        SELECT id, section, cost_subject as subject, year_2025_actual as prev,
               year_budget as curr, change_rate as change, detail_item as detail,
               category, priority as level, reduction_plan as plan
        FROM financial_reduction ORDER BY id
    """).fetchall()]
    db.close()
    return rows


@router.post("/reduction")
def create_reduction(data: ReductionCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM financial_reduction")
    new_id = cur.fetchone()[0]
    cur.execute("""
        INSERT INTO financial_reduction (id, section, cost_subject, year_2025_actual,
            year_budget, change_rate, detail_item, category, priority, reduction_plan)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (new_id, data.section, data.cost_subject, data.year_2025_actual,
          data.year_budget, data.change_rate, data.detail_item, data.category,
          data.priority, data.reduction_plan))
    db.commit()
    db.close()
    return {"id": new_id, "message": "创建成功"}


@router.put("/reduction/{reduction_id}")
def update_reduction(reduction_id: int, data: ReductionCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM financial_reduction WHERE id=?", (reduction_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="降费项不存在")
    cur.execute("""
        UPDATE financial_reduction SET section=?, cost_subject=?, year_2025_actual=?,
            year_budget=?, change_rate=?, detail_item=?, category=?, priority=?, reduction_plan=?
        WHERE id=?
    """, (data.section, data.cost_subject, data.year_2025_actual,
          data.year_budget, data.change_rate, data.detail_item, data.category,
          data.priority, data.reduction_plan, reduction_id))
    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/reduction/{reduction_id}")
def delete_reduction(reduction_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM financial_reduction WHERE id=?", (reduction_id,))
    if cur.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="降费项不存在")
    db.commit()
    db.close()
    return {"message": "删除成功"}
