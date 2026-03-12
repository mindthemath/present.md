clean:
	rm bun.lock package.json
	rm -rf node_modules/
	rm -rf .screenshots/

test:
	SCREENSHOT_NUM_WORKERS=6 SCREENSHOT_ZOOM_LEVEL=1 ./scripts/capture-screenshots.sh

