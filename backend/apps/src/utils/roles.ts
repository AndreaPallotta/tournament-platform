import { Role } from "@prisma/client";

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

export const compareRoleTo = (role: Role | undefined, comparedRole: Role): 0 | 1 | -1 => {
    if (!role) {
        return -1;
    }

    const roleIndex = Object.values(Role).indexOf(role);
    const minRoleIndex = Object.values(Role).indexOf(comparedRole);

    if (roleIndex > minRoleIndex) {
        return 1;
    } else if (roleIndex < minRoleIndex) {
        return -1;
    }

    return 0;
};