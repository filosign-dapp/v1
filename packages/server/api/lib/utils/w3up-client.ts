import { create } from "@web3-storage/w3up-client";
import type { Client } from "@web3-storage/w3up-client";
import type { Account } from "@web3-storage/w3up-client/account";
import { env } from "@/env";

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
    private constructor() {}

    // Static method to get or create the singleton instance
    public static async getInstance(): Promise<W3UpClient> {
        if (W3UpClient.initPromise) {
            return W3UpClient.initPromise;
        }

        if (W3UpClient.instance && W3UpClient.instance.ready) {
            return W3UpClient.instance;
        }

        W3UpClient.initPromise = (async () => {
            if (!W3UpClient.instance) {
                W3UpClient.instance = new W3UpClient();
            }

            await W3UpClient.instance.init({
                email: env.W3UP_EMAIL as `${string}@${string}`,
                spaceName: env.W3UP_SPACE_NAME,
            });

            console.log("W3UpClient singleton initialized successfully");
            return W3UpClient.instance;
        })();

        return W3UpClient.initPromise;
    }

    // Static method to get the already initialized instance (throws if not initialized)
    public static getInstanceSync(): W3UpClient {
        if (!W3UpClient.instance || !W3UpClient.instance.ready) {
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
            console.log("Attempting to authenticate with email:", email);
            const account = await this.client.login(email);

            await account.plan.wait();

            console.log("Successfully authenticated with email:", email);
            return account;
        } catch (error) {
            console.error("Failed to authenticate with email:", email, error);
            throw error;
        }
    }

    async createSpace(spaceName: string, account: Account) {
        if (!this.client) throw new Error('Client not initialized');

        try {
            // check if space already exists
            const spaces = this.client.spaces();
            const space = spaces.find((space) => space.name === spaceName);
            if (space) {
                console.log(`Space ${spaceName} already exists`, space.did());
                await this.client.setCurrentSpace(space.did());
                return space;
            }

            // create space
            const newSpace = await this.client.createSpace(spaceName, { account });
            await this.client.setCurrentSpace(newSpace.did());
            console.log(`Created space: ${spaceName} with DID: ${newSpace.did()}`);

            return newSpace;
        } catch (error) {
            console.error('Failed to create space:', error);
            throw error;
        }
    }

    async uploadFile(file: Blob | File): Promise<string> {
        if (!this.client) throw new Error('Client not initialized');

        try {
            const cid = await this.client.uploadFile(file);
            console.log(`File uploaded with CID: ${cid}`);
            return cid.toString();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    async uploadDirectory(files: File[]): Promise<string> {
        if (!this.client) throw new Error('Client not initialized');

        try {
            const cid = await this.client.uploadDirectory(files);
            console.log(`Directory uploaded with CID: ${cid}`);
            return cid.toString();
        } catch (error) {
            console.error('Directory upload failed:', error);
            throw error;
        }
    }

    getGatewayUrl(cid: string, gatewayHost = 'w3s.link'): string {
        return `https://${cid}.ipfs.${gatewayHost}`;
    }
}

// Export a convenience function for easier usage
export const getW3UpClient = () => W3UpClient.getInstanceSync();