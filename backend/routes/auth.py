from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_db
from auth import verify_password, create_access_token, get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(data: LoginRequest):
    db = get_db()
    cur = db.cursor()
    user = cur.execute(
        "SELECT id, username, password_hash, display_name, is_active FROM users WHERE username = ?",
        (data.username,)
    ).fetchone()
    if not user or not verify_password(data.password, user["password_hash"]):
        db.close()
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    if not user["is_active"]:
        db.close()
        raise HTTPException(status_code=403, detail="账号已被禁用")

    permissions = [r[0] for r in cur.execute("""
        SELECT DISTINCT p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
    """, (user["id"],)).fetchall()]

    db.close()

    token = create_access_token(user["id"], user["username"], permissions)
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
        "permissions": current_user.get("permissions", []),
    }
