import { IVideoProvider } from "./IVideoProvider";

export interface IMediaProviderRegistry {
    getVideoProvider(providerName: string): IVideoProvider;
    getSupportedVideoProviders(): string[];
}