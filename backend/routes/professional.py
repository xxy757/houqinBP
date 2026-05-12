"""专业项目 CRUD"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()


class ProjectCreate(BaseModel):
    id: Optional[int] = None
    department: str
    name: str
    goal: Optional[str] = None
    context: Optional[str] = None
    deliverable: Optional[str] = None
    person: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None
    phase_count: int = 0


class PhaseCreate(BaseModel):
    project_id: int
    phase_order: int
    phase_name: Optional[str] = None
    phase_content: Optional[str] = None


@router.get("")
def list_projects():
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("""
        SELECT id, department as dept, name, goal, context, deliverable,
               person, start_date as start, end_date as "end", duration as period, phase_count as phases
        FROM professional_projects ORDER BY id
    """).fetchall()]
    for p in rows:
        p["phaseList"] = [dict(r) for r in cur.execute("""
            SELECT phase_order, phase_name as name, phase_content
            FROM professional_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (p["id"],)).fetchall()]
    db.close()
    return rows


@router.get("/{project_id}")
def get_project(project_id: int):
    db = get_db()
    cur = db.cursor()
    proj = [dict(r) for r in cur.execute("""
        SELECT id, department as dept, name, goal, context, deliverable,
               person, start_date as start, end_date as "end", duration as period, phase_count as phases
        FROM professional_projects WHERE id = ?
    """, (project_id,)).fetchall()]
    if not proj:
        db.close()
        raise HTTPException(status_code=404, detail="项目不存在")
    proj = proj[0]
    proj["phaseList"] = [dict(r) for r in cur.execute("""
        SELECT phase_order, phase_name as name, phase_content
        FROM professional_project_phases
        WHERE project_id = ? ORDER BY phase_order
    """, (project_id,)).fetchall()]
    db.close()
    return proj


@router.post("")
def create_project(data: ProjectCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM professional_projects")
    new_id = data.id or cur.fetchone()[0]
    cur.execute("""
        INSERT INTO professional_projects (id, department, name, goal, context, deliverable, person, start_date, end_date, duration, phase_count)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (new_id, data.department, data.name, data.goal, data.context,
          data.deliverable, data.person, data.start_date, data.end_date,
          data.duration, data.phase_count))
    db.commit()
    db.close()
    return {"id": new_id, "message": "创建成功"}


@router.put("/{project_id}")
def update_project(project_id: int, data: ProjectCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM professional_projects WHERE id=?", (project_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="项目不存在")
    cur.execute("""
        UPDATE professional_projects SET department=?, name=?, goal=?, context=?,
        deliverable=?, person=?, start_date=?, end_date=?, duration=?, phase_count=?
        WHERE id=?
    """, (data.department, data.name, data.goal, data.context,
          data.deliverable, data.person, data.start_date, data.end_date,
          data.duration, data.phase_count, project_id))
    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/{project_id}")
def delete_project(project_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM professional_project_phases WHERE project_id=?", (project_id,))
    cur.execute("DELETE FROM professional_projects WHERE id=?", (project_id,))
    db.commit()
    db.close()
    return {"message": "删除成功"}


@router.post("/{project_id}/phases")
def add_phase(project_id: int, data: PhaseCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        INSERT INTO professional_project_phases (project_id, phase_order, phase_name, phase_content)
        VALUES (?,?,?,?)
    """, (project_id, data.phase_order, data.phase_name, data.phase_content))
    db.commit()
    db.close()
    return {"message": "阶段添加成功"}


@router.delete("/{project_id}/phases/{phase_id}")
def delete_phase(project_id: int, phase_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM professional_project_phases WHERE id=? AND project_id=?", (phase_id, project_id))
    db.commit()
    db.close()
    return {"message": "阶段删除成功"}
