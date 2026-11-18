.PHONY: cv clean
.PHONY: dev serve site

# Get the absolute path of the project root
ROOT_DIR := $(shell pwd)

# Create necessary directories
$(shell mkdir -p $(ROOT_DIR)/docs/static/public)

dev:
	@echo "Setting up development dependencies..."
	@# Install system packages on Debian/Ubuntu if missing (may prompt for sudo)
	@if ! command -v node >/dev/null 2>&1; then \
		echo "node not found — installing nodejs and npm (sudo may be required)"; \
		sudo apt-get update && sudo apt-get install -y nodejs npm; \
	fi
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

serve:
	@cd $(ROOT_DIR)/docs && npm run dev

site:
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
