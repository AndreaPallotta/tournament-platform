export const getFromStorage = <T>(key: string): T | undefined => {
    const value = localStorage.getItem(key);

    if (!value) return undefined;

    try {
        return JSON.parse(value) as T;
    } catch {
        return value as T;
    }
};

export const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        localStorage.setItem(key, `${value}`);
    }
};
