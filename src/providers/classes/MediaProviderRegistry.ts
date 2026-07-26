import { injectable, container } from 'tsyringe';
import { IVideoProvider } from '../interfaces/IVideoProvider';
import { RunwayMLProvider } from './RunwayMLProvider';
import { IMediaProviderRegistry } from '../interfaces/IMediaProviderRegistry';

export type MediaType = 'video' | 'image' | 'audio';
export type ProviderName = 'runwayml' | 'lumaai' | 'stable-diffusion' | 'dalle' | 'elevenlabs';

@injectable()
export class MediaProviderRegistry implements IMediaProviderRegistry {
    private videoProviders: Map<string, IVideoProvider> = new Map();
    private videoProviderFactories: Map<string, () => IVideoProvider> = new Map();

    constructor() {
        this.registerProviderFactories();
    }

    getVideoProvider(providerName: string): IVideoProvider {
        let provider = this.videoProviders.get(providerName);
        
        if (!provider) {
            const factory = this.videoProviderFactories.get(providerName);
            if (!factory) {
                throw new Error(`Proveedor de video '${providerName}' no encontrado`);
            }
            
            try {
                provider = factory();
                this.videoProviders.set(providerName, provider);
            } catch (error) {
                throw new Error(`No se pudo inicializar el proveedor '${providerName}': ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
        
        return provider;
    }

    // Métodos para futuros proveedores de imagen y audio
    // getImageProvider(providerName: ProviderName): IImageProvider { ... }
    // getAudioProvider(providerName: ProviderName): IAudioProvider { ... }

    getSupportedVideoProviders(): string[] {
        return Array.from(this.videoProviderFactories.keys());
    }

    private registerProviderFactories(): void {
        this.videoProviderFactories.set('runway-ml', () => {
            try {
                return container.resolve(RunwayMLProvider);
            } catch (error) {
                throw new Error(`Error al crear RunwayMLProvider: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        });
    }
} 