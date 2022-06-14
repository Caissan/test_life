import "./styles/main.scss";
import Canvas from "./classes/canvas";

/**
 * Ширина поля
 * @type {number}
 */
const width = 300;

/**
 * Высота поля
 * @type {number}
 */
const height = 200;

/** @type {Canvas} */
const canvas = new Canvas("#field", width, height);

const time = {
	old: Date.now(),
	new: Date.now(),
};
const fpsElement = document.querySelector("#fps");
const buttonStartElement = document.querySelector("#start-button");
const buttonRandomElement = document.querySelector("#random-button");

const worker = new Worker("src/worker.js", { type: "module" });
worker.addEventListener("message", (e) => {
	switch (e.data.cmd) {
		case "data":
			canvas.draw(e.data.count, e.data.arr);
			break;
		case "start/stop":
			if (e.data.status) {
				buttonStartElement.innerHTML = "Стоп";
			} else {
				buttonStartElement.innerHTML = "Старт";
			}
			break;
	}

	time.new = Date.now();
	fpsElement.innerHTML = Math.round(1000 / (time.new - time.old)).toString();
	time.old = time.new;
});
worker.postMessage({
	cmd: "set",
	width,
	height,
});

buttonRandomElement.addEventListener(
	"click",
	() => {
		worker.postMessage({
			cmd: "random",
		});
	},
	true
);

buttonStartElement.addEventListener(
	"click",
	() => {
		worker.postMessage({
			cmd: "start/stop",
		});
	},
	true
);

canvas.element.addEventListener(
	"click",
	(e) => {
		const x = Math.floor(e.offsetX / canvas.size);
		const y = Math.floor(e.offsetY / canvas.size);
		worker.postMessage({
			cmd: "point",
			x,
			y,
		});
	},
	true
);
