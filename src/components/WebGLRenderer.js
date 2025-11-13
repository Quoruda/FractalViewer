import { BaseRenderer } from './BaseRenderer.js';

/**
 * Renderer WebGL - supporte GLSL
 */
export class WebGLRenderer extends BaseRenderer {
    constructor(canvas, options = {}) {
        super(canvas, options);
        this.gl = null;
        this.program = null;
        this.uniformLocations = {};
    }

    async initialize(shaders) {
        try {
            this.gl = this.canvas.getContext('webgl') ||
                this.canvas.getContext('experimental-webgl');

            if (!this.gl) {
                throw new Error('WebGL non supporté');
            }

            const vertShader = this._createShader(this.gl.VERTEX_SHADER, shaders.vertex);
            const fragShader = this._createShader(this.gl.FRAGMENT_SHADER, shaders.fragment);
            this.program = this._createProgram(vertShader, fragShader);

            // Cleanup shaders après linking
            this.gl.deleteShader(vertShader);
            this.gl.deleteShader(fragShader);

            // Buffer pour rectangle plein écran
            const positions = new Float32Array([
                -1, -1,
                1, -1,
                -1,  1,
                1,  1,
            ]);

            const positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

            const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

            this.gl.useProgram(this.program);

            // Cache des uniform locations
            this._cacheUniformLocations([
                'u_resolution',
                'u_time',
                'u_offset',
                'u_zoom'
            ]);

        } catch (error) {
            throw new Error(`WebGL initialization failed: ${error.message}`);
        }
    }

    _createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${info}`);
        }

        return shader;
    }

    _createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(`Program link error: ${info}`);
        }

        return program;
    }

    _cacheUniformLocations(uniformNames) {
        uniformNames.forEach(name => {
            this.uniformLocations[name] = this.gl.getUniformLocation(this.program, name);
        });
    }

    setUniforms(uniforms) {
        if (!this.gl || !this.program) return;

        // Uniforms standards
        if (uniforms.resolution && this.uniformLocations.u_resolution) {
            this.gl.uniform2f(
                this.uniformLocations.u_resolution,
                uniforms.resolution.x,
                uniforms.resolution.y
            );
        }

        if (uniforms.time !== undefined && this.uniformLocations.u_time) {
            this.gl.uniform1f(this.uniformLocations.u_time, uniforms.time);
        }

        if (uniforms.offset && this.uniformLocations.u_offset) {
            this.gl.uniform2f(
                this.uniformLocations.u_offset,
                uniforms.offset.x,
                uniforms.offset.y
            );
        }

        if (uniforms.zoom !== undefined && this.uniformLocations.u_zoom) {
            this.gl.uniform1f(this.uniformLocations.u_zoom, uniforms.zoom);
        }

        // NOUVEAU: Gestion des uniforms custom dynamiques
        for (const [key, value] of Object.entries(uniforms)) {
            // Ignore les uniforms déjà traités
            if (['resolution', 'time', 'offset', 'zoom'].includes(key)) {
                continue;
            }

            // Récupère la location (avec préfixe u_)
            const uniformName = `u_${key}`;
            const location = this.gl.getUniformLocation(this.program, uniformName);

            if (location !== null) {
                // Détermine le type et envoie la valeur
                if (typeof value === 'number') {
                    this.gl.uniform1f(location, value);
                } else if (value && typeof value === 'object') {
                    // Support pour vec2, vec3, etc.
                    if (value.x !== undefined && value.y !== undefined && value.z !== undefined) {
                        this.gl.uniform3f(location, value.x, value.y, value.z);
                    } else if (value.x !== undefined && value.y !== undefined) {
                        this.gl.uniform2f(location, value.x, value.y);
                    }
                }
            }
        }
    }

    render() {
        if (!this.gl || !this.program) return;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    dispose() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
        }
        this.gl = null;
        this.uniformLocations = {};
    }

    getType() {
        return 'webgl';
    }
}