import Data from "./classes/data";

/** @type {Data} */
let data = null;

/** @type {Data} */
let dataNext = null;

/** @type {number} */
let width = 100;

/** @type {number} */
let height = 100;

/** @type {boolean} */
let isRun = false;

const update = () => {
	requestAnimationFrame(update);
	//setTimeout(update, 100);

	if (isRun) {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const neighborsCount =
					data.get(x - 1, y - 1) +
					data.get(x, y - 1) +
					data.get(x + 1, y - 1) +
					data.get(x - 1, y) +
					data.get(x + 1, y) +
					data.get(x - 1, y + 1) +
					data.get(x, y + 1) +
					data.get(x + 1, y + 1);

				if (data.get(x, y) === 1) {
					dataNext.set(x, y, neighborsCount < 2 || neighborsCount > 3 ? 0 : 1);
				} else {
					dataNext.set(x, y, neighborsCount === 3 ? 1 : 0);
				}
			}
		}
	}

	if (data && dataNext) {
		let i = 0;
		let x = 0;
		let y = 0;
		const count = dataNext.view.reduce((sum, current) => sum + current, 0);
		const arr = new Float32Array(count * 2);
		dataNext.view.forEach((item) => {
			if (item) {
				arr[i] = x;
				arr[i + 1] = y;
				i += 2;
			}
			x++;
			if (x >= width) {
				x = 0;
				y++;
			}
		});
		self.postMessage({
			cmd: "data",
			count,
			arr,
		});

		data.copy(dataNext);
		if (isRun) dataNext.clear();
	}
};
update();

self.addEventListener("message", (e) => {
	switch (e.data.cmd) {
		case "set":
			width = e.data.width;
			height = e.data.height;

			data = new Data(width, height);
			dataNext = new Data(width, height);
			break;
		case "random":
			data.random();
			dataNext.copy(data);
			break;
		case "start/stop":
			isRun = !isRun;
			self.postMessage({
				cmd: "start/stop",
				status: isRun,
			});
			break;
		case "point":
			data.view[e.data.y * width + e.data.x] = 1;
			//dataNext.copy(data);
			break;
	}
});
