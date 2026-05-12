"""
后勤部四项规划统筹管理系统 - API
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from logger import start_logger, stop_logger
from routes import professional, it_projects, hr, finance, dashboard, auth, rbac, audit, linkage


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_logger()
    yield
    stop_logger()


app = FastAPI(title="后勤部四项规划统筹管理系统", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api", tags=["驾驶舱"])
app.include_router(professional.router, prefix="/api/professional-projects", tags=["专业项目"])
app.include_router(it_projects.router, prefix="/api/it-projects", tags=["信息化方案"])
app.include_router(hr.router, prefix="/api/hr", tags=["人力资源"])
app.include_router(finance.router, prefix="/api/finance", tags=["财务管控"])
app.include_router(auth.router, prefix="/api", tags=["认证"])
app.include_router(rbac.router, prefix="/api", tags=["权限管理"])
app.include_router(audit.router, prefix="/api", tags=["审计日志"])
app.include_router(linkage.router, prefix="/api/linkage", tags=["联动配置"])


@app.get("/api/health")
def health():
    return {"status": "ok"}



