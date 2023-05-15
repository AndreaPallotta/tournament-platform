import React from 'react';

interface DynRoutesContextType {
    invalidRoutes: string[];
    setInvalidRoutes: React.Dispatch<React.SetStateAction<string[]>>;
}

interface IDynRoutesParams {
    children?: string | JSX.Element | JSX.Element[];
}

export const DynRoutesContext = React.createContext<DynRoutesContextType>({
    invalidRoutes: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setInvalidRoutes: () => {},
});

const useDynRoutes = () => {
    const context = React.useContext(DynRoutesContext);
    return context;
};

export const DynRoutesProvider = ({ children }: IDynRoutesParams) => {
    const [invalidRoutes, setInvalidRoutes] = React.useState<string[]>([]);

    return (
        <DynRoutesContext.Provider value={{ invalidRoutes, setInvalidRoutes }}>
            {children}
        </DynRoutesContext.Provider>
    );
};

export default useDynRoutes;
