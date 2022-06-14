/**
 * Размер клетки
 * @type {number}
 */
const size = 6;

export default class Canvas {
	/**
	 * @param {string, HTMLElement} parent
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(parent = document.body, width = 100, height = 100) {
		this.parent = parent.constructor.name === "String" ? document.querySelector(parent) : parent;
		this.width = width;
		this.height = height;
		this.size = size;

		this.element = document.createElement("canvas");
		this.element.width = this.width * size;
		this.element.height = this.height * size;
		this.element.style.width = `${this.element.width}px`;
		this.element.style.height = `${this.element.height}px`;
		this.parent.append(this.element);

		this.gl =
			this.element.getContext("webgl2") ||
			this.element.getContext("webgl") ||
			this.element.getContext("experimental-webgl");

		const vertexShaderSource = `
			attribute vec2 spritePosition;
			uniform vec2 screenSize;
			
			void main() {
				float width = 2.0 / screenSize.x;
				float height = -2.0 / screenSize.y;
				float x = -1.0 + 1.0 / screenSize.x;
				float y = 1.0 - 1.0 / screenSize.y;
				vec4 screenTransform = vec4(width, height, x, y);
			    gl_Position = vec4(spritePosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
			    gl_PointSize = ${size}.0 / 1.2;
			}
		`;
		const fragmentShaderSource = `
			void main() {
			    gl_FragColor = vec4(0.4, 0.5, 0.4, 1.0);
			}
		`;

		const loadShader = (type, source) => {
			const shader = this.gl.createShader(type);
			this.gl.shaderSource(shader, source);
			this.gl.compileShader(shader);

			const status = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
			if (!status) {
				throw new TypeError(`Шейдер не скомпилирован:\n${this.gl.getShaderInfoLog(shader)}`);
			}
			return shader;
		};

		const vertexShader = loadShader(this.gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		const status = this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS);
		if (!status) {
			throw new TypeError(
				`Отсутствует связь с шейдерной программой:\n${this.gl.getProgramInfoLog(this.shaderProgram)}`
			);
		}

		this.gl.useProgram(this.shaderProgram);
		this.gl.uniform2f(this.gl.getUniformLocation(this.shaderProgram, "screenSize"), this.width, this.height);

		this.glBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glBuffer);

		const loc = this.gl.getAttribLocation(this.shaderProgram, "spritePosition");
		this.gl.enableVertexAttribArray(loc);
		this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
	}

	/**
	 * @param {number} count
	 * @param {Float32Array} arr
	 */
	draw(count, arr) {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, arr, this.gl.DYNAMIC_DRAW);

		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.useProgram(this.shaderProgram);
		this.gl.drawArrays(this.gl.POINTS, 0, count);
	}
}
