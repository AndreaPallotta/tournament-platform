export const arrayToPrismaFields = (fields: string[] | object = {}) => {
    if (
        typeof fields === 'object' &&
        !Array.isArray(fields) &&
        fields !== null
    ) {
        return fields;
    }

    return fields.reduce((acc, curr) => {
        return { ...acc, ...{ [curr]: true } };
    }, {});
};
