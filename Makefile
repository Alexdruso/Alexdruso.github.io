.PHONY: cv clean
.PHONY: dev serve site node-check

# Get the absolute path of the project root
ROOT_DIR := $(shell pwd)

# Succeeds when node exists and satisfies docs/package.json "engines.node".
NODE_OK = node $(ROOT_DIR)/docs/scripts/check-node.mjs --quiet >/dev/null 2>&1

# Create necessary directories
$(shell mkdir -p $(ROOT_DIR)/docs/static/public)

dev:
	@echo "Setting up development dependencies..."
	@# Install system packages on Debian/Ubuntu if missing (may prompt for sudo).
	@# Astro needs a recent Node 22 and distro nodejs packages are usually older,
	@# so install it from NodeSource when node is missing or too old.
	@if ! $(NODE_OK); then \
		echo "Node missing or too old — installing Node 22 from NodeSource (sudo may be required)"; \
		curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && \
		sudo apt-get install -y nodejs; \
	fi
	@node $(ROOT_DIR)/docs/scripts/check-node.mjs
	@if ! command -v xelatex >/dev/null 2>&1; then \
		echo "xelatex not found — enabling 'universe' repo and installing TeX Live (sudo may be required)"; \
		# Ensure add-apt-repository is available \
		sudo apt-get update && sudo apt-get install -y software-properties-common; \
		# Enable universe (some base images disable it) and refresh \
		sudo add-apt-repository -y universe || true; \
		sudo apt-get update; \
		sudo apt-get install -y texlive-xetex texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra; \
	fi
	@# Install the site's npm dependencies (Astro, Sass, ...)
	@cd $(ROOT_DIR)/docs && npm ci
	@echo "Development dependencies installed."

node-check:
	@node $(ROOT_DIR)/docs/scripts/check-node.mjs --quiet || { \
		echo "Run 'make dev', or 'nvm install' (reads .nvmrc)."; exit 1; }

serve: node-check
	@cd $(ROOT_DIR)/docs && npm run dev

site: node-check
	@cd $(ROOT_DIR)/docs && npm run build && npm run check-links

cv:
	@echo "Building CV..."
	@cd $(ROOT_DIR)/docs/cv-src && \
	if ! command -v xelatex >/dev/null 2>&1; then \
		echo "Error: xelatex is not installed. Please install TeX Live."; \
		exit 1; \
	fi && \
	TEXINPUTS=.:$(ROOT_DIR)/docs/cv-src: xelatex cv.tex && \
	TEXINPUTS=.:$(ROOT_DIR)/docs/cv-src: xelatex cv.tex && \
	if [ -f cv.pdf ]; then \
		cp cv.pdf $(ROOT_DIR)/docs/static/public/Alessandro_Sanvito_CV.pdf && \
		echo "CV built successfully!"; \
	else \
		echo "Error: PDF generation failed"; \
		exit 1; \
	fi

clean:
	@echo "Cleaning up..."
	@cd $(ROOT_DIR)/docs/cv-src && \
	rm -f cv.aux cv.log cv.out cv.pdf
	@echo "Cleanup complete!" 
