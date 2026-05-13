"""专业项目 CRUD"""
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db, transaction
from auth import require_permission
from logger import log_operation

router = APIRouter()


class ProjectCreate(BaseModel):
    id: Optional[int] = None
    version: Optional[int] = None
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
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    search: str = Query(""),
    current_user: dict = Depends(require_permission("projects:read")),
):
    db = get_db()
    cur = db.cursor()
    if search:
        like = f"%{search}%"
        total = cur.execute(
            "SELECT COUNT(*) FROM professional_projects WHERE name LIKE ? OR department LIKE ? OR goal LIKE ? OR person LIKE ?",
            (like, like, like, like)
        ).fetchone()[0]
    else:
        total = cur.execute("SELECT COUNT(*) FROM professional_projects").fetchone()[0]
    offset = (page - 1) * page_size
    if search:
        rows = [dict(r) for r in cur.execute("""
            SELECT id, department as dept, name, goal, context, deliverable,
                   person, start_date as start, end_date as "end", duration as period, phase_count as phases, version
            FROM professional_projects
            WHERE name LIKE ? OR department LIKE ? OR goal LIKE ? OR person LIKE ?
            ORDER BY id LIMIT ? OFFSET ?
        """, (like, like, like, like, page_size, offset)).fetchall()]
    else:
        rows = [dict(r) for r in cur.execute("""
            SELECT id, department as dept, name, goal, context, deliverable,
                   person, start_date as start, end_date as "end", duration as period, phase_count as phases, version
            FROM professional_projects ORDER BY id LIMIT ? OFFSET ?
        """, (page_size, offset)).fetchall()]
    for p in rows:
        p["phaseList"] = [dict(r) for r in cur.execute("""
            SELECT phase_order, phase_name as name, phase_content
            FROM professional_project_phases
            WHERE project_id = ? ORDER BY phase_order
        """, (p["id"],)).fetchall()]
    db.close()
    return {"data": rows, "total": total, "page": page, "page_size": page_size}


@router.get("/{project_id}")
def get_project(project_id: int, current_user: dict = Depends(require_permission("projects:read"))):
    db = get_db()
    cur = db.cursor()
    proj = [dict(r) for r in cur.execute("""
        SELECT id, department as dept, name, goal, context, deliverable,
               person, start_date as start, end_date as "end", duration as period, phase_count as phases, version
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
def create_project(data: ProjectCreate, current_user: dict = Depends(require_permission("projects:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("SELECT COALESCE(MAX(id),0)+1 FROM professional_projects")
        new_id = data.id or cur.fetchone()[0]
        cur.execute("""
            INSERT INTO professional_projects (id, department, name, goal, context, deliverable, person, start_date, end_date, duration, phase_count)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (new_id, data.department, data.name, data.goal, data.context,
              data.deliverable, data.person, data.start_date, data.end_date,
              data.duration, data.phase_count))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "projects", str(new_id), f"创建专业项目: {data.name}")
    return {"id": new_id, "version": 1, "message": "创建成功"}


@router.put("/{project_id}")
def update_project(project_id: int, data: ProjectCreate, current_user: dict = Depends(require_permission("projects:write"))):
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        cur = db.cursor()
        existing = cur.execute(
            "SELECT id, version FROM professional_projects WHERE id=?",
            (project_id,)
        ).fetchone()
        if not existing:
            db.rollback()
            db.close()
            raise HTTPException(status_code=404, detail="项目不存在")
        current_version = existing["version"]
        requested_version = data.version or current_version
        cur.execute("""
            UPDATE professional_projects SET department=?, name=?, goal=?, context=?,
            deliverable=?, person=?, start_date=?, end_date=?, duration=?, phase_count=?,
            version=version+1, updated_at=datetime('now','localtime')
            WHERE id=? AND version=?
        """, (data.department, data.name, data.goal, data.context,
              data.deliverable, data.person, data.start_date, data.end_date,
              data.duration, data.phase_count, project_id, requested_version))
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
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "projects", str(project_id), f"更新专业项目: {data.name}")
    return {"message": "更新成功", "version": (requested_version or 0) + 1}

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: dict = Depends(require_permission("projects:delete"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("DELETE FROM professional_project_phases WHERE project_id=?", (project_id,))
        cur.execute("DELETE FROM professional_projects WHERE id=?", (project_id,))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "projects", str(project_id), "删除专业项目")
    return {"message": "删除成功"}

@router.post("/{project_id}/phases")
def add_phase(project_id: int, data: PhaseCreate, current_user: dict = Depends(require_permission("projects:write"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        INSERT INTO professional_project_phases (project_id, phase_order, phase_name, phase_content)
        VALUES (?,?,?,?)
    """, (project_id, data.phase_order, data.phase_name, data.phase_content))
    db.commit()
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "projects", str(project_id), f"添加阶段: {data.phase_name}")
    return {"message": "阶段添加成功"}


@router.delete("/{project_id}/phases/{phase_id}")
def delete_phase(project_id: int, phase_id: int, current_user: dict = Depends(require_permission("projects:delete"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM professional_project_phases WHERE id=? AND project_id=?", (phase_id, project_id))
    db.commit()
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "project_phases", str(phase_id), f"删除阶段: 项目#{project_id} 阶段#{phase_id}")
    return {"message": "阶段删除成功"}
