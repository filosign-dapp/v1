import { create } from "@web3-storage/w3up-client";
import type { Client } from "@web3-storage/w3up-client";
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Proof from '@web3-storage/w3up-client/proof'
import { Signer } from '@web3-storage/w3up-client/principal/ed25519'
import { env } from "@/env";
import type { BlobLike, FileLike, UnknownLink, UploadDirectoryOptions } from "@web3-storage/w3up-client/types";
import { CID } from "multiformats/cid";
import { logger } from "@/src/lib/utils";

interface W3UpConfig {
    spaceName?: string;
}

const PROOF = `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NvWBVklFPrShRc7Wa9tvwOE5CXTfv5vWcY2Nhbmt1Y2FuL2F0dGVzdGR3aXRoeBtkaWQ6d2ViOnVwLnN0b3JhY2hhLm5ldHdvcmtjYXVkWCLtASIoDFehN7wOxzBZbQZPuwwRR7bffa+eXf2/Gc4tCiOiY2V4cPZjZmN0gaJuYWNjZXNzL2NvbmZpcm3YKlglAAFxEiBcgUOplfPq3z5u0xJjttxDLhn2ODpd8KKes7iloYZztm5hY2Nlc3MvcmVxdWVzdNgqWCUAAXESIGraVsq83M0WZFa4X5tf0HrtDGVuVyZUr1WJcjJDJrXaY2lzc1gZnRp3ZWI6dXAuc3RvcmFjaGEubmV0d29ya2NwcmaAqAcBcRIgijbYFfigYG3BAQirMDTajn7XlLCWu4xdegQd0Kn43cqoYXNYRO2hA0BdiyIHzDaHxlJuCfZO1GVAfaUN9TdOZ9u/JQO9bf0NvAOBVC2oBhgaAC0vw9Lpt70IGBUNZ/RvQi4maGzVReELYXZlMC45LjFjYXR0iKJjY2FuZ3NwYWNlLypkd2l0aHg4ZGlkOmtleTp6Nk1rdkdRcW90YWdIRlpZOHZFbTFUcEJSWGhtVzFkVnhOQVYyOXZCSnY5dGpRMVqiY2NhbmZibG9iLypkd2l0aHg4ZGlkOmtleTp6Nk1rdkdRcW90YWdIRlpZOHZFbTFUcEJSWGhtVzFkVnhOQVYyOXZCSnY5dGpRMVqiY2NhbmdpbmRleC8qZHdpdGh4OGRpZDprZXk6ejZNa3ZHUXFvdGFnSEZaWTh2RW0xVHBCUlhobVcxZFZ4TkFWMjl2Qkp2OXRqUTFaomNjYW5nc3RvcmUvKmR3aXRoeDhkaWQ6a2V5Ono2TWt2R1Fxb3RhZ0hGWlk4dkVtMVRwQlJYaG1XMWRWeE5BVjI5dkJKdjl0alExWqJjY2FuaHVwbG9hZC8qZHdpdGh4OGRpZDprZXk6ejZNa3ZHUXFvdGFnSEZaWTh2RW0xVHBCUlhobVcxZFZ4TkFWMjl2Qkp2OXRqUTFaomNjYW5oYWNjZXNzLypkd2l0aHg4ZGlkOmtleTp6Nk1rdkdRcW90YWdIRlpZOHZFbTFUcEJSWGhtVzFkVnhOQVYyOXZCSnY5dGpRMVqiY2NhbmpmaWxlY29pbi8qZHdpdGh4OGRpZDprZXk6ejZNa3ZHUXFvdGFnSEZaWTh2RW0xVHBCUlhobVcxZFZ4TkFWMjl2Qkp2OXRqUTFaomNjYW5ndXNhZ2UvKmR3aXRoeDhkaWQ6a2V5Ono2TWt2R1Fxb3RhZ0hGWlk4dkVtMVRwQlJYaG1XMWRWeE5BVjI5dkJKdjl0alExWmNhdWRYIu0BAeGas/1XuVTPDN/FoGeEbUh0gQ84OHNpy0nEG/nRNOFjZXhw9mNmY3SBoWVzcGFjZaFkbmFtZWtwb3J0YWwtcHJvZGNpc3NYIu0BIigMV6E3vA7HMFltBk+7DBFHtt99r55d/b8Zzi0KI6JjcHJmgtgqWCUAAXESIJCx1t8tk+kNvWBVklFPrShRc7Wa9tvwOE5CXTfv5vWc2CpYJQABcRIgReadBuR9339bOldxz29S3M9yB5l2NF1xvv9WHi93/mY`

export default class W3UpClient {
    private static instance: W3UpClient | null = null;
    private static initPromise: Promise<W3UpClient> | null = null;

    private client: Client | null = null;
    private currentSpace: any = null;
    private ready = false;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Static method to get or create the singleton instance
    public static async getInstance(): Promise<W3UpClient> {
        // If we already have an initialized instance, return it
        if (W3UpClient.instance?.ready) {
            return W3UpClient.instance;
        }

        // If initialization is in progress, wait for it
        if (W3UpClient.initPromise) {
            return W3UpClient.initPromise;
        }

        // Start initialization
        W3UpClient.initPromise = W3UpClient.initialize();

        try {
            const instance = await W3UpClient.initPromise;
            return instance;
        } finally {
            // Clear the promise after completion (success or failure)
            W3UpClient.initPromise = null;
        }
    }

    private static async initialize(): Promise<W3UpClient> {
        if (!W3UpClient.instance) {
            W3UpClient.instance = new W3UpClient();
        }

        try {
            await W3UpClient.instance.init({
                spaceName: env.W3UP_SPACE_NAME,
            });

            return W3UpClient.instance;
        } catch (error) {
            // Reset instance on failure to allow retry
            W3UpClient.instance = null;
            throw error;
        }
    }

    // Static method to get the already initialized instance (throws if not initialized)
    public static getInstanceSync(): W3UpClient {
        if (!W3UpClient.instance?.ready) {
            throw new Error("W3UpClient not initialized. Call getInstance() first.");
        }
        return W3UpClient.instance;
    }

    async init(config: W3UpConfig = {}) {
        if (this.ready && this.client) {
            return this.client;
        }

        try {
            // Load client with specific private key
            const principal = Signer.parse(env.STORACHA_PRIVATE_KEY);
            const store = new StoreMemory();
            this.client = await create({ principal, store });

            // Add proof that this agent has been delegated capabilities on the space
            const proof = await Proof.parse(PROOF);
            this.currentSpace = await this.client.addSpace(proof);
            await this.client.setCurrentSpace(this.currentSpace.did());

            logger("W3Up client ready to go!", this.currentSpace.did());

            this.ready = true;
            return this.client;
        } catch (error) {
            console.error("Failed to initialize w3up client:", error);
            throw error;
        }
    }

    async uploadFile(file: BlobLike) {
        if (!this.client) throw new Error('Client not initialized');

        try {
            const cid = await this.client.uploadFile(file);
            logger(`File uploaded with CID: ${cid}`);
            return cid.toString();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    async uploadDirectory(files: FileLike[], options?: UploadDirectoryOptions) {
        if (!this.client) throw new Error('Client not initialized');

        try {
            const cid = await this.client.uploadDirectory(files, options);
            logger(`Directory uploaded with CID: ${cid}`);
            return cid.toString();
        } catch (error) {
            console.error('Directory upload failed:', error);
            throw error;
        }
    }

    async removeFile(cid: string) {
        if (!this.client) throw new Error('Client not initialized');

        try {
            // Convert string CID to CID object
            const cidObject = CID.parse(cid);
            await this.client.remove(cidObject, {
                shards: true,
            });
            logger(`File removed with CID: ${cid}`);
        } catch (error) {
            console.error('File removal failed:', error);
            throw error;
        }
    }

    getGatewayUrl(cid: string, gatewayHost = 'w3s.link'): string {
        return `https://${cid}.ipfs.${gatewayHost}`;
    }

    // Additional utility methods for space management
    getCurrentSpace() {
        if (!this.client) throw new Error('Client not initialized');
        return this.client.currentSpace();
    }

    getAllSpaces() {
        if (!this.client) throw new Error('Client not initialized');
        return this.client.spaces();
    }

    async setCurrentSpace(spaceDid: `did:${string}:${string}`) {
        if (!this.client) throw new Error('Client not initialized');
        await this.client.setCurrentSpace(spaceDid);
        logger(`Current space set to: ${spaceDid}`);
    }

    getSpace() {
        return this.currentSpace;
    }

    isReady() {
        return this.ready && this.client !== null;
    }
}

// Export a convenience function for easier usage
export const getW3UpClient = () => W3UpClient.getInstanceSync();