/**
 * Interface abstraite pour les renderers
 * WebGLRenderer et WebGPURenderer doivent implémenter ces méthodes
 */
export class BaseRenderer {
    constructor(canvas, options = {}) {
        if (new.target === BaseRenderer) {
            throw new Error('BaseRenderer est une classe abstraite');
        }

        this.canvas = canvas;
        this.options = options;
    }

    /**
     * Initialise le renderer (contexte, shaders, buffers...)
     * @param {Object} shaders - { vertex, fragment }
     * @returns {Promise<void>}
     */
    async initialize(shaders) {
        throw new Error('initialize() must be implemented');
    }

    /**
     * Met à jour les uniforms
     * @param {Object} uniforms - { time, resolution, offset, zoom, ... }
     */
    setUniforms(uniforms) {
        throw new Error('setUniforms() must be implemented');
    }

    /**
     * Effectue un rendu
     */
    render() {
        throw new Error('render() must be implemented');
    }

    /**
     * Nettoie les ressources
     */
    dispose() {
        throw new Error('dispose() must be implemented');
    }

    /**
     * Retourne le type de renderer
     * @returns {string} 'webgl' | 'webgpu'
     */
    getType() {
        throw new Error('getType() must be implemented');
    }
}