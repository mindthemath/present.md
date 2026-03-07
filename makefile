clean:
	rm bun.lock package.json
	rm -rf node_modules/
	rm -rf .screenshots/

test:
	SCREENSHOT_ZOOM_LEVEL=1 ./scripts/capture-screenshots.sh

