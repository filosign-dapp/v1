import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api-client";
import { handleError, logger } from "../utils";

export function useApi() {
    const queryClient = useQueryClient();

    return {
        uploadFile: useMutation({
            mutationKey: ['uploadFile'],
            mutationFn: async ({ encryptedBuffer, metadata }: { encryptedBuffer: ArrayBuffer, metadata: { name: string, type: string } }) => {
                const initTime = new Date().toISOString();
                const result = await api.file.index.$post({
                    form: {
                        file: new File([encryptedBuffer], `${metadata.name}.enc`, { type: metadata.type }),
                    }
                })
                const timeTaken = new Date().getTime() - new Date(initTime).getTime();
                logger('Upload API call finished...', { timeTaken: `${timeTaken}ms` });

                const parsed = await result.json();
                if (!parsed.success) throw new Error(parsed.error);
                return parsed.data;
            },
            onSuccess: () => {
                // queryClient.invalidateQueries({ queryKey: ['files'] });
            },
            onError: (error) => {
                console.error('Upload failed:', error);
                handleError(error);
            }
        }),

        uploadDirectory: useMutation({
            mutationKey: ['uploadDirectory'],
            mutationFn: async ({ encryptedFiles, directoryName }: { 
                encryptedFiles: { buffer: ArrayBuffer, name: string, type: string }[], 
                directoryName: string 
            }) => {
                const initTime = new Date().toISOString();
                
                const formData = new FormData();
                encryptedFiles.forEach(({ buffer, name, type }) => {
                    formData.append('files', new File([buffer], `${name}.enc`, { type }));
                });
                formData.append('directoryName', directoryName);

                const result = await fetch('/api/file/directory', {
                    method: 'POST',
                    body: formData
                });
                
                const timeTaken = new Date().getTime() - new Date(initTime).getTime();
                logger('Directory upload API call finished...', { timeTaken: `${timeTaken}ms` });

                const parsed = await result.json();
                if (!parsed.success) throw new Error(parsed.error);
                return parsed.data;
            },
            onSuccess: () => {
                // queryClient.invalidateQueries({ queryKey: ['directories'] });
            },
            onError: (error) => {
                console.error('Directory upload failed:', error);
                handleError(error);
            }
        }),

        downloadFile: (cid: string) => {
            return useQuery({
                queryKey: ['downloadFile', cid],
                queryFn: async () => {
                    const initTime = new Date().toISOString();
                    const result = await fetch(`https://${cid}.ipfs.w3s.link`)
                    const buffer = await result.arrayBuffer()
                    const timeTaken = new Date().getTime() - new Date(initTime).getTime();
                    logger('Download API call finished...', { timeTaken: `${timeTaken}ms` });
                    return buffer;
                },
                enabled: !!cid,
            })
        }
    }
}