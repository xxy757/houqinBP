"""人力资源 API"""
from datetime import date
import json
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db, transaction
from auth import require_permission
from logger import log_operation

router = APIRouter()

PER_PERSON_COST = 10.2


class EmployeeCreate(BaseModel):
    version: Optional[int] = None
    employee_id: Optional[str] = None
    name: str
    post: Optional[str] = None
    department_name: Optional[str] = None
    education: Optional[str] = None
    age: Optional[int] = None
    entry_date: Optional[str] = None
    professional_match: Optional[str] = None
    gender: Optional[str] = None
    status: Optional[str] = "在岗"
    phone: Optional[str] = None


@router.get("/employees")
def hr_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    search: str = Query(""),
    current_user: dict = Depends(require_permission("employees:read")),
):
    db = get_db()
    cur = db.cursor()
    if search:
        like = f"%{search}%"
        total = cur.execute(
            "SELECT COUNT(*) FROM employees WHERE name LIKE ? OR post LIKE ? OR department_name LIKE ?",
            (like, like, like)
        ).fetchone()[0]
    else:
        total = cur.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    offset = (page - 1) * page_size
    today = date.today()
    if search:
        rows = [dict(r) for r in cur.execute(f"""
            SELECT id, employee_id, name, post, department_name as dept, education as edu,
                   age, entry_date, professional_match as match, gender, status, version
            FROM employees
            WHERE name LIKE ? OR post LIKE ? OR department_name LIKE ?
            ORDER BY id LIMIT ? OFFSET ?
        """, (like, like, like, page_size, offset)).fetchall()]
    else:
        rows = [dict(r) for r in cur.execute(f"""
            SELECT id, employee_id, name, post, department_name as dept, education as edu,
                   age, entry_date, professional_match as match, gender, status, version
            FROM employees
            ORDER BY id LIMIT ? OFFSET ?
        """, (page_size, offset)).fetchall()]
    for r in rows:
        if r.get("entry_date"):
            try:
                d = date.fromisoformat(r["entry_date"][:10])
                r["service"] = round((today - d).days / 365.25, 1)
            except Exception:
                r["service"] = 0
        else:
            r["service"] = 0
    db.close()
    return {"data": rows, "total": total, "page": page, "page_size": page_size}


@router.get("/employees/{employee_id_or_id}")
def hr_employee_detail(employee_id_or_id: str, current_user: dict = Depends(require_permission("employees:read"))):
    db = get_db()
    cur = db.cursor()
    emp = None
    try:
        eid = int(employee_id_or_id)
        emp = [dict(r) for r in cur.execute("SELECT * FROM employees WHERE id = ?", (eid,)).fetchall()]
    except ValueError:
        emp = [dict(r) for r in cur.execute("SELECT * FROM employees WHERE employee_id = ?", (employee_id_or_id,)).fetchall()]
    if not emp:
        db.close()
        raise HTTPException(status_code=404, detail="员工不存在")
    db.close()
    return emp[0]


@router.post("/employees")
def create_employee(data: EmployeeCreate, current_user: dict = Depends(require_permission("employees:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM employees")
        new_id = cur.fetchone()[0]
        cur.execute("""
            INSERT INTO employees (id, employee_id, name, post, department_name, education,
                age, entry_date, professional_match, gender, status, phone)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, (new_id, data.employee_id, data.name, data.post, data.department_name,
              data.education, data.age, data.entry_date, data.professional_match,
              data.gender, data.status, data.phone))

        hr_change_desc = f"新增员工: {data.name}"
        hr_posts = data.post or ""
        fin_description = f"新增{data.name}({hr_posts})，按人均{PER_PERSON_COST}万/年计算"
        responsible = current_user.get("display_name", "") or current_user.get("username", "")

        cur.execute("""
            INSERT INTO linkage_mappings
            (proj_id, it_ids, hr_change_desc, hr_headcount, hr_posts,
             hr_month_start, hr_month_end, fin_budget_impact, fin_subjects,
             fin_description, responsible_person)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            None,
            "[]",
            hr_change_desc,
            1,
            hr_posts,
            None,
            None,
            PER_PERSON_COST,
            json.dumps(["工资预算"], ensure_ascii=False),
            fin_description,
            responsible,
        ))

        cur.execute("""
            UPDATE financial_budget SET budget_num = CAST(COALESCE(budget_num, '0') AS REAL) + ?
            WHERE category = '工资预算'
        """, (PER_PERSON_COST * 10000,))

    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "employees", str(new_id), f"新增员工: {data.name}，自动联动财务+{PER_PERSON_COST}万")
    return {"id": new_id, "version": 1, "message": "创建成功"}


@router.put("/employees/{employee_id}")
def update_employee(employee_id: int, data: EmployeeCreate, current_user: dict = Depends(require_permission("employees:write"))):
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        cur = db.cursor()
        existing = cur.execute("SELECT id, version FROM employees WHERE id=?", (employee_id,)).fetchone()
        if not existing:
            db.rollback()
            db.close()
            raise HTTPException(status_code=404, detail="员工不存在")
        current_version = existing["version"]
        requested_version = data.version or current_version
        cur.execute("""
            UPDATE employees SET employee_id=?, name=?, post=?, department_name=?,
            education=?, age=?, entry_date=?, professional_match=?, gender=?, status=?, phone=?,
            version=version+1, updated_at=datetime('now','localtime')
            WHERE id=? AND version=?
        """, (data.employee_id, data.name, data.post, data.department_name,
              data.education, data.age, data.entry_date, data.professional_match,
              data.gender, data.status, data.phone, employee_id, requested_version))
        if cur.rowcount == 0:
            db.rollback()
            db.close()
            raise HTTPException(status_code=409, detail="数据已被其他用户修改，请刷新后重试")
        db.commit()
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "employees", str(employee_id), f"更新员工: {data.name}")
    return {"message": "更新成功", "version": (requested_version or 0) + 1}

@router.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, current_user: dict = Depends(require_permission("employees:delete"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        emp = cur.execute("SELECT name, post FROM employees WHERE id=?", (employee_id,)).fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="员工不存在")
        emp_name = emp["name"]
        emp_post = emp["post"] or ""

        cur.execute("DELETE FROM employee_monthly_status WHERE employee_name = ?", (emp_name,))
        cur.execute("DELETE FROM employees WHERE id=?", (employee_id,))

        hr_change_desc = f"删除员工: {emp_name}"
        fin_description = f"删除{emp_name}({emp_post})，减少{PER_PERSON_COST}万/年"
        responsible = current_user.get("display_name", "") or current_user.get("username", "")

        cur.execute("""
            INSERT INTO linkage_mappings
            (proj_id, it_ids, hr_change_desc, hr_headcount, hr_posts,
             hr_month_start, hr_month_end, fin_budget_impact, fin_subjects,
             fin_description, responsible_person)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            None,
            "[]",
            hr_change_desc,
            -1,
            emp_post,
            None,
            None,
            -PER_PERSON_COST,
            json.dumps(["工资预算"], ensure_ascii=False),
            fin_description,
            responsible,
        ))

        cur.execute("""
            UPDATE financial_budget SET budget_num = CAST(COALESCE(budget_num, '0') AS REAL) - ?
            WHERE category = '工资预算'
        """, (PER_PERSON_COST * 10000,))

    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "employees", str(employee_id), f"删除员工: {emp_name}，自动联动财务-{PER_PERSON_COST}万")
    return {"message": "删除成功"}


@router.get("/distributions")
def hr_distributions(current_user: dict = Depends(require_permission("hr:read"))):
    db = get_db()
    cur = db.cursor()
    today = date.today()

    total_emp = cur.execute("SELECT COUNT(*) FROM employees").fetchone()[0]

    edu = [dict(r) for r in cur.execute("""
        SELECT education as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE education IS NOT NULL), 1) || '%' as rate
        FROM employees WHERE education IS NOT NULL
        GROUP BY education ORDER BY count DESC
    """).fetchall()]

    age_all = [r[0] for r in cur.execute("SELECT age FROM employees WHERE age IS NOT NULL").fetchall()]
    avg_age = round(sum(age_all) / len(age_all), 2) if age_all else 0
    age_groups = {"20-25": 0, "26-30": 0, "31-35": 0, "36-40": 0, "40+": 0}
    for a in age_all:
        if a <= 25: age_groups["20-25"] += 1
        elif a <= 30: age_groups["26-30"] += 1
        elif a <= 35: age_groups["31-35"] += 1
        elif a <= 40: age_groups["36-40"] += 1
        else: age_groups["40+"] += 1
    total_age = len(age_all) or 1
    age_dist = []
    for k, v in age_groups.items():
        pct = v / total_age * 100
        if pct - int(pct) >= 0.5:
            rate = int(pct) + 1
        else:
            rate = int(pct)
        age_dist.append({"label": k, "count": v, "rate": f"{rate}%"})

    gender = [dict(r) for r in cur.execute("""
        SELECT gender as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE gender IS NOT NULL)) || '%' as rate
        FROM employees WHERE gender IS NOT NULL GROUP BY gender
    """).fetchall()]

    services = []
    for r in cur.execute("SELECT entry_date FROM employees WHERE entry_date IS NOT NULL"):
        try:
            d = date.fromisoformat(r[0][:10])
            services.append(round((today - d).days / 365.25, 1))
        except Exception:
            pass
    avg_service = round(sum(services) / len(services), 2) if services else 0

    edu_above = cur.execute(
        "SELECT COUNT(*) FROM employees WHERE education IN ('本科','硕士','博士')"
    ).fetchone()[0]
    above_pct = round(edu_above / total_emp * 100) if total_emp else 0

    post_dist = [dict(r) for r in cur.execute("""
        SELECT post as label, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE post IS NOT NULL)) || '%' as rate
        FROM employees WHERE post IS NOT NULL
        GROUP BY post ORDER BY count DESC
    """).fetchall()]

    db.close()
    return {
        "summary": {
            "total": total_emp,
            "avg_age": avg_age,
            "avg_service": avg_service,
            "above_bachelor_pct": above_pct,
        },
        "education": edu,
        "age": age_dist,
        "gender": gender,
        "post_distribution": post_dist,
    }


@router.get("/plan-kpi")
def hr_plan_kpi(current_user: dict = Depends(require_permission("hr:read"))):
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("SELECT * FROM hr_plan_kpi ORDER BY id").fetchall()]
    result = []
    for r in rows:
        months = [r.get(f"m{i}") for i in range(1, 13)]
        result.append({
            "item": r.get("indicator", ""),
            "target": r.get("target", ""),
            "data": months,
        })
    db.close()
    return result


@router.post("/plan-kpi")
def update_hr_plan_kpi(data: dict, current_user: dict = Depends(require_permission("hr:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("DELETE FROM hr_plan_kpi")
        for item in data.get("items", []):
            cur.execute("""
                INSERT INTO hr_plan_kpi (indicator, target, m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                item.get("indicator"), item.get("target"),
                item.get("m1"), item.get("m2"), item.get("m3"), item.get("m4"),
                item.get("m5"), item.get("m6"), item.get("m7"), item.get("m8"),
                item.get("m9"), item.get("m10"), item.get("m11"), item.get("m12"),
            ))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "hr_kpi", "", "批量更新人力规划KPI")
    return {"message": "更新成功"}

@router.get("/monthly-changes")
def hr_monthly_changes(current_user: dict = Depends(require_permission("hr:read"))):
    db = get_db()
    cur = db.cursor()

    employees_info = {}
    emp_rows = [dict(r) for r in cur.execute(
        "SELECT name, department_name as dept, post FROM employees ORDER BY id"
    ).fetchall()]
    for emp in emp_rows:
        name = emp["name"]
        months = {}
        for r in cur.execute(
            "SELECT month, status FROM employee_monthly_status WHERE employee_name = ? ORDER BY month",
            (name,)
        ):
            months[r[0]] = r[1]
        for mi in range(1, 13):
            emp[f"m{mi}"] = months.get(mi, "在岗")
        employees_info[name] = emp

    db.close()
    return list(employees_info.values())


class MonthlyStatusUpdate(BaseModel):
    employee_name: str
    month: int
    status: str


@router.put("/monthly-status")
def update_monthly_status(data: MonthlyStatusUpdate, current_user: dict = Depends(require_permission("hr:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        existing = cur.execute(
            "SELECT id FROM employee_monthly_status WHERE employee_name = ? AND month = ?",
            (data.employee_name, data.month)
        ).fetchone()
        if existing:
            cur.execute(
                "UPDATE employee_monthly_status SET status = ? WHERE employee_name = ? AND month = ?",
                (data.status, data.employee_name, data.month)
            )
        else:
            cur.execute(
                "INSERT INTO employee_monthly_status (employee_name, month, status) VALUES (?,?,?)",
                (data.employee_name, data.month, data.status)
            )
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "employees", "", f"更新月度状态: {data.employee_name} M{data.month}={data.status}")
    return {"message": "更新成功"}
