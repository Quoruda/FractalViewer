import { WebGLRenderer } from './WebGLRenderer.js';
import { WebGPURenderer } from './WebGPURenderer.js';

/**
 * Factory pour créer le bon renderer selon la disponibilité et les préférences
 */
export class RendererFactory {
    /**
     * Détecte et crée le renderer approprié
     * @param {HTMLCanvasElement} canvas
     * @param {Object} options
     * @param {string} options.preferredRenderer - 'webgl' | 'webgpu' | 'auto'
     * @param {boolean} options.hasWGSL - Si des shaders WGSL sont fournis
     * @returns {Promise<{renderer: BaseRenderer, warnings: string[]}>}
     */
    static async create(canvas, options = {}) {
        const {
            preferredRenderer = 'auto',
            hasWGSL = false
        } = options;

        const warnings = [];
        let selectedType = null;

        // Cas 1 : Force WebGL
        if (preferredRenderer === 'webgl') {
            selectedType = 'webgl';
        }

        // Cas 2 : Force WebGPU
        else if (preferredRenderer === 'webgpu') {
            if (!hasWGSL) {
                warnings.push('WebGPU demandé mais pas de shaders WGSL fournis. Fallback vers WebGL.');
                selectedType = 'webgl';
            } else if (!this.isWebGPUAvailable()) {
                warnings.push('WebGPU demandé mais non disponible sur ce navigateur. Fallback vers WebGL.');
                selectedType = 'webgl';
            } else {
                selectedType = 'webgpu';
            }
        }

        // Cas 3 : Auto-détection
        else {
            if (this.isWebGPUAvailable() && hasWGSL) {
                // CORRECTION: Tenter WebGPU mais fallback si échec
                selectedType = 'webgpu';
            } else {
                selectedType = 'webgl';
                if (!hasWGSL && this.isWebGPUAvailable()) {
                    warnings.push('WebGPU disponible mais pas de shaders WGSL fournis. Utilisation de WebGL.');
                }
            }
        }

        // Créer le renderer avec gestion d'erreur
        let renderer;
        if (selectedType === 'webgpu') {
            try {
                renderer = new WebGPURenderer(canvas, options);
                await renderer.initialize({
                    vertex: options.wgslVertex,
                    fragment: options.wgslFragment
                });
            } catch (error) {
                // NOUVEAU: Fallback automatique vers WebGL si WebGPU échoue
                warnings.push(`WebGPU initialization failed: ${error.message}. Fallback vers WebGL.`);
                selectedType = 'webgl';
                renderer = new WebGLRenderer(canvas, options);
            }
        } else {
            renderer = new WebGLRenderer(canvas, options);
        }

        return { renderer, warnings, selectedType };
    }

    /**
     * Vérifie si WebGPU est disponible
     * @returns {boolean}
     */
    static async isWebGPUAvailable() {
        if (!('gpu' in navigator)) {
            return false;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            return adapter !== null;
        } catch {
            return false;
        }
    }

    /**
     * Obtient les capacités du navigateur
     * @returns {Object}
     */
    static getCapabilities() {
        return {
            webgl: this.isWebGLAvailable(),
            webgpu: this.isWebGPUAvailable(),
        };
    }

    /**
     * Vérifie si WebGL est disponible
     * @returns {boolean}
     */
    static isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
}