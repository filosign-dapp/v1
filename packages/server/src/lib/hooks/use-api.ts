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
            mutationFn: async ({ encryptedFiles }: {
                encryptedFiles: { buffer: ArrayBuffer, name: string, type: string }[],
            }) => {
                const initTime = new Date().toISOString();

                const files = encryptedFiles.map(({ buffer, name, type }) => new File([buffer], `${name}.enc`, { type }));

                const result = await api.file.directory.$post({
                    form: {
                        files,
                    }
                })

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

        downloadFiles: (cid: string) => {
            return useQuery({
                queryKey: ['downloadFile', cid],
                queryFn: async () => {
                    const serverResponse = await api.file.download[":cid"].$get({
                        param: { cid },
                    })
                    const serverResponseJson = await serverResponse.json();

                    if (!serverResponseJson.success) throw new Error(serverResponseJson.error);
                    const { fileNames } = serverResponseJson.data;
                    

                    if (fileNames.length === 1) {
                        console.log('downloading single file');
                        const url = `https://${cid}.ipfs.w3s.link`
                        const buffer = await fetch(url).then(res => res.arrayBuffer())
                        return [{
                            buffer,
                            name: fileNames[0].replace('.enc', ''),
                        }];
                    } else {
                        console.log('downloading multiple files');
                        const filePromises = fileNames.map(async (fileName: string) => {
                            const encodedFileName = encodeURIComponent(fileName);
                            const url = `https://${cid}.ipfs.w3s.link/${encodedFileName}`
                            const buffer = await fetch(url).then(res => res.arrayBuffer())
                            return {
                                buffer,
                                name: fileName.replace('.enc', ''),
                            };
                        })
                        return await Promise.all(filePromises);
                    }
                },
                enabled: !!cid,
            })
        }
    }
}