import axios, { AxiosInstance } from 'axios';

export const createHttpClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    withCredentials: true,
  });
};

export const post = async <T>(
    client: AxiosInstance,
    endpoint: string,
    data: any,
    cookies?: string,
    headers: Record<string, string> = {}
): Promise<T> => {
    try {
        // Merge dynamic headers with optional cookies
        const requestHeaders = {
            'Content-Type': 'application/json', // POST requests typically require this
            ...headers,
            ...(cookies ? { Cookie: cookies } : {}), // Attach cookies if provided
        };

        const response = await client.post<T>(endpoint, data, {
            headers: requestHeaders,
        });

        return response.data;
    } catch (error: any) {
        console.error('[POST Request Error]', error.message);
        if (error.response) {
            console.error('[Response Error Data]', error.response.data);
        }
        throw new Error(error.response?.data || 'HTTP POST request failed');
    }
};