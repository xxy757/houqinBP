from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, transaction
from auth import hash_password, get_current_user, require_permission
from logger import log_operation

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str
    role_ids: List[int] = []


class UserUpdate(BaseModel):
    version: Optional[int] = None
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
    version: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None


@router.get("/users")
def list_users(current_user: dict = Depends(require_permission("users:read"))):
    db = get_db()
    cur = db.cursor()
    users = [dict(r) for r in cur.execute("""
        SELECT id, username, display_name, is_active, version, created_at
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
    with transaction(db):
        cur = db.cursor()
        existing = cur.execute("SELECT id FROM users WHERE username = ?", (data.username,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="用户名已存在")

        cur.execute(
            "INSERT INTO users (username, password_hash, display_name) VALUES (?,?,?)",
            (data.username, hash_password(data.password), data.display_name)
        )
        user_id = cur.lastrowid

        for rid in data.role_ids:
            cur.execute("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)", (user_id, rid))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "users", str(user_id), f"创建用户: {data.username}")
    return {"id": user_id, "message": "创建成功"}


@router.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, current_user: dict = Depends(require_permission("users:write"))):
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        cur = db.cursor()
        existing = cur.execute("SELECT id, version FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            db.rollback()
            db.close()
            raise HTTPException(status_code=404, detail="用户不存在")
        current_version = existing["version"]
        requested_version = data.version or current_version

        update_sql = "UPDATE users SET version=version+1, updated_at=datetime('now','localtime')"
        params = []
        if data.display_name is not None:
            update_sql += ", display_name=?"
            params.append(data.display_name)
        if data.password is not None:
            update_sql += ", password_hash=?"
            params.append(hash_password(data.password))
        if data.is_active is not None:
            update_sql += ", is_active=?"
            params.append(data.is_active)

        if len(params) > 0:
            update_sql += " WHERE id=? AND version=?"
            params.extend([user_id, requested_version])
            cur.execute(update_sql, params)
            if cur.rowcount == 0:
                db.rollback()
                db.close()
                raise HTTPException(status_code=409, detail="数据已被其他用户修改，请刷新后重试")

        if data.role_ids is not None:
            cur.execute("DELETE FROM user_roles WHERE user_id = ?", (user_id,))
            for rid in data.role_ids:
                cur.execute("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)", (user_id, rid))

        db.commit()
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "users", str(user_id), f"更新用户: id={user_id}")
    return {"message": "更新成功", "version": (requested_version or 0) + 1}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(require_permission("users:write"))):
    db = get_db()
    if user_id == int(current_user["sub"]):
        db.close()
        raise HTTPException(status_code=400, detail="不能删除自己")
    with transaction(db):
        cur = db.cursor()
        cur.execute("DELETE FROM user_roles WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="用户不存在")
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "users", str(user_id), f"删除用户: id={user_id}")
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
    with transaction(db):
        cur = db.cursor()
        existing = cur.execute("SELECT id FROM roles WHERE code = ?", (data.code,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="角色代码已存在")

        cur.execute(
            "INSERT INTO roles (code, name, description) VALUES (?,?,?)",
            (data.code, data.name, data.description)
        )
        role_id = cur.lastrowid

        for pid in data.permission_ids:
            cur.execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)", (role_id, pid))
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "CREATE", "roles", str(role_id), f"创建角色: {data.name}")
    return {"id": role_id, "message": "创建成功"}


@router.put("/roles/{role_id}")
def update_role(role_id: int, data: RoleUpdate, current_user: dict = Depends(require_permission("roles:write"))):
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        cur = db.cursor()
        existing = cur.execute("SELECT id, version FROM roles WHERE id = ?", (role_id,)).fetchone()
        if not existing:
            db.rollback()
            db.close()
            raise HTTPException(status_code=404, detail="角色不存在")
        current_version = existing["version"]
        requested_version = data.version or current_version

        version_bumped = False
        if data.name is not None or data.description is not None:
            update_sql = "UPDATE roles SET version=version+1"
            params = []
            if data.name is not None:
                update_sql += ", name=?"
                params.append(data.name)
            if data.description is not None:
                update_sql += ", description=?"
                params.append(data.description)
            update_sql += " WHERE id=? AND version=?"
            params.extend([role_id, requested_version])
            cur.execute(update_sql, params)
            if cur.rowcount == 0:
                db.rollback()
                db.close()
                raise HTTPException(status_code=409, detail="数据已被其他用户修改，请刷新后重试")
            version_bumped = True

        if data.permission_ids is not None:
            if not version_bumped:
                cur.execute("UPDATE roles SET version=version+1 WHERE id=? AND version=?", (role_id, requested_version))
                if cur.rowcount == 0:
                    db.rollback()
                    db.close()
                    raise HTTPException(status_code=409, detail="数据已被其他用户修改，请刷新后重试")
            cur.execute("DELETE FROM role_permissions WHERE role_id = ?", (role_id,))
            for pid in data.permission_ids:
                cur.execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)", (role_id, pid))

        db.commit()
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "UPDATE", "roles", str(role_id), f"更新角色: id={role_id}")
    return {"message": "更新成功", "version": (requested_version or 0) + 1}


@router.delete("/roles/{role_id}")
def delete_role(role_id: int, current_user: dict = Depends(require_permission("roles:write"))):
    db = get_db()
    with transaction(db):
        cur = db.cursor()
        cur.execute("DELETE FROM role_permissions WHERE role_id = ?", (role_id,))
        cur.execute("DELETE FROM user_roles WHERE role_id = ?", (role_id,))
        cur.execute("DELETE FROM roles WHERE id = ?", (role_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="角色不存在")
    db.close()
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""), "DELETE", "roles", str(role_id), f"删除角色: id={role_id}")
    return {"message": "删除成功"}


@router.get("/permissions")
def list_permissions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cur = db.cursor()
    perms = [dict(r) for r in cur.execute("SELECT * FROM permissions ORDER BY id").fetchall()]
    db.close()
    return perms
