import moment from "moment";
import { Role } from "../types/enums";

type AbbreviationMap = {
    [key: string]: number;
}

const ABBREVIATIONS: AbbreviationMap = {
    B: 1000000000,
    M: 1000000,
    K: 1000,
}


export const doesRoleHavePermission = (
    role: Role | undefined,
    minRole: Role,
    exactRoleMatch: boolean
) => {
    if (!role) return false;

    const roleIndex = Object.values(Role).indexOf(role);
    const minRoleIndex = Object.values(Role).indexOf(minRole);

    if (exactRoleMatch) {
        return roleIndex === minRoleIndex;
    }

    return roleIndex >= 0 && roleIndex >= minRoleIndex;
};

export const doesRoleHaveExactPermission = (
    role: Role | undefined,
    allowedRoles: Role[]
) => {
    if (!role) return false;

    return allowedRoles.includes(role);
};

export const capitalizeFirst = (str: string | undefined, defValue = '') => {
    return (str && `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`) || defValue;
};

export const formatRoleKey = (role: string | Role) => {
    return role.split('_').reduce((acc: string[], word: string) => {
        acc = [...acc, capitalizeFirst(word)];
        return acc;
    }, []).join(' ');
};

export const getImageType = (dataUri: string): string | null => {
    const match = dataUri.match(/^data:image\/(\w+);base64/);
    if (match) {
        return match[1];
    }
    return null;
};

export const nullTruthyCheck = (data: unknown) => {
    if (data === null || data === undefined) {
        return true;
    }
    return false;
};

export const formatNumberLiteral = (value: string | number) => {
    const parsed = typeof value === 'number' ? value : parseFloat(value);
    const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

    for (const abbreviation in ABBREVIATIONS) {
        const divisor = ABBREVIATIONS[abbreviation];
        if (parsed >= divisor) {
            return `${formatter.format(parsed / divisor)}${abbreviation}`;
        }
    }

    return value;
};

// converts date strings fetched from the database to a format suitable for TextFields with the "type" attribute "datetime-local"
export const textFieldDateString = (dateFromDatabase: string) => {
    return moment(dateFromDatabase).format('YYYY-MM-DDTHH:mm');
}

// converts date strings fetched from the database to a format suitable for Calendar components
export const calendarDateString = (dateFromDatabase: string) => {
    return moment(dateFromDatabase).format('MMMM DD YYYY');
}

// get the hours and minutes from date strings that were fetched from the database
export const getDateTime = (dateFromDatabase: string) => {
    return moment(dateFromDatabase).format('HH:mm A');
};

// get the hours and minutes from date strings that were fetched from the database
export const humanReadableDate = (dateFromDatabase: string) => {
    return moment(dateFromDatabase).format('dddd, MMMM Do [at] h:mm A');
};
