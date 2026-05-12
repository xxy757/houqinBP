import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'houqin.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS user_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (role_id) REFERENCES roles(id),
            UNIQUE(user_id, role_id)
        );

        CREATE TABLE IF NOT EXISTS role_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            FOREIGN KEY (role_id) REFERENCES roles(id),
            FOREIGN KEY (permission_id) REFERENCES permissions(id),
            UNIQUE(role_id, permission_id)
        );
    ''')
    conn.commit()

    perm_count = cur.execute("SELECT COUNT(*) FROM permissions").fetchone()[0]
    if perm_count == 0:
        import bcrypt
        admin_hash = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cur.executescript('''
            INSERT INTO permissions (code, name, description) VALUES
                ('dashboard:read', '查看驾驶舱', '查看驾驶舱总览数据'),
                ('projects:read', '查看项目', '查看专业项目和信息化项目'),
                ('projects:write', '编辑项目', '新增和编辑项目'),
                ('projects:delete', '删除项目', '删除项目'),
                ('employees:read', '查看人员', '查看人员名册和详情'),
                ('employees:write', '编辑人员', '新增和编辑人员信息'),
                ('employees:delete', '删除人员', '删除人员'),
                ('hr:read', '查看人力数据', '查看人力KPI、分布统计、月度变更'),
                ('hr:write', '编辑人力数据', '编辑KPI和月度状态'),
                ('finance:read', '查看财务数据', '查看预算、指标、时间线、降费方案'),
                ('finance:write', '编辑财务数据', '新增和编辑预算及降费方案'),
                ('finance:delete', '删除财务数据', '删除预算及降费项'),
                ('users:read', '查看用户', '查看系统用户列表'),
                ('users:write', '管理用户', '创建、编辑、删除系统用户'),
                ('roles:read', '查看角色', '查看角色列表'),
                ('roles:write', '管理角色', '创建、编辑、删除角色及分配权限');

            INSERT INTO roles (code, name, description) VALUES
                ('admin', '系统管理员', '拥有全部权限'),
                ('editor', '编辑者', '可查看和编辑数据，不可删除'),
                ('viewer', '查看者', '仅查看，不可修改');
        ''')

        cur.execute(
            "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
            ("admin", admin_hash, "系统管理员")
        )

        cur.executescript('''
            INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

            INSERT INTO role_permissions (role_id, permission_id)
                SELECT 1, id FROM permissions;

            INSERT INTO role_permissions (role_id, permission_id)
                SELECT 2, id FROM permissions WHERE code NOT IN
                ('projects:delete', 'employees:delete', 'finance:delete', 'users:read', 'users:write', 'roles:read', 'roles:write');

            INSERT INTO role_permissions (role_id, permission_id)
                SELECT 3, id FROM permissions WHERE code LIKE '%:read';
        ''')
        conn.commit()
    conn.close()
