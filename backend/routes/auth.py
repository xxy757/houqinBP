from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, field_validator
from database import get_db
from auth import verify_password, hash_password, create_access_token, get_current_user
from logger import log_operation

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(data: LoginRequest, request: Request):
    db = get_db()
    cur = db.cursor()
    user = cur.execute(
        "SELECT id, username, password_hash, display_name, is_active FROM users WHERE username = ?",
        (data.username,)
    ).fetchone()
    ip = request.client.host if request.client else ""
    if not user or not verify_password(data.password, user["password_hash"]):
        db.close()
        log_operation(data.username, data.username, "LOGIN_FAIL", "auth", "",
                      f"登录失败", ip)
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    if not user["is_active"]:
        db.close()
        log_operation(data.username, data.username, "LOGIN_FAIL", "auth", "",
                      f"账号已禁用", ip)
        raise HTTPException(status_code=403, detail="账号已被禁用")

    permissions = [r[0] for r in cur.execute("""
        SELECT DISTINCT p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
    """, (user["id"],)).fetchall()]

    db.close()

    token = create_access_token(user["id"], user["username"], user["display_name"], permissions)
    log_operation(user["username"], user["display_name"], "LOGIN", "auth", "",
                  f"登录成功", ip)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "permissions": permissions,
        }
    }


@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": int(current_user["sub"]),
        "username": current_user["username"],
        "display_name": current_user.get("display_name", ""),
        "permissions": current_user.get("permissions", []),
    }


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('新密码长度不能少于6位')
        return v


@router.put("/auth/change-password")
def change_password(data: ChangePasswordRequest, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db()
    cur = db.cursor()
    user = cur.execute(
        "SELECT id, password_hash FROM users WHERE id = ?",
        (int(current_user["sub"]),)
    ).fetchone()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="用户不存在")

    if not verify_password(data.old_password, user["password_hash"]):
        db.close()
        raise HTTPException(status_code=400, detail="原密码错误")

    cur.execute(
        "UPDATE users SET password_hash = ?, updated_at = datetime('now','localtime') WHERE id = ?",
        (hash_password(data.new_password), user["id"])
    )
    db.commit()
    db.close()
    ip = request.client.host if request and request.client else ""
    log_operation(current_user.get("username", ""), current_user.get("display_name", ""),
                  "CHANGE_PASSWORD", "auth", "", "修改密码成功", ip)
    return {"message": "密码修改成功"}
