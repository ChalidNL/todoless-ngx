#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${GITLEAKS_CONFIG:-.gitleaks.toml}"
REPORT_PATH="${GITLEAKS_REPORT_PATH:-gitleaks-report.sarif}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[ERROR] Config not found: $CONFIG_FILE" >&2
  exit 1
fi

if command -v gitleaks >/dev/null 2>&1; then
  echo "[INFO] Running gitleaks binary scan"
  gitleaks git . --redact --config "$CONFIG_FILE" --report-format sarif --report-path "$REPORT_PATH"
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  echo "[INFO] gitleaks not installed; using docker image"
  docker run --rm \
    -v "$PWD:/repo" \
    zricethezav/gitleaks:v8.24.2 \
    git /repo --redact --config "/repo/$CONFIG_FILE" --report-format sarif --report-path "/repo/$REPORT_PATH"
  exit 0
fi

echo "[ERROR] Neither gitleaks nor docker is available." >&2
echo "Install gitleaks: https://github.com/gitleaks/gitleaks" >&2
exit 1
