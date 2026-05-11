"""财务管控 API"""
from fastapi import APIRouter
from database import get_db

router = APIRouter()


@router.get("/indicators")
def get_indicators():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM financial_indicators")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.get("/budget")
def get_budget():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM financial_budget")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.get("/timeline")
def get_timeline():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM financial_timeline ORDER BY id")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows


@router.get("/reduction")
def get_reduction():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM financial_reduction")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows
