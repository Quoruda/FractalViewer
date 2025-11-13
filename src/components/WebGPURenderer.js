import { BaseRenderer } from './BaseRenderer.js';

/**
 * Renderer WebGPU - supporte WGSL
 */
export class WebGPURenderer extends BaseRenderer {
    constructor(canvas, options = {}) {
        super(canvas, options);
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.uniformBuffer = null;
        this.bindGroup = null;
    }

    async initialize(shaders) {
        try {
            if (!navigator.gpu) {
                throw new Error('WebGPU non supporté par ce navigateur');
            }

            // Obtenir l'adaptateur et le device
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                throw new Error('Aucun adaptateur WebGPU trouvé');
            }

            this.device = await adapter.requestDevice();

            // Configurer le context
            this.context = this.canvas.getContext('webgpu');
            const format = navigator.gpu.getPreferredCanvasFormat();

            this.context.configure({
                device: this.device,
                format: format,
                alphaMode: 'opaque',
            });

            // Créer le uniform buffer (16 bytes aligned)
            // vec2 resolution (8 bytes) + float time (4 bytes) + padding (4 bytes)
            // + vec2 offset (8 bytes) + float zoom (4 bytes) + padding (4 bytes)
            // Total: 32 bytes
            this.uniformBuffer = this.device.createBuffer({
                size: 32, // 8 floats * 4 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            // Créer le shader module
            const shaderModule = this.device.createShaderModule({
                code: this._buildFullShader(shaders.vertex, shaders.fragment)
            });

            // Créer le bind group layout
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: { type: 'uniform' }
                    }
                ]
            });

            // Créer le pipeline layout
            const pipelineLayout = this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            });

            // Créer le pipeline
            this.pipeline = this.device.createRenderPipeline({
                layout: pipelineLayout,
                vertex: {
                    module: shaderModule,
                    entryPoint: 'vs_main',
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: 'fs_main',
                    targets: [{ format: format }]
                },
                primitive: {
                    topology: 'triangle-strip',
                }
            });

            // Créer le bind group
            this.bindGroup = this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: this.uniformBuffer }
                    }
                ]
            });

        } catch (error) {
            throw new Error(`WebGPU initialization failed: ${error.message}`);
        }
    }

    _buildFullShader(vertexShader, fragmentShader) {
        // Le vertex shader par défaut si non fourni
        const defaultVertex = `
      @vertex
      fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
        // Rectangle plein écran (triangle strip)
        var pos = array<vec2<f32>, 4>(
          vec2<f32>(-1.0, -1.0),
          vec2<f32>( 1.0, -1.0),
          vec2<f32>(-1.0,  1.0),
          vec2<f32>( 1.0,  1.0)
        );
        return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
      }
    `;

        const vertex = vertexShader || defaultVertex;

        // Combiner avec la structure uniforms
        return `
      struct Uniforms {
        resolution: vec2<f32>,
        time: f32,
        _padding1: f32,
        offset: vec2<f32>,
        zoom: f32,
        _padding2: f32,
      }

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      ${vertex}

      ${fragmentShader}
    `;
    }

    setUniforms(uniforms) {
        if (!this.device || !this.uniformBuffer) return;

        // Créer un Float32Array pour les uniforms (8 floats = 32 bytes)
        const uniformData = new Float32Array(8);

        // resolution (vec2)
        if (uniforms.resolution) {
            uniformData[0] = uniforms.resolution.x;
            uniformData[1] = uniforms.resolution.y;
        }

        // time (float) + padding
        if (uniforms.time !== undefined) {
            uniformData[2] = uniforms.time;
        }
        uniformData[3] = 0; // padding

        // offset (vec2) - INVERSER Y pour WebGPU
        if (uniforms.offset) {
            uniformData[4] = uniforms.offset.x;
            uniformData[5] = -uniforms.offset.y; // Inversion de l'axe Y
        }

        // zoom (float) + padding
        if (uniforms.zoom !== undefined) {
            uniformData[6] = uniforms.zoom;
        }
        uniformData[7] = 0; // padding

        // Écrire dans le buffer
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }

    render() {
        if (!this.device || !this.pipeline || !this.context) return;

        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
            }]
        });

        renderPass.setPipeline(this.pipeline);
        renderPass.setBindGroup(0, this.bindGroup);
        renderPass.draw(4); // 4 vertices pour triangle strip
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    dispose() {
        if (this.uniformBuffer) {
            this.uniformBuffer.destroy();
            this.uniformBuffer = null;
        }

        this.pipeline = null;
        this.bindGroup = null;
        this.context = null;
        this.device = null;
    }

    getType() {
        return 'webgpu';
    }
}