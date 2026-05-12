"""信息化方案 CRUD"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db, transaction
from auth import require_permission
from logger import log_operation

router = APIRouter()


class ITProjectCreate(BaseModel):
    id: Optional[int] = None
    version: Optional[int] = None
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
def list_it_projects(current_user: dict = Depends(require_permission("projects:read"))):
    db = get_db()
    cur = db.cursor()
    rows = [dict(r) for r in cur.execute("""
        SELECT id, category as main, name as sub, goal, context, deliverable,
               owner as person, start_date, end_date, duration as period, difficulty as issue, solve, phase_count, version
        FROM it_projects ORDER BY id
    """).fetchall()]
    for p in rows:
        p["phaseList"] = [dict(r) for r in cur.execute("""
            SELECT phase_order, phase_name as name, phase_content
            FROM it_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (p["id"],)).fetchall()]
    db.close()
    return rows


@router.get("/{project_id}")
def get_it_project(project_id: int, current_user: dict = Depends(require_permission("projects:read"))):
    db = get_db()
    cur = db.cursor()
    proj = [dict(r) for r in cur.execute("""
        SELECT id, category as main, name as sub, goal, context, deliverable,
               owner as person, start_date, end_date, duration as period, difficulty as issue, solve, phase_count, version
        FROM it_projects WHERE id = ?
    """, (project_id,)).fetchall()]
    if not proj:
        db.close()
        raise HTTPException(status_code=404, detail="项目不存在")
    proj = proj[0]
    proj["phaseList"] = [dict(r) for r in cur.execute("""
        SELECT phase_order, phase_name as name, phase_content
        FROM it_project_phases
        WHERE project_id = ? ORDER BY phase_order
    """, (project_id,)).fetchall()]
    db.close()
    return proj


@router.post("")
def create_it_project(data: ITProjectCreate, current_user: dict = Depends(require_permission("projects:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM it_projects")
        new_id = data.id or cur.fetchone()[0]
        cur.execute("""
            INSERT INTO it_projects (id, category, name, goal, context, deliverable, owner, start_date, end_date, duration, difficulty, solve, phase_count)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (new_id, data.category, data.name, data.goal, data.context,
              data.deliverable, data.owner, data.start_date, data.end_date,
              data.duration, data.difficulty, data.solve, data.phase_count))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "projects", str(new_id), f"创建信息化项目: {data.name}")
    return {"id": new_id, "version": 1, "message": "创建成功"}
@router.put("/{project_id}")
def update_it_project(project_id: int, data: ITProjectCreate, current_user: dict = Depends(require_permission("projects:write"))):
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        cur = db.cursor()
        existing = cur.execute(
            "SELECT id, version FROM it_projects WHERE id=?",
            (project_id,)
        ).fetchone()
        if not existing:
            db.rollback()
            db.close()
            raise HTTPException(status_code=404, detail="项目不存在")
        current_version = existing["version"]
        requested_version = data.version or current_version
        cur.execute("""
            UPDATE it_projects SET category=?, name=?, goal=?, context=?,
            deliverable=?, owner=?, start_date=?, end_date=?, duration=?,
            difficulty=?, solve=?, phase_count=?,
            version=version+1, updated_at=datetime('now','localtime')
            WHERE id=? AND version=?
        """, (data.category, data.name, data.goal, data.context,
              data.deliverable, data.owner, data.start_date, data.end_date,
              data.duration, data.difficulty, data.solve, data.phase_count,
              project_id, requested_version))
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
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "projects", str(project_id), f"更新信息化项目: {data.name}")
    return {"message": "更新成功", "version": (requested_version or 0) + 1}
@router.delete("/{project_id}")
def delete_it_project(project_id: int, current_user: dict = Depends(require_permission("projects:delete"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("DELETE FROM it_project_phases WHERE project_id=?", (project_id,))
        cur.execute("DELETE FROM it_projects WHERE id=?", (project_id,))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "projects", str(project_id), "删除信息化项目")
    return {"message": "删除成功"}
