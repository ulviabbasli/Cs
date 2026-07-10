.PHONY: preflight up down logs restart ps build update

preflight:
	bash scripts/preflight.sh

build:
	docker compose build

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

ps:
	docker compose ps

update:
	bash scripts/update.sh
