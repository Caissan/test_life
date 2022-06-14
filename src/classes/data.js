export default class Data {
	/**
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(width = 100, height = 100) {
		/** @type {number} */
		this.width = width;
		/** @type {number} */
		this.height = height;
		this.clear();
	}

	clear() {
		/** @type {ArrayBuffer} */
		this.buffer = new ArrayBuffer(this.width * this.height);
		/** @type {Uint8Array} */
		this.view = new Uint8Array(this.buffer);
	}

	/**
	 * @param {Data} data
	 */
	copy(data) {
		this.buffer = data.buffer;
		this.view = new Uint8Array(this.buffer);
	}

	random() {
		for (let i = 0; i < this.view.byteLength; i++) {
			this.view[i] = Math.random() > 0.5 ? 1 : 0;
		}
	}

	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @return {number}
	 */
	get(x1 = 0, y1 = 0) {
		const { x, y } = this.correct(x1, y1);
		return this.view[y * this.width + x];
	}

	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} value
	 */
	set(x1 = 0, y1 = 0, value = 0) {
		const { x, y } = this.correct(x1, y1);
		this.view[y * this.width + x] = value;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {{x: number, y: number}}
	 */
	correct(x = 0, y = 0) {
		if (x < 0) {
			x = this.width - 1;
		} else if (x > this.width - 1) {
			x = 0;
		}
		if (y < 0) {
			y = this.height - 1;
		} else if (y > this.height - 1) {
			y = 0;
		}
		return { x, y };
	}
}
