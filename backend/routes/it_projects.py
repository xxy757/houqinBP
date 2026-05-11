"""信息化方案 CRUD"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()


class ITProjectCreate(BaseModel):
    id: Optional[int] = None
    category: str
    name: str
    goal: Optional[str] = None
    context: Optional[str] = None
    deliverable: Optional[str] = None
    owner: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    solve: Optional[str] = None
    phase_count: int = 0


@router.get("")
def list_it_projects():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT id, category, name, goal, deliverable, owner,
               start_date, end_date, duration, difficulty, solve, phase_count
        FROM it_projects ORDER BY id
    """)
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.get("/{project_id}")
def get_it_project(project_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM it_projects WHERE id=?", (project_id,))
    proj = cur.fetchone()
    if not proj:
        db.close()
        raise HTTPException(status_code=404, detail="项目不存在")
    cur.execute("""
        SELECT * FROM it_project_phases
        WHERE project_id=? ORDER BY phase_order
    """, (project_id,))
    phases = [dict(r) for r in cur.fetchall()]
    db.close()
    result = dict(proj)
    result["phases"] = phases
    return result


@router.post("")
def create_it_project(data: ITProjectCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM it_projects")
    new_id = data.id or cur.fetchone()[0]
    cur.execute("""
        INSERT INTO it_projects (id, category, name, goal, context, deliverable, owner, start_date, end_date, duration, difficulty, solve, phase_count)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (new_id, data.category, data.name, data.goal, data.context,
          data.deliverable, data.owner, data.start_date, data.end_date,
          data.duration, data.difficulty, data.solve, data.phase_count))
    db.commit()
    db.close()
    return {"id": new_id, "message": "创建成功"}


@router.put("/{project_id}")
def update_it_project(project_id: int, data: ITProjectCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM it_projects WHERE id=?", (project_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="项目不存在")
    cur.execute("""
        UPDATE it_projects SET category=?, name=?, goal=?, context=?,
        deliverable=?, owner=?, start_date=?, end_date=?, duration=?,
        difficulty=?, solve=?, phase_count=?
        WHERE id=?
    """, (data.category, data.name, data.goal, data.context,
          data.deliverable, data.owner, data.start_date, data.end_date,
          data.duration, data.difficulty, data.solve, data.phase_count, project_id))
    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/{project_id}")
def delete_it_project(project_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM it_project_phases WHERE project_id=?", (project_id,))
    cur.execute("DELETE FROM it_projects WHERE id=?", (project_id,))
    db.commit()
    db.close()
    return {"message": "删除成功"}
