from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import json

from database import get_db
from auth import require_permission
from logger import log_operation

router = APIRouter()

PER_PERSON_COST = 10.2


class CreateMappingBody(BaseModel):
    proj_id: Optional[int] = None
    it_ids: list[int] = []
    hr_change_desc: str = ''
    hr_headcount: int = 0
    hr_posts: str = ''
    hr_month_start: Optional[int] = None
    hr_month_end: Optional[int] = None
    fin_budget_impact: float = 0
    fin_subjects: list[str] = []
    fin_description: str = ''
    responsible_person: str = ''


class UpdateMappingBody(BaseModel):
    proj_id: Optional[int] = None
    it_ids: list[int] = []
    hr_change_desc: str = ''
    hr_headcount: int = 0
    hr_posts: str = ''
    hr_month_start: Optional[int] = None
    hr_month_end: Optional[int] = None
    fin_budget_impact: float = 0
    fin_subjects: list[str] = []
    fin_description: str = ''
    responsible_person: str = ''
    version: int


class SimulateBody(BaseModel):
    proj_id: Optional[int] = None
    hr_change: int = 0


def _row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    if 'it_ids' in d:
        try:
            d['it_ids'] = json.loads(d['it_ids']) if isinstance(d['it_ids'], str) else (d['it_ids'] or [])
        except Exception:
            d['it_ids'] = []
    if 'fin_subjects' in d:
        try:
            d['fin_subjects'] = json.loads(d['fin_subjects']) if isinstance(d['fin_subjects'], str) else (d['fin_subjects'] or [])
        except Exception:
            d['fin_subjects'] = []
    if 'it_names' in d:
        try:
            d['it_names'] = json.loads(d['it_names']) if isinstance(d['it_names'], str) else (d['it_names'] or [])
        except Exception:
            d['it_names'] = []
    return d


def _enrich_mapping(cur, row):
    d = _row_to_dict(row)
    if d.get('it_ids') and isinstance(d['it_ids'], list) and len(d['it_ids']) > 0:
        placeholders = ','.join('?' * len(d['it_ids']))
        cur.execute(f"SELECT id, name FROM it_projects WHERE id IN ({placeholders})", d['it_ids'])
        d['it_names'] = [dict(r)['name'] for r in cur.fetchall()]
    else:
        d['it_names'] = []
    return d


@router.get("/mappings")
def get_mappings(current_user: dict = Depends(require_permission("linkage:read"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT lm.*, pp.name AS proj_name
        FROM linkage_mappings lm
        LEFT JOIN professional_projects pp ON pp.id = lm.proj_id
        ORDER BY lm.id
    """)
    rows = cur.fetchall()
    result = [_enrich_mapping(cur, r) for r in rows]
    db.close()
    return result


@router.get("/mappings/{mapping_id}")
def get_mapping(mapping_id: int, current_user: dict = Depends(require_permission("linkage:read"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT lm.*, pp.name AS proj_name
        FROM linkage_mappings lm
        LEFT JOIN professional_projects pp ON pp.id = lm.proj_id
        WHERE lm.id = ?
    """, (mapping_id,))
    row = cur.fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="联动配置不存在")
    result = _enrich_mapping(cur, row)
    db.close()
    return result


@router.post("/mappings", status_code=201)
def create_mapping(body: CreateMappingBody, current_user: dict = Depends(require_permission("linkage:write"))):
    db = get_db()
    cur = db.cursor()

    if body.proj_id is not None:
        cur.execute("SELECT id FROM professional_projects WHERE id = ?", (body.proj_id,))
        if not cur.fetchone():
            db.close()
            raise HTTPException(status_code=400, detail="专业项目不存在")

    if body.it_ids:
        for it_id in body.it_ids:
            cur.execute("SELECT id FROM it_projects WHERE id = ?", (it_id,))
            if not cur.fetchone():
                db.close()
                raise HTTPException(status_code=400, detail=f"信息化项目 {it_id} 不存在")

    cur.execute("""
        INSERT INTO linkage_mappings
        (proj_id, it_ids, hr_change_desc, hr_headcount, hr_posts,
         hr_month_start, hr_month_end, fin_budget_impact, fin_subjects,
         fin_description, responsible_person)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        body.proj_id,
        json.dumps(body.it_ids, ensure_ascii=False),
        body.hr_change_desc,
        body.hr_headcount,
        body.hr_posts,
        body.hr_month_start,
        body.hr_month_end,
        body.fin_budget_impact,
        json.dumps(body.fin_subjects, ensure_ascii=False),
        body.fin_description,
        body.responsible_person,
    ))
    new_id = cur.lastrowid
    db.commit()

    log_operation(current_user.get("username", ""), current_user.get("display_name", ""),
                  "CREATE", "linkage_mapping", str(new_id),
                  f"创建联动配置: proj_id={body.proj_id}")
    db.close()
    return {"id": new_id, "message": "联动配置创建成功"}


@router.put("/mappings/{mapping_id}")
def update_mapping(mapping_id: int, body: UpdateMappingBody, current_user: dict = Depends(require_permission("linkage:write"))):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM linkage_mappings WHERE id = ?", (mapping_id,))
    existing = cur.fetchone()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="联动配置不存在")

    if existing["version"] != body.version:
        db.close()
        raise HTTPException(status_code=409, detail="数据已被他人修改，请刷新后重试")

    if body.proj_id is not None:
        cur.execute("SELECT id FROM professional_projects WHERE id = ?", (body.proj_id,))
        if not cur.fetchone():
            db.close()
            raise HTTPException(status_code=400, detail="专业项目不存在")

    if body.it_ids:
        for it_id in body.it_ids:
            cur.execute("SELECT id FROM it_projects WHERE id = ?", (it_id,))
            if not cur.fetchone():
                db.close()
                raise HTTPException(status_code=400, detail=f"信息化项目 {it_id} 不存在")

    cur.execute("""
        UPDATE linkage_mappings SET
            proj_id = ?, it_ids = ?, hr_change_desc = ?, hr_headcount = ?,
            hr_posts = ?, hr_month_start = ?, hr_month_end = ?,
            fin_budget_impact = ?, fin_subjects = ?, fin_description = ?,
            responsible_person = ?, version = version + 1,
            updated_at = datetime('now','localtime')
        WHERE id = ? AND version = ?
    """, (
        body.proj_id,
        json.dumps(body.it_ids, ensure_ascii=False),
        body.hr_change_desc,
        body.hr_headcount,
        body.hr_posts,
        body.hr_month_start,
        body.hr_month_end,
        body.fin_budget_impact,
        json.dumps(body.fin_subjects, ensure_ascii=False),
        body.fin_description,
        body.responsible_person,
        mapping_id,
        body.version,
    ))
    db.commit()

    log_operation(current_user.get("username", ""), current_user.get("display_name", ""),
                  "UPDATE", "linkage_mapping", str(mapping_id),
                  f"更新联动配置: proj_id={body.proj_id}")
    db.close()
    return {"message": "联动配置更新成功"}


@router.delete("/mappings/{mapping_id}")
def delete_mapping(mapping_id: int, current_user: dict = Depends(require_permission("linkage:delete"))):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id FROM linkage_mappings WHERE id = ?", (mapping_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="联动配置不存在")

    cur.execute("DELETE FROM linkage_mappings WHERE id = ?", (mapping_id,))
    db.commit()

    log_operation(current_user.get("username", ""), current_user.get("display_name", ""),
                  "DELETE", "linkage_mapping", str(mapping_id),
                  "删除联动配置")
    db.close()
    return {"message": "联动配置已删除"}


@router.get("/summary")
def get_summary(current_user: dict = Depends(require_permission("linkage:read"))):
    db = get_db()
    cur = db.cursor()

    agg = dict(cur.execute("""
        SELECT
            COUNT(*) AS total_mappings,
            COALESCE(SUM(hr_headcount), 0) AS total_hr_impact,
            COALESCE(SUM(fin_budget_impact), 0) AS total_budget_impact,
            COALESCE(SUM(CASE WHEN hr_headcount > 0 THEN hr_headcount ELSE 0 END), 0) AS hr_inc,
            COALESCE(SUM(CASE WHEN hr_headcount < 0 THEN hr_headcount ELSE 0 END), 0) AS hr_dec,
            COALESCE(SUM(CASE WHEN fin_budget_impact > 0 THEN fin_budget_impact ELSE 0 END), 0) AS budget_inc,
            COALESCE(SUM(CASE WHEN fin_budget_impact < 0 THEN fin_budget_impact ELSE 0 END), 0) AS budget_dec
        FROM linkage_mappings
    """).fetchone())

    total_proj = cur.execute("SELECT COUNT(*) FROM professional_projects").fetchone()[0]
    mapped_proj = cur.execute(
        "SELECT COUNT(DISTINCT proj_id) FROM linkage_mappings WHERE proj_id IS NOT NULL"
    ).fetchone()[0]

    rows = cur.execute(
        "SELECT it_ids FROM linkage_mappings WHERE it_ids IS NOT NULL AND it_ids != '[]'"
    ).fetchall()
    it_set = set()
    for (it_ids_str,) in rows:
        try:
            for iid in json.loads(it_ids_str):
                it_set.add(iid)
        except Exception:
            pass

    sub_rows = cur.execute(
        "SELECT fin_subjects, fin_budget_impact FROM linkage_mappings "
        "WHERE fin_subjects IS NOT NULL AND fin_subjects != '[]'"
    ).fetchall()
    subject_map = {}
    for (subs_str, impact) in sub_rows:
        try:
            for sub in json.loads(subs_str):
                subject_map[sub] = subject_map.get(sub, 0) + (impact or 0)
        except Exception:
            pass

    db.close()

    return {
        "total_mappings": agg["total_mappings"],
        "total_hr_impact": agg["total_hr_impact"],
        "total_budget_impact": round(agg["total_budget_impact"], 2),
        "by_dimension": {
            "hr_impact": {
                "increase": agg["hr_inc"],
                "decrease": agg["hr_dec"],
                "net": agg["total_hr_impact"],
            },
            "budget_impact": {
                "increase": round(agg["budget_inc"], 2),
                "decrease": round(agg["budget_dec"], 2),
                "net": round(agg["total_budget_impact"], 2),
            },
        },
        "affected_subjects": [
            {"subject": k, "amount": round(v, 2)}
            for k, v in sorted(subject_map.items(), key=lambda x: abs(x[1]), reverse=True)
        ],
        "pro_coverage": {
            "total": total_proj,
            "mapped": mapped_proj,
            "unmapped": total_proj - mapped_proj,
        },
        "it_projects_linked": len(it_set),
    }


@router.post("/impact-simulate")
def simulate_impact(body: SimulateBody, current_user: dict = Depends(require_permission("linkage:read"))):
    db = get_db()
    cur = db.cursor()

    proj_name = "未指定项目"
    if body.proj_id is not None:
        proj = cur.execute(
            "SELECT name FROM professional_projects WHERE id = ?", (body.proj_id,)
        ).fetchone()
        proj_name = proj["name"] if proj else "未知项目"

    db.close()

    h = body.hr_change
    return {
        "proj_id": body.proj_id,
        "proj_name": proj_name,
        "hr_change": h,
        "per_person_cost": PER_PERSON_COST,
        "total_impact": round(h * PER_PERSON_COST, 2),
    }
