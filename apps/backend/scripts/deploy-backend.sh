#!/usr/bin/env bash
set -Eeuo pipefail

if (( $# != 3 )); then
  echo "usage: deploy-backend.sh DEPLOY_DIR RELEASE_IMAGE IMAGE_ARCHIVE" >&2
  exit 64
fi

deploy_dir=$1
release_image=$2
image_archive=$3
state_file="$deploy_dir/.last-healthy-backend-image"

cleanup() {
  rm -f "$image_archive" "$image_archive.sha256"
}
trap cleanup EXIT

test -f "$image_archive"
test -f "$image_archive.sha256"
(cd "$(dirname "$image_archive")" && sha256sum --check "$(basename "$image_archive").sha256")
gzip --test "$image_archive"
docker load --input "$image_archive"
docker image inspect "$release_image" >/dev/null

cd "$deploy_dir"
test -f .env

previous_image=''
if [[ -f "$state_file" ]]; then
  previous_image=$(<"$state_file")
fi

if [[ -z "$previous_image" ]]; then
  current_container=$(BACKEND_IMAGE="$release_image" docker compose ps -q backend 2>/dev/null || true)
  if [[ -n "$current_container" ]]; then
    previous_image=$(docker inspect --format '{{.Config.Image}}' "$current_container" 2>/dev/null || true)
  fi
fi

export BACKEND_IMAGE="$release_image"

docker compose config --quiet
docker compose up -d db

# The existing backend remains running if this command fails.
docker compose run --rm migration
docker compose up -d --no-deps --force-recreate backend

wait_for_backend() {
  local container_id status
  for _ in {1..30}; do
    container_id=$(docker compose ps -q backend)
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)
    if [[ "$status" == healthy ]]; then
      return 0
    fi
    if [[ "$status" == unhealthy || "$status" == exited || "$status" == dead ]]; then
      return 1
    fi
    sleep 2
  done
  return 1
}

if ! wait_for_backend; then
  docker compose ps >&2 || true
  docker compose logs --tail=100 backend >&2 || true

  if [[ -n "$previous_image" && "$previous_image" != "$release_image" ]]; then
    echo "Readiness failed; rolling back application image to $previous_image" >&2
    export BACKEND_IMAGE="$previous_image"
    if ! docker image inspect "$previous_image" >/dev/null 2>&1; then
      echo "Rollback image is not available locally: $previous_image" >&2
      exit 1
    fi
    docker compose up -d --no-deps --force-recreate backend
    if ! wait_for_backend; then
      echo 'Rollback image also failed readiness' >&2
      docker compose logs --tail=100 backend >&2 || true
    fi
  fi
  exit 1
fi

printf '%s\n' "$release_image" > "$state_file"
docker compose ps
