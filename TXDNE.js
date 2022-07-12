/*
Copyright 2020 AnnikaV9

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*****************/
/* MISC. HELPERS */
/*****************/

/*	Returns the passed object if it’s truthy, or a newly created HTMLElement.
	Æ(x) is the element analogue of (x||{}).
	*/
function Æ(x) {
	return x || document.createElement(null);
}

/*********/
/* TXDNE */
/*********/

//	This function is called when a waifu box needs to be loaded.
function loadWaifu(waifuLink) {
	waifuLink.dataset.id = getRandomWaifuID().toString();
	if (TXDNE.leftPadWaifuIDsWithZeroes)
		waifuLink.dataset.id = waifuLink.dataset.id.padStart(`${TXDNE.waifuSetSize}`.length - 1, '0');
	waifuLink.href = `${TXDNE.waifuSourceURLBase}${waifuLink.dataset.id}.${TXDNE.waifuSourceURLFileExtension}`;
	waifuLink.querySelector("img").src = waifuLink.href;
}
function rollDie(dieSize) {
	return (1 + Math.floor(Math.random() * dieSize));
}
function getRandomWaifuID() {
	return (rollDie(TXDNE.waifuSetSize) - 1);
}
function adjustGridOffsetBy(xOffset, yOffset) {
	TXDNE.waifuQuilt.offsetX += xOffset;
	TXDNE.waifuQuilt.offsetY += yOffset;
	TXDNE.waifuQuilt.style.transform = `translate(${TXDNE.waifuQuilt.offsetX + 'px'}, ${TXDNE.waifuQuilt.offsetY + 'px'})`;
}
//	Recompute grid parameters.
function recomputeWaifuQuiltParameters() {
	let waifusAcross = Math.floor(window.innerWidth / TXDNE.waifuSize) + 2;
	let waifusDown = Math.floor(window.innerHeight / TXDNE.waifuSize) + 2;

	TXDNE.waifusAcross = Math.max(TXDNE.waifusAcross||0, waifusAcross);
	TXDNE.waifusDown = Math.max(TXDNE.waifusDown||0, waifusDown);

	TXDNE.avgWaifusPerFullGridStep = ((waifusAcross * 2) + (waifusDown * 2) + ((waifusAcross + waifusDown - 1) * 4)) / 8;

	let waifuGridStepsPerSecond = TXDNE.waifusPerSecond / TXDNE.avgWaifusPerFullGridStep;
	let pixelsPerSecond = waifuGridStepsPerSecond * TXDNE.waifuSize;
	TXDNE.panTickDistance = (TXDNE.panTickInterval / 1000) * pixelsPerSecond;
}
// Create and return a new waifu link cell.
function createWaifu() {
	let newWaifu = document.createElement("img");
	newWaifu.classList.add("waifu");

	let newWaifuLink = document.createElement("a");
	newWaifuLink.classList.add("waifu-link");
	newWaifuLink.target = "_blank";
	newWaifuLink.appendChild(newWaifu);

	newWaifuLink.addEventListener("mouseover", (event) => {
		if (!TXDNE.waifuQuilt.classList.contains("magnify-on-hover"))
			return;
	
		let atEdge = {
			top: (event.target.dataset.gridPositionY < TXDNE.waifuQuilt.gridYOrigin + 2),
			right: (event.target.dataset.gridPositionX > TXDNE.waifuQuilt.gridXOrigin + TXDNE.waifusAcross - 3),
			bottom: (event.target.dataset.gridPositionY > TXDNE.waifuQuilt.gridYOrigin + TXDNE.waifusDown - 3),
			left: (event.target.dataset.gridPositionX < TXDNE.waifuQuilt.gridXOrigin + 2)
		};
		let waifuHoverAdjustStyle = document.querySelector("#waifu-hover-adjust-style");
		let waifuHoverAdjust = {
			top: (atEdge.top ? "calc(var(--waifu-size) + 1px)" : "unset"),
			right: (atEdge.right ? "calc(var(--waifu-size) + 1px)" : "unset"),
			bottom: (atEdge.bottom ? "calc(var(--waifu-size) + 1px)" : "unset"),
			left: (atEdge.left ? "calc(var(--waifu-size) + 1px)" : "unset")
		};
		waifuHoverAdjustStyle.innerHTML = `
			.waifu-link[data-grid-position-x='${event.target.dataset.gridPositionX}'][data-grid-position-y='${event.target.dataset.gridPositionY}']:hover .waifu,
			.waifu-link[data-grid-position-x='${event.target.dataset.gridPositionX}'][data-grid-position-y='${event.target.dataset.gridPositionY}']:hover::after {
				top: ${waifuHoverAdjust.top};
				right: ${waifuHoverAdjust.right};
				bottom: ${waifuHoverAdjust.bottom};
				left: ${waifuHoverAdjust.left};
			}
		`;
	});
	
	return newWaifuLink;
}

function populateGrid() {
	/*	Each waifu box is an <img> tag wrapped in an <a> tag.
		Here we create the boxes and place them on the grid.
		*/
	let totalWaifus = TXDNE.waifusAcross * TXDNE.waifusDown;
	for (var i = 0; i < totalWaifus; i++) {
		let gridPositionX = Math.floor(i % TXDNE.waifusAcross);
		let gridPositionY = Math.floor(i / TXDNE.waifusAcross);
		if (!TXDNE.waifuQuilt.querySelector(`[data-grid-position-x='${gridPositionX}'][data-grid-position-y='${gridPositionY}']`)) {
			let newWaifuLink = createWaifu();
			newWaifuLink.dataset.gridPositionX = gridPositionX;
			newWaifuLink.dataset.gridPositionY = gridPositionY;
			newWaifuLink.style.left = newWaifuLink.dataset.gridPositionX * (TXDNE.waifuSize + 1) + 'px';
			newWaifuLink.style.top = newWaifuLink.dataset.gridPositionY * (TXDNE.waifuSize + 1) + 'px';			
			TXDNE.waifuQuilt.appendChild(newWaifuLink);
			loadWaifu(newWaifuLink);
		}			
	}
}

function addRow(where) {
	for (var j = 0; j < TXDNE.waifusAcross; j++) {
		let newWaifuLink = createWaifu();
		newWaifuLink.dataset.gridPositionX = j + TXDNE.waifuQuilt.gridXOrigin;
		newWaifuLink.dataset.gridPositionY = (where == "bottom") ? (TXDNE.waifuQuilt.gridYOrigin + TXDNE.waifusDown) : (TXDNE.waifuQuilt.gridYOrigin - 1);
		newWaifuLink.style.left = newWaifuLink.dataset.gridPositionX * (TXDNE.waifuSize + 1) + 'px';
		newWaifuLink.style.top = newWaifuLink.dataset.gridPositionY * (TXDNE.waifuSize + 1) + 'px';
		loadWaifu(newWaifuLink);
		TXDNE.waifuQuilt.appendChild(newWaifuLink);
	}
	TXDNE.waifusDown++;
	if (where == "top") TXDNE.waifuQuilt.gridYOrigin--;
}

function addColumn(where) {
	for (var k = 0; k < TXDNE.waifusDown; k++) {
		let newWaifuLink = createWaifu();
		newWaifuLink.dataset.gridPositionX = (where == "right") ? (TXDNE.waifuQuilt.gridXOrigin + TXDNE.waifusAcross) : (TXDNE.waifuQuilt.gridXOrigin - 1);
		newWaifuLink.dataset.gridPositionY = k + TXDNE.waifuQuilt.gridYOrigin;
		newWaifuLink.style.left = newWaifuLink.dataset.gridPositionX * (TXDNE.waifuSize + 1) + 'px';
		newWaifuLink.style.top = newWaifuLink.dataset.gridPositionY * (TXDNE.waifuSize + 1) + 'px';
		loadWaifu(newWaifuLink);
		TXDNE.waifuQuilt.appendChild(newWaifuLink);
	}
	TXDNE.waifusAcross++;
	if (where == "left") TXDNE.waifuQuilt.gridXOrigin--;
}

function removeRow(where) {
	let rowYPosition = (where == "top") ? TXDNE.waifuQuilt.gridYOrigin : (TXDNE.waifuQuilt.gridYOrigin + TXDNE.waifusDown);
	TXDNE.waifuQuilt.querySelectorAll(`.waifu-link[data-grid-position-y='${rowYPosition}']`).forEach(waifuLink => {
		waifuLink.remove();
	});
	TXDNE.waifusDown--;
	if (where == "top") TXDNE.waifuQuilt.gridYOrigin++;
}

function removeColumn(where) {
	let columnXPosition = (where == "left") ? TXDNE.waifuQuilt.gridXOrigin : (TXDNE.waifuQuilt.gridXOrigin + TXDNE.waifusAcross);
	TXDNE.waifuQuilt.querySelectorAll(`.waifu-link[data-grid-position-x='${columnXPosition}']`).forEach(waifuLink => {
		waifuLink.remove();
	});
	TXDNE.waifusAcross--;
	if (where == "left") TXDNE.waifuQuilt.gridXOrigin++;
}

function updateGrid() {
	let leftOfGrid = TXDNE.waifuQuilt.querySelector(`.waifu-link[data-grid-position-x='${TXDNE.waifuQuilt.gridXOrigin}']`).getBoundingClientRect().left;
	let rightOfGrid = leftOfGrid + TXDNE.waifusAcross * (TXDNE.waifuSize + 1);
	let topOfGrid = TXDNE.waifuQuilt.querySelector(`.waifu-link[data-grid-position-y='${TXDNE.waifuQuilt.gridYOrigin}']`).getBoundingClientRect().top;
	let bottomOfGrid = topOfGrid + TXDNE.waifusDown * (TXDNE.waifuSize + 1);
	
	let gridBounds = {
		left: leftOfGrid,
		right: rightOfGrid,
		top: topOfGrid,
		bottom: bottomOfGrid
	};

	gridNeedsUpdating = gridBounds.left >  0 - TXDNE.waifuSize ||
						gridBounds.right < window.innerWidth + TXDNE.waifuSize ||
						gridBounds.top > 0 - TXDNE.waifuSize ||
						gridBounds.bottom < window.innerHeight + TXDNE.waifuSize ||
						gridBounds.left < 0 - (2 * TXDNE.waifuSize) ||
						gridBounds.right > window.innerWidth + (2 * TXDNE.waifuSize) ||
						gridBounds.top < 0 - (2 * TXDNE.waifuSize) ||
						gridBounds.bottom > window.innerHeight + (2 * TXDNE.waifuSize);

	if (gridNeedsUpdating) {
		// Add column, if needed.
		if (gridBounds.left > 0 - TXDNE.waifuSize) {
			// Add column left
			console.log("Adding column left...");
			addColumn("left");
		} else if (gridBounds.right < window.innerWidth + TXDNE.waifuSize) {
			// Add column right
			console.log("Adding column right...");
			addColumn("right");
		}

		// Add row, if needed.
		if (gridBounds.top > 0 - TXDNE.waifuSize) {
			// Add row top
			console.log("Adding row top...");
			addRow("top");
		} else if (gridBounds.bottom < window.innerHeight + TXDNE.waifuSize) {
			// Add row bottom
			console.log("Adding row bottom...");
			addRow("bottom");
		}

		// Remove column, if needed.
		if (gridBounds.left < 0 - (2 * TXDNE.waifuSize)) {
			// Remove column left
			console.log("Removing column left...");
			removeColumn("left");
		} else if (gridBounds.right > window.innerWidth + (2 * TXDNE.waifuSize)) {
			// Remove column right
			console.log("Removing column right...");
			removeColumn("right");
		}

		// Remove row, if needed.
		if (gridBounds.top < 0 - (2 * TXDNE.waifuSize)) {
			// Remove row top
			console.log("Removing row top...");
			removeRow("top");
		} else if (gridBounds.bottom > window.innerHeight + (2 * TXDNE.waifuSize)) {
			// Remove row bottom
			console.log("Removing row bottom...");
			removeRow("bottom");
		}
	}

	return gridNeedsUpdating;
}

function waifuSetup() {
	TXDNE.waifuQuilt = document.querySelector(TXDNE.waifuQuiltSelector);

	/*	Create a number of waifu boxes such that there are just enough to 
		fully tile the window (possibly exceeding the window’s dimensions,
		as the window width and height are almost certainly not going to be
		integer multiples of the width of a box - plus 1 more row & column.
		This is done so that we can give the grid a negative offset (to 
		create the illusion of an infinite grid), while still ensuring that
		the window is fully tiled, with no black areas along the right and
		lower edges.
		*/
	TXDNE.waifuQuilt.gridXOrigin = 0;	
	TXDNE.waifuQuilt.gridYOrigin = 0;	
	
	recomputeWaifuQuiltParameters();
	
	populateGrid();

	TXDNE.waifuQuilt.offsetX = 0;
	TXDNE.waifuQuilt.offsetY = 0;
	/*	As noted above, we offset the grid up and to the left, so as to
		make it seem like we’re looking at just a part of an infinite grid.
		The offset is random, and different on every page load.
		*/
	let offset = -1 * Math.round(Math.random() * TXDNE.waifuSize);
	adjustGridOffsetBy(offset, offset);
	TXDNE.waifuQuilt.redirectChance = 100001;

	document.querySelector("head").insertAdjacentHTML("beforeend", "<style id='waifu-hover-adjust-style'></style>");
	
	TXDNE.pendingXMovement = 0;
	TXDNE.pendingYMovement = 0;
	
	window.waifuQuiltPanTickFunction = () => {
		var direction;
		if (rollDie(100000) < TXDNE.waifuQuilt.redirectChance) {
			if (typeof TXDNE.waifuQuilt.direction != "undefined") {
				direction = (TXDNE.waifuQuilt.direction + (Math.PI * ((rollDie(5) - 3) * 45) / 180.0)) % (2 * Math.PI);
			} else {
				direction = Math.PI * (rollDie(8) * 45) / 180.0;
			}
			TXDNE.waifuQuilt.direction = direction;
			TXDNE.waifuQuilt.redirectChance = 1;
		} else {
			direction = TXDNE.waifuQuilt.direction;
			TXDNE.waifuQuilt.redirectChance++;
		}
		
		TXDNE.pendingXMovement += TXDNE.panTickDistance * Math.round(Math.cos(direction));
		TXDNE.pendingYMovement += TXDNE.panTickDistance * Math.round(Math.sin(direction));

		var xMovement = Math.floor(TXDNE.pendingXMovement);
		var yMovement = Math.floor(TXDNE.pendingYMovement);
		
		TXDNE.pendingXMovement -= xMovement;
		TXDNE.pendingYMovement -= yMovement;

		updateGrid();
		
		adjustGridOffsetBy(xMovement, yMovement);
	}

	/********************/
	/* DRAG TO PAN GRID */
	/********************/

	TXDNE.dragging = false;

	window.addEventListener("mouseup", TXDNE.dragEndEvent = (event) => {
		window.onmousemove = '';
		window.ontouchmove = '';

		// We only want to do anything on left-clicks.
		if (event.button != 0) return;

		TXDNE.dragging = false;
		TXDNE.dragBeginTarget.style.pointerEvents = "auto";
		event.preventDefault();

		recomputeWaifuQuiltParameters();
		populateGrid();
		if (TXDNE.gridWasScrollingPriorToDrag)
			window.waifuQuiltPanTickTock = setInterval(window.waifuQuiltPanTickFunction, TXDNE.panTickInterval);

		return false;
	});
	window.addEventListener("touchend", TXDNE.dragEndEvent);
	window.addEventListener("touchcancel", (event) => {
		window.onmousemove = '';
		window.ontouchmove = '';

		TXDNE.dragging = false;
		TXDNE.dragBeginTarget.style.pointerEvents = "auto";
	});
	window.addEventListener("mousedown", TXDNE.dragBeginEvent = (event) => {
		// We only want to do anything on left-clicks.
		if (event.button != 0) return;

		event.preventDefault();

		TXDNE.gridWasScrollingPriorToDrag = (window.waifuQuiltPanTickTock != null);
		if (TXDNE.gridWasScrollingPriorToDrag) {
			clearInterval(window.waifuQuiltPanTickTock);
			window.waifuQuiltPanTickTock = null;
		}
		
		TXDNE.mouseCoordX = event.clientX;
		TXDNE.mouseCoordY = event.clientY;

		TXDNE.dragBeginTarget = event.target;

		window.onmousemove = TXDNE.dragMoveEvent = (event) => {
			if (TXDNE.dragging == false)
				TXDNE.dragBeginTarget.style.pointerEvents = "none";
			TXDNE.dragging = true;

			let xMovement = event.clientX - TXDNE.mouseCoordX;
			let yMovement = event.clientY - TXDNE.mouseCoordY;

			TXDNE.mouseCoordX = event.clientX;
			TXDNE.mouseCoordY = event.clientY;

			adjustGridOffsetBy(xMovement, yMovement);
			updateGrid();
		};
		window.ontouchmove = TXDNE.dragMoveEvent;
	});
	window.addEventListener("touchstart", TXDNE.dragBeginEvent);

	//	Begin the panning tick timer.
	window.waifuQuiltPanTickTock = setInterval(window.waifuQuiltPanTickFunction, TXDNE.panTickInterval);
}
//	Set up the grid.
waifuSetup();
//	Add the ‘hidden’ class to the headings, so they’ll fade out slowly.
setTimeout(() => {
	document.querySelectorAll("h1, h2, #controls button.full-screen").forEach(heading => {
		heading.classList.add("hidden");
	});
}, 0);

/************/
/* CONTROLS */
/************/

function toggleFullScreen(on) {
	if (typeof on == "undefined") {
		toggleFullScreen(!isFullScreen());
		return;
	}
	if (on) {
		let body = document.querySelector("body");
		[
			"requestFullscreen",
			"webkitRequestFullscreen",
			"mozRequestFullscreen"
		].forEach(f => {
			if (body[f] && !isFullScreen()) body[f]();
			else return;
		});
	} else {
		[
			"exitFullscreen",
			"webkitExitFullscreen",
			"mozExitFullscreen"
		].forEach(f => {
			if (document[f] && isFullScreen()) document[f]();
			else return;
		});
	}
}
Æ(document.querySelector("#controls button.full-screen")).addEventListener("click", (event) => {
	toggleFullScreen();
});
document.addEventListener("keyup", (event) => {
	switch (event.key) {
		case 'f':
			toggleFullScreen();
			break;
		case 'z':
			TXDNE.waifuQuilt.classList.toggle("magnify-on-hover");
			break;
		case '0':
			clearInterval(window.waifuQuiltPanTickTock);
			window.waifuQuiltPanTickTock = null;
			break;
		case ' ':
		case 'Spacebar':
			if (window.waifuQuiltPanTickTock) {
				clearInterval(window.waifuQuiltPanTickTock);
				window.waifuQuiltPanTickTock = null;
			} else {
				window.waifuQuiltPanTickTock = setInterval(window.waifuQuiltPanTickFunction, TXDNE.panTickInterval);
			}
			break;
		case "ArrowDown":
		case "Down":
			adjustGridOffsetBy(0, -1 * (TXDNE.waifuSize / 2));
			updateGrid();
			break;
		case "ArrowRight":
		case "Right":
			adjustGridOffsetBy(-1 * (TXDNE.waifuSize / 2), 0);
			updateGrid();
			break;
		case "ArrowUp":
		case "Up":
			adjustGridOffsetBy(0, (TXDNE.waifuSize / 2));
			updateGrid();
			break;
		case "ArrowLeft":
		case "Left":
			adjustGridOffsetBy((TXDNE.waifuSize / 2), 0);
			updateGrid();
			break;
		case "PageDown":
			adjustGridOffsetBy(0, -1 * (TXDNE.waifuSize * (TXDNE.waifusDown - 3)));
			while(updateGrid());
			break;
		case "PageUp":
			adjustGridOffsetBy(0, (TXDNE.waifuSize * (TXDNE.waifusDown - 3)));
			while(updateGrid());
			break;
		default:
			if (parseInt(event.key)) {
				console.log(TXDNE);
				let speeds = {
					'1': 0.25,
					'2': 0.5,
					'3': 1.0,
					'4': 2.0,
					'5': 5.0,
					'6': -5.0,
					'7': -2.0,
					'8': -1.0,
					'9': -0.5
				};
				TXDNE.waifusPerSecond = speeds[event.key];
				recomputeWaifuQuiltParameters();
				if (!window.waifuQuiltPanTickTock)
					window.waifuQuiltPanTickTock = setInterval(window.waifuQuiltPanTickFunction, TXDNE.panTickInterval);
			}
			break;
	}
});

window.addEventListener("wheel", (event) => {
	event.preventDefault();

	let scrollX = event.deltaX == 0 ? 0 : (Math.min(Math.abs(event.deltaX), TXDNE.waifusAcross) * (Math.abs(event.deltaX) / event.deltaX));
	let scrollY = event.deltaY == 0 ? 0 : (Math.min(Math.abs(event.deltaY), TXDNE.waifusDown) * (Math.abs(event.deltaY) / event.deltaY));
	
	adjustGridOffsetBy(scrollX * TXDNE.waifuSize * -0.0625, scrollY * TXDNE.waifuSize * -0.0625);
	updateGrid();
});

function flashFadingElement(element) {
	element.classList.toggle("hidden");
	setTimeout(() => {
		element.classList.toggle("hidden");
	}, 50);
}
function updateFullScreenButton() {
	let fullScreenButton = Æ(document.querySelector("#controls button.full-screen"));
	flashFadingElement(fullScreenButton);
	if (isFullScreen()) {
		fullScreenButton.classList.add("engaged");
		fullScreenButton.innerHTML = '&#xf326;';
	} else {
		fullScreenButton.classList.remove("engaged");
		fullScreenButton.innerHTML = '&#xf320;';
	}
}
function isFullScreen() {
	return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement;
}
window.addEventListener("resize", (event) => {
	updateFullScreenButton();
	let gridWasScrolling = (window.waifuQuiltPanTickTock != null);
	clearInterval(window.waifuQuiltPanTickTock);
	recomputeWaifuQuiltParameters();
	populateGrid();
	if (gridWasScrolling)
		window.waifuQuiltPanTickTock = setInterval(window.waifuQuiltPanTickFunction, TXDNE.panTickInterval);
});
