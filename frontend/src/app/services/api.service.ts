/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { AxiosReturn } from '../types/api.types';
import { getFromStorage } from './localStorage.service';

const { VITE_API_HOST, PROD } = import.meta.env;

const prefix = PROD ? 'https' : 'http';

export const client: AxiosInstance = axios.create({
    baseURL: `${prefix}://${VITE_API_HOST}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config: AxiosRequestConfig) => {
    const authToken = getFromStorage<string>('authToken');
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
}, (err: any) => Promise.reject(err));

client.interceptors.response.use((res: any) => res, async (err: any) => {
    if (err.response.status === 401 || err.response.status === 403) {
        clearSession();
        window.location.href = '/login';
    }
    return Promise.reject(err);
});

export const post = async (
    endpoint = '',
    body: object = {}
): Promise<AxiosReturn> => {
    try {
        const { status, data } = await client.post(endpoint, body);
        return { status, res: data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const { data, status } = error.response ?? {};
            if (data.error) {
                return { err: data.error, status };
            }
            return { err: 'Network error. Contact the system administrator' };
        }
        return { err: 'Unknown error. Try again.' };
    }
};

export const get = async (
    endpoint = '',
    params: object = {}
): Promise<AxiosReturn> => {
    try {
        const { status, data } = await client.get(endpoint, { params });
        return { status, res: data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const { data, status } = error.response ?? {};
            if (data.error) {
                return { err: data.error, status };
            }
            return { err: 'Network error. Contact the system administrator' };
        }
        return { err: 'Unknown error. Try again.' };
    }
};

export const clearSession = () => {
    localStorage.clear();
    Cookies.remove('refresh_token', {
        path: '/',
        domain: import.meta.env.PROD
            ? 'aardvarktournament.com'
            : 'localhost',
    });
};
