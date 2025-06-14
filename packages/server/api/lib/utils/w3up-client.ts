import { create } from "@web3-storage/w3up-client";
import type { Client } from "@web3-storage/w3up-client";
import type { Account } from "@web3-storage/w3up-client/account";

interface W3UpConfig {
    email?: `${string}@${string}`;
    spaceName?: string;
}

export default class W3UpClient {
    private client: Client | null = null;
    private account: Account | null = null;
    private ready = false;

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
            const space = await this.client.createSpace(spaceName, { account });
            console.log(`Created space: ${spaceName} with DID: ${space.did()}`);

            return space;
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