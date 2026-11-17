FROM python:3.12-slim

LABEL org.opencontainers.image.source="https://github.com/carvalhopecanha/musical-display-of-power" \
      org.opencontainers.image.description="Musical Display of Power: organize your songs, ideas, versions, tabs and MIDI" \
      org.opencontainers.image.licenses="MIT"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MDOP_LIBRARY=/library \
    MDOP_IMPORT_ROOTS=/import \
    MDOP_PORT=8090

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8090/api/health', timeout=4)" || exit 1

CMD ["python", "-m", "app"]
