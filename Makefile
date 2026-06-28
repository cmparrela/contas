.PHONY: help install dev api web typecheck lint lint-fix

# ──────────────────────────────────────────────
# General
# ──────────────────────────────────────────────

help: ## Lists all available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Installs monorepo dependencies
	pnpm install

# ──────────────────────────────────────────────
# Dev servers
# ──────────────────────────────────────────────

dev: ## Starts API + Web in parallel
	pnpm --filter @contas/api dev & pnpm --filter @contas/web dev

api: ## Starts only the API (port 3333)
	pnpm --filter @contas/api dev

web: ## Starts only the web app (port 3000)
	pnpm --filter @contas/web dev

# ──────────────────────────────────────────────
# Quality
# ──────────────────────────────────────────────

typecheck: ## Type-checks all packages
	pnpm typecheck

lint: ## Biome check
	pnpm lint

lint-fix: ## Biome check with auto-fix
	pnpm lint:fix
