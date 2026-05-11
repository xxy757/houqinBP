"""
后勤部四项规划统筹管理系统 - API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import professional, it_projects, hr, finance, dashboard

app = FastAPI(title="后勤部四项规划统筹管理系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api", tags=["驾驶舱"])
app.include_router(professional.router, prefix="/api/professional", tags=["专业项目"])
app.include_router(it_projects.router, prefix="/api/it", tags=["信息化方案"])
app.include_router(hr.router, prefix="/api/hr", tags=["人力资源"])
app.include_router(finance.router, prefix="/api/finance", tags=["财务管控"])


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}
