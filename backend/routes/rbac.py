from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import hash_password, get_current_user, require_permission

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str
    role_ids: List[int] = []


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[int] = None
    role_ids: Optional[List[int]] = None


class RoleCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    permission_ids: List[int] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None


@router.get("/users")
def list_users(current_user: dict = Depends(require_permission("users:read"))):
    db = get_db()
    cur = db.cursor()
    users = [dict(r) for r in cur.execute("""
        SELECT id, username, display_name, is_active, created_at
        FROM users ORDER BY id
    """).fetchall()]
    for u in users:
        u["roles"] = [dict(r) for r in cur.execute("""
            SELECT r.id, r.code, r.name
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        """, (u["id"],)).fetchall()]
    db.close()
    return users


@router.post("/users")
def create_user(data: UserCreate, current_user: dict = Depends(require_permission("users:write"))):
    db = get_db()
    cur = db.cursor()
    existing = cur.execute("SELECT id FROM users WHERE username = ?", (data.username,)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="用户名已存在")

    cur.execute(
        "INSERT INTO users (username, password_hash, display_name) VALUES (?,?,?)",
        (data.username, hash_password(data.password), data.display_name)
    )
    user_id = cur.lastrowid

    for rid in data.role_ids:
        cur.execute("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)", (user_id, rid))

    db.commit()
    db.close()
    return {"id": user_id, "message": "创建成功"}


@router.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, current_user: dict = Depends(require_permission("users:write"))):
    db = get_db()
    cur = db.cursor()
    existing = cur.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="用户不存在")

    if data.display_name is not None:
        cur.execute(
            "UPDATE users SET display_name = ?, updated_at = datetime('now','localtime') WHERE id = ?",
            (data.display_name, user_id)
        )
    if data.password is not None:
        cur.execute(
            "UPDATE users SET password_hash = ?, updated_at = datetime('now','localtime') WHERE id = ?",
            (hash_password(data.password), user_id)
        )
    if data.is_active is not None:
        cur.execute(
            "UPDATE users SET is_active = ?, updated_at = datetime('now','localtime') WHERE id = ?",
            (data.is_active, user_id)
        )
    if data.role_ids is not None:
        cur.execute("DELETE FROM user_roles WHERE user_id = ?", (user_id,))
        for rid in data.role_ids:
            cur.execute("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)", (user_id, rid))

    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(require_permission("users:write"))):
    db = get_db()
    cur = db.cursor()
    if user_id == int(current_user["sub"]):
        db.close()
        raise HTTPException(status_code=400, detail="不能删除自己")
    cur.execute("DELETE FROM user_roles WHERE user_id = ?", (user_id,))
    cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
    if cur.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="用户不存在")
    db.commit()
    db.close()
    return {"message": "删除成功"}


@router.get("/roles")
def list_roles(current_user: dict = Depends(require_permission("roles:read"))):
    db = get_db()
    cur = db.cursor()
    roles = [dict(r) for r in cur.execute("SELECT * FROM roles ORDER BY id").fetchall()]
    for r in roles:
        r["permissions"] = [dict(pr) for pr in cur.execute("""
            SELECT p.id, p.code, p.name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        """, (r["id"],)).fetchall()]
    db.close()
    return roles


@router.post("/roles")
def create_role(data: RoleCreate, current_user: dict = Depends(require_permission("roles:write"))):
    db = get_db()
    cur = db.cursor()
    existing = cur.execute("SELECT id FROM roles WHERE code = ?", (data.code,)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="角色代码已存在")

    cur.execute(
        "INSERT INTO roles (code, name, description) VALUES (?,?,?)",
        (data.code, data.name, data.description)
    )
    role_id = cur.lastrowid

    for pid in data.permission_ids:
        cur.execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)", (role_id, pid))

    db.commit()
    db.close()
    return {"id": role_id, "message": "创建成功"}


@router.put("/roles/{role_id}")
def update_role(role_id: int, data: RoleUpdate, current_user: dict = Depends(require_permission("roles:write"))):
    db = get_db()
    cur = db.cursor()
    existing = cur.execute("SELECT id FROM roles WHERE id = ?", (role_id,)).fetchone()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="角色不存在")

    if data.name is not None:
        cur.execute("UPDATE roles SET name = ? WHERE id = ?", (data.name, role_id))
    if data.description is not None:
        cur.execute("UPDATE roles SET description = ? WHERE id = ?", (data.description, role_id))
    if data.permission_ids is not None:
        cur.execute("DELETE FROM role_permissions WHERE role_id = ?", (role_id,))
        for pid in data.permission_ids:
            cur.execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)", (role_id, pid))

    db.commit()
    db.close()
    return {"message": "更新成功"}


@router.delete("/roles/{role_id}")
def delete_role(role_id: int, current_user: dict = Depends(require_permission("roles:write"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM role_permissions WHERE role_id = ?", (role_id,))
    cur.execute("DELETE FROM user_roles WHERE role_id = ?", (role_id,))
    cur.execute("DELETE FROM roles WHERE id = ?", (role_id,))
    if cur.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="角色不存在")
    db.commit()
    db.close()
    return {"message": "删除成功"}


@router.get("/permissions")
def list_permissions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cur = db.cursor()
    perms = [dict(r) for r in cur.execute("SELECT * FROM permissions ORDER BY id").fetchall()]
    db.close()
    return perms
