"""Optional username and password protection (a single user).

- The password is stored as PBKDF2-SHA256 with a salt, never as plain text.
- The session is a signed (HMAC) cookie valid for 30 days.
- Changing the password or removing protection changes the secret and logs out every browser.
- After 5 wrong passwords from the same address, that address waits 5 minutes.
"""
import hashlib
import hmac
import secrets
import threading
import time
from typing import Optional

from .library import LibraryError

COOKIE = "mdop_session"
OLD_COOKIES = ("mdop_sessao",)   # name used by early builds
MAX_FAILS = 5
LOCK_SECONDS = 300
_fails: dict[str, list[float]] = {}
_fails_lock = threading.Lock()
SESSION_DAYS = 30
ITERATIONS = 260_000


def _get(conn, key: str) -> Optional[str]:
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else None


def _set(conn, key: str, value: str) -> None:
    conn.execute("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (key, value))


def _hash(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), ITERATIONS).hex()


def enabled(conn) -> bool:
    return bool(_get(conn, "auth_user") and _get(conn, "auth_hash"))


def user(conn) -> Optional[str]:
    return _get(conn, "auth_user")


def _validate(username: str, password: str) -> str:
    username = (username or "").strip()
    if not username:
        raise LibraryError("Enter the username.")
    if len(password or "") < 8:
        raise LibraryError("The password must have at least 8 characters.")
    return username


def setup(conn, username: str, password: str) -> None:
    if enabled(conn):
        raise LibraryError("Protection is already on.")
    username = _validate(username, password)
    salt = secrets.token_hex(16)
    _set(conn, "auth_user", username)
    _set(conn, "auth_salt", salt)
    _set(conn, "auth_hash", _hash(password, salt))
    _set(conn, "auth_secret", secrets.token_hex(32))


def check_password(conn, username: Optional[str], password: str) -> bool:
    if not enabled(conn):
        return False
    if username is not None and not hmac.compare_digest(username.strip().lower(), (user(conn) or "").lower()):
        return False
    return hmac.compare_digest(_hash(password or "", _get(conn, "auth_salt")), _get(conn, "auth_hash"))


def change_password(conn, current: str, new: str) -> None:
    if not check_password(conn, None, current):
        raise LibraryError("The current password is wrong.")
    _validate(user(conn), new)
    salt = secrets.token_hex(16)
    _set(conn, "auth_salt", salt)
    _set(conn, "auth_hash", _hash(new, salt))
    _set(conn, "auth_secret", secrets.token_hex(32))


def disable(conn, password: Optional[str] = None, force: bool = False) -> None:
    if not force and not check_password(conn, None, password or ""):
        raise LibraryError("The password is wrong.")
    conn.execute("DELETE FROM settings WHERE key IN ('auth_user', 'auth_salt', 'auth_hash', 'auth_secret')")


def make_token(conn) -> str:
    expires = int(time.time()) + SESSION_DAYS * 86400
    payload = f"{user(conn)}|{expires}"
    sig = hmac.new(bytes.fromhex(_get(conn, "auth_secret")), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"


def valid_token(conn, token: Optional[str]) -> bool:
    if not token or not enabled(conn):
        return False
    try:
        name, expires, sig = token.rsplit("|", 2)
        expected = hmac.new(bytes.fromhex(_get(conn, "auth_secret")), f"{name}|{expires}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, expected) and name == user(conn) and int(expires) > time.time()
    except (ValueError, TypeError):
        return False


def session_cookie(cookies) -> Optional[str]:
    return cookies.get(COOKIE) or next((cookies[c] for c in OLD_COOKIES if c in cookies), None)


# ---------------------------------------------------------------- too many wrong passwords

def check_rate(client: str) -> None:
    """Refuse right away while this client is locked out."""
    now = time.time()
    with _fails_lock:
        recent = [t for t in _fails.get(client, []) if now - t < LOCK_SECONDS]
        _fails[client] = recent
        if len(recent) >= MAX_FAILS:
            raise LibraryError("Too many attempts. Try again in {s} seconds.", s=int(LOCK_SECONDS - (now - recent[0])) + 1)


def record_fail(client: str) -> None:
    with _fails_lock:
        _fails.setdefault(client, []).append(time.time())
        if len(_fails) > 10_000:   # never let the table grow without limit
            _fails.clear()


def clear_fails(client: str) -> None:
    with _fails_lock:
        _fails.pop(client, None)
