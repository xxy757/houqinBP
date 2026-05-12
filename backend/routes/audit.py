from fastapi import APIRouter, Query, Depends
from database import get_db
from auth import require_permission

router = APIRouter()


@router.get("/audit-logs")
def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: str = Query(""),
    resource: str = Query(""),
    username: str = Query(""),
    current_user: dict = Depends(require_permission("audits:read")),
):
    db = get_db()
    cur = db.cursor()

    conditions = []
    params = []
    if action:
        conditions.append("action = ?")
        params.append(action)
    if resource:
        conditions.append("resource = ?")
        params.append(resource)
    if username:
        conditions.append("username LIKE ?")
        params.append(f"%{username}%")

    where = " AND ".join(conditions)
    if where:
        where = "WHERE " + where

    total = cur.execute(f"SELECT COUNT(*) FROM audit_logs {where}", params).fetchone()[0]

    offset = (page - 1) * page_size
    rows = [dict(r) for r in cur.execute(
        f"SELECT * FROM audit_logs {where} ORDER BY id DESC LIMIT ? OFFSET ?",
        params + [page_size, offset]
    ).fetchall()]

    db.close()
    return {"data": rows, "total": total, "page": page, "page_size": page_size}
