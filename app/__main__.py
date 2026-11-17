"""Start the server: python -m app

Extra commands:
  python -m app disable-password   remove password protection (for when the password is forgotten)
"""
import logging
import sys

import uvicorn

from . import config

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    if len(sys.argv) > 1 and sys.argv[1] in ("disable-password", "desligar-senha"):
        from . import auth, db, migrate
        if migrate.needed():
            migrate.run(full_backup=False)
        db.init()
        with db.connect() as conn:
            auth.disable(conn, force=True)
        print("Password protection removed. Create a new password in Settings > Security.\n"
              "Proteção por senha removida. Crie uma nova senha em Configurações > Segurança.")
        sys.exit(0)
    print(f"{config.APP_NAME} {config.VERSION} at http://localhost:{config.PORT}  (library: {config.LIBRARY_DIR})")
    uvicorn.run("app.main:app", host=config.HOST, port=config.PORT)
