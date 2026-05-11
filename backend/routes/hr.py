"""人力资源 API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()


@router.get("/roster")
def get_roster():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT id, name, post, department_name, education, major,
               school, phone, gender, age, status
        FROM employees ORDER BY id
    """)
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.get("/stats")
def get_hr_stats():
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT COUNT(*) FROM employees")
    total = cur.fetchone()[0]

    cur.execute("SELECT education, COUNT(*) as cnt FROM employees WHERE education IS NOT NULL GROUP BY education ORDER BY cnt DESC")
    edu_dist = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT gender, COUNT(*) as cnt FROM employees WHERE gender IS NOT NULL GROUP BY gender")
    gender_dist = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT department_name, COUNT(*) as cnt FROM employees WHERE department_name IS NOT NULL GROUP BY department_name ORDER BY cnt DESC")
    dept_dist = [dict(r) for r in cur.fetchall()]

    db.close()
    return {
        "total": total,
        "education_distribution": edu_dist,
        "gender_distribution": gender_dist,
        "department_distribution": dept_dist,
    }


@router.get("/plan")
def get_hr_plan():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM hr_plan_kpi")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.post("/plan")
def update_hr_plan(data: dict):
    db = get_db()
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
    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.get("/changes")
def get_changes():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT DISTINCT employee_name, month, status
        FROM employee_monthly_status
        WHERE status IS NOT NULL AND status != '在编'
        ORDER BY employee_name, month
    """)
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows
