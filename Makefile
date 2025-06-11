.PHONY: cv clean

# Get the absolute path of the project root
ROOT_DIR := $(shell pwd)

# Create necessary directories
$(shell mkdir -p $(ROOT_DIR)/docs/public)

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
		cp cv.pdf $(ROOT_DIR)/docs/public/Alessandro_Sanvito_CV.pdf && \
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
