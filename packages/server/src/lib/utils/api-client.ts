import { hc } from "hono/client";
import type { FileType } from "@/api/routes/file"

const baseUrl = process.env.BUN_PUBLIC_SERVER_URL || "http://localhost:3000/api/v1";

const api = {
    file: hc<FileType>(`${baseUrl}/file`),
};

export default api;