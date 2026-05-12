import queue
import threading
import atexit
import sys

MAX_BATCH_SIZE = 100

_log_queue = queue.Queue()
_worker_thread = None
_running = threading.Event()
_stop_event = threading.Event()


def _flush_batch(entries):
    from database import get_db
    if not entries:
        return
    try:
        db = get_db()
        cur = db.cursor()
        cur.executemany(
            "INSERT INTO audit_logs (username, display_name, action, resource, resource_id, detail, ip_address) VALUES (?,?,?,?,?,?,?)",
            entries
        )
        db.commit()
        db.close()
    except Exception as e:
        print(f"[Logger] 写入日志失败: {e}", file=sys.stderr)


def _worker():
    while not _stop_event.is_set():
        try:
            batch = []
            item = _log_queue.get(timeout=1)
            batch.append(item)
            while len(batch) < MAX_BATCH_SIZE:
                try:
                    item = _log_queue.get_nowait()
                    batch.append(item)
                except queue.Empty:
                    break
            _flush_batch(batch)
        except queue.Empty:
            continue


def log_operation(username, display_name, action, resource, resource_id="", detail="", ip_address=""):
    if not _running.is_set():
        return
    _log_queue.put((username, display_name, action, resource, str(resource_id), detail, ip_address))
    print(f"[审计日志] {display_name}({username}) {action} {resource}" + (f" #{resource_id}" if resource_id else ""))


def start_logger():
    global _worker_thread
    _running.set()
    _stop_event.clear()
    _worker_thread = threading.Thread(target=_worker, daemon=True)
    _worker_thread.start()


def stop_logger():
    _running.clear()
    _stop_event.set()

    if _worker_thread and _worker_thread.is_alive():
        _worker_thread.join(timeout=3)

    # 处理剩余队列
    batch = []
    while len(batch) < MAX_BATCH_SIZE:
        try:
            batch.append(_log_queue.get_nowait())
        except queue.Empty:
            break
    _flush_batch(batch)


atexit.register(stop_logger)
