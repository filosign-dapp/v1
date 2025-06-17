import { create } from "@web3-storage/w3up-client";
import type { Client } from "@web3-storage/w3up-client";
import type { Account } from "@web3-storage/w3up-client/account";
import { env } from "@/env";
import type { BlobLike, FileLike, UnknownLink, UploadDirectoryOptions } from "@web3-storage/w3up-client/types";
import { CID } from "multiformats/cid";
import { logger } from "@/src/lib/utils";

interface W3UpConfig {
    email?: `${string}@${string}`;
    spaceName?: string;
}

export default class W3UpClient {
    private static instance: W3UpClient | null = null;
    private static initPromise: Promise<W3UpClient> | null = null;

    private client: Client | null = null;
    private account: Account | null = null;
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
                email: env.W3UP_EMAIL as `${string}@${string}`,
                spaceName: env.W3UP_SPACE_NAME,
            });

            logger("W3UpClient singleton initialized successfully");
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
            this.client = await create();

            if (config.email) {
                this.account = await this.authenticateWithEmail(config.email);
            }

            if (config.spaceName && this.account) {
                await this.createSpace(config.spaceName, this.account);
            }

            this.ready = true;
            return this.client;
        } catch (error) {
            console.error("Failed to initialize w3up client:", error);
            throw error;
        }
    }

    private async authenticateWithEmail(email: `${string}@${string}`) {
        if (!this.client) {
            throw new Error("Client not initialized");
        }

        try {
            logger("Attempting to authenticate with email:", { email });
            logger("Please check your email and click the confirmation link...");

            // Login with email - this will send an email and wait for confirmation
            const account = await this.client.login(email);

            logger("Email confirmed successfully. Waiting for payment plan...");

            // Wait for payment plan with timeout (default is 15 minutes according to docs)
            await account.plan.wait();

            logger("Successfully authenticated with email:", { email });
            return account;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('timeout') || error.message.includes('expired')) {
                    console.error(`Authentication failed: Email confirmation timed out for ${email}. Please try again and confirm your email quickly.`);
                } else {
                    console.error(`Authentication failed for ${email}:`, error.message);
                }
            } else {
                console.error("Authentication failed with unknown error:", error);
            }
            throw error;
        }
    }

    async createSpace(spaceName: string, account: Account) {
        if (!this.client) throw new Error('Client not initialized');

        try {
            // Check if space already exists by name
            const spaces = this.client.spaces();
            let existingSpace = spaces.find((space) => space.name === spaceName);

            if (existingSpace) {
                logger(`Space "${spaceName}" already exists with DID: ${existingSpace.did()}`);
                await this.client.setCurrentSpace(existingSpace.did());
                return existingSpace;
            }

            // Create new space with account for recovery capability
            logger(`Creating new space: "${spaceName}"`);
            const newSpace = await this.client.createSpace(spaceName, { account });

            // Set as current space
            await this.client.setCurrentSpace(newSpace.did());
            logger(`Successfully created and set space "${spaceName}" with DID: ${newSpace.did()}`);

            return newSpace;
        } catch (error) {
            console.error(`Failed to create/access space "${spaceName}":`, error);
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

    getAccount() {
        return this.account;
    }

    isReady() {
        return this.ready && this.client !== null;
    }
}

// Export a convenience function for easier usage
export const getW3UpClient = () => W3UpClient.getInstanceSync();