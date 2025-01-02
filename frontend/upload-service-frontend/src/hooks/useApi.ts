import { useState } from 'react';

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
}

const BASE_URL = 'https://yanwittmann.de/projects/uploader-service';

export function useApi<T>() {
    const [state, setState] = useState<ApiResponse<T>>({
        data: null,
        error: null,
        isLoading: false,
    });

    const fetchData = async (
        method: string,
        params: Record<string, string> = {},
        body?: FormData | Record<string, unknown>
    ) => {
        setState({ ...state, isLoading: true });

        const url = new URL(BASE_URL + '/api/index.php');
        url.searchParams.append('method', method);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        if (!body) {
            body = {};
        }

        if (body) {
            const password = localStorage.getItem('adminPassword');
            if (password) {
                if (body instanceof FormData) {
                    body.append('password', password);
                } else {
                    (body as Record<string, unknown>).password = password;
                }
            }
        }

        try {
            const response = await fetch(url.toString(), {
                method: body ? 'POST' : 'GET',
                body: body instanceof FormData ? body : JSON.stringify(body),
                headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.error === 'Invalid password') {
                    localStorage.setItem('adminAuthenticated', 'false');
                    localStorage.removeItem('adminPassword');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setState({ data, error: null, isLoading: false });
            return data;
        } catch (error) {
            setState({ data: null, error: (error as Error).message, isLoading: false });
            throw error;
        }
    };

    return { ...state, fetchData };
}

export function generateDownloadUrl(projectId: number, userName: string, fileName: string) {
    return `${BASE_URL}/uploads/${projectId}/${userName}/${fileName}`;
}

export function createShareUrl(project: number) {
    return `${BASE_URL}?p=${project}`;
}