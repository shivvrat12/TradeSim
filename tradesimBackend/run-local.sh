#!/usr/bin/env bash
# Run TradeSim backend without Docker, using Homebrew Postgres, Redis and Kafka.
#
#   ./run-local.sh start     build jars and start all services in the background
#   ./run-local.sh stop      stop all services
#   ./run-local.sh status    show which services are running
#   ./run-local.sh logs svc  tail a service's log (e.g. logs trade-service)
#
# Env overrides: JAVA_HEAP (default 256m), SKIP_BUILD=1 to reuse existing jars.

set -euo pipefail

cd "$(dirname "$0")"

SERVICES=(market-service auth-service portfolio-service trade-service)
RUN_DIR=".local-run"
JAVA_HEAP="${JAVA_HEAP:-256m}"

mkdir -p "$RUN_DIR"

port_open() { nc -z localhost "$1" >/dev/null 2>&1; }

check_deps() {
  local ok=1
  if ! port_open 5432; then
    echo "✗ Postgres not reachable on 5432   →  brew services start postgresql@14"; ok=0
  elif ! PGPASSWORD=123 psql -h localhost -U shiv -d tradesimdb -c 'select 1' >/dev/null 2>&1; then
    echo "✗ Postgres user/db missing         →  psql -d postgres -c \"CREATE ROLE shiv LOGIN PASSWORD '123';\" -c \"CREATE DATABASE tradesimdb OWNER shiv;\""; ok=0
  fi
  port_open 6379 || { echo "✗ Redis not reachable on 6379      →  brew services start redis"; ok=0; }
  port_open 9092 || { echo "✗ Kafka not reachable on 9092      →  brew install kafka && brew services start kafka"; ok=0; }
  [[ $ok == 1 ]] || exit 1
  echo "✓ Postgres, Redis and Kafka are up"
}

is_running() {
  local pid_file="$RUN_DIR/$1.pid"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

boot_jar() {
  # Newest Spring Boot jar for the service (skips the "-plain" library jar)
  ls -t "$1"/build/libs/*.jar 2>/dev/null | grep -v -- '-plain.jar' | head -1
}

start() {
  check_deps

  if [[ "${SKIP_BUILD:-0}" != 1 ]]; then
    echo "Building jars..."
    sh ./gradlew -q bootJar -x test
  fi

  for svc in "${SERVICES[@]}"; do
    if is_running "$svc"; then
      echo "• $svc already running (pid $(cat "$RUN_DIR/$svc.pid"))"
      continue
    fi
    local jar
    jar="$(boot_jar "$svc")"
    [[ -n "$jar" ]] || { echo "✗ No jar found for $svc"; exit 1; }
    nohup java -Xmx"$JAVA_HEAP" -jar "$jar" --spring.profiles.active=local \
      > "$RUN_DIR/$svc.log" 2>&1 &
    echo $! > "$RUN_DIR/$svc.pid"
    echo "• started $svc (pid $!, log $RUN_DIR/$svc.log)"
  done

  echo
  echo "Ports: market 8080 · auth 8081 · portfolio 8082 · trade 8083"
  echo "Frontend: cd ../tradesimFronrEnd/tradeSim && npm run dev"
}

stop() {
  for svc in "${SERVICES[@]}"; do
    if is_running "$svc"; then
      kill "$(cat "$RUN_DIR/$svc.pid")"
      echo "• stopped $svc"
    fi
    rm -f "$RUN_DIR/$svc.pid"
  done
}

status() {
  for svc in "${SERVICES[@]}"; do
    if is_running "$svc"; then
      echo "● $svc running (pid $(cat "$RUN_DIR/$svc.pid"))"
    else
      echo "○ $svc stopped"
    fi
  done
}

case "${1:-}" in
  start)  start ;;
  stop)   stop ;;
  status) status ;;
  logs)   tail -f "$RUN_DIR/${2:?usage: $0 logs <service>}.log" ;;
  *)      sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
