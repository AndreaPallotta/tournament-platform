/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';

export type YupSchema = yup.StringSchema<
    string | undefined,
    yup.AnyObject,
    undefined,
    ''
>;

export const isFormInvalid = <T extends Record<keyof T, any>>(
    values: T,
    errors: Record<keyof T, string>,
    touched: Record<keyof T, boolean>,
    notRequired?: Partial<Record<keyof T, boolean>>
) => {
    for (const field of Object.keys(values) as Array<keyof T>) {
        if ((touched[field] && errors[field]) || (!values[field] && !notRequired?.[field])) {
            return true;
        }
    }
    return false;
};

export const notEmpty = (field: string) => {
    return (isFieldTouched: any[], schema: YupSchema) =>
        isFieldTouched ? schema.required(`${field} is empty`) : schema;
};

// authentication validation
export const firstNameValidation = yup
    .string()
    .trim()
    .max(20, 'First name is too long')
    .when('$isFieldTouched', notEmpty('First name'));

export const lastNameValidation = yup
    .string()
    .trim()
    .max(20, 'Last name is too long')
    .when('$isFieldTouched', notEmpty('Last name'));

export const emailValidation = yup
    .string()
    .max(30, 'Email is too long')
    .trim()
    .email('Email is invalid')
    .when('$isFieldTouched', notEmpty('Email'));

export const passwordValidation = yup
    .string()
    .max(30, 'Password is too long')
    .trim()
    .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
        'Password is too weak'
    )
    .when('$isFieldTouched', notEmpty('Password'));

export const confirmPasswordValidation = yup
    .string()
    .trim()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .when('$isFieldTouched', notEmpty('Confirm password'));

// profile validation
export const displayNameValidation = yup
    .string()
    .trim()
    .max(16, 'Display name is too long')
    .when('$isFieldTouched', notEmpty('Display name'));

// general page validation
export const bioValidation = yup
    .string()
    .trim()
    .max(300, 'About section is too long')

export const pictureValidation = yup
    .string()
    .trim('Image is invalid')

// team validation
export const teamNameValidation = yup
    .string()
    .trim()
    .max(20, 'Team name is too long')
    .when('$isFieldTouched', notEmpty('Team name'));

export const playersRemovedValidation = yup
    .array()
    .max(4)
    .of(yup.string().trim().max(30));

export const newTeamMemberEmailValidation = yup
    .string()
    .max(30, 'Email is too long')
    .trim()
    .email('Email is invalid')

// university/college validation
export const collegeNameValidation = yup
    .string()
    .trim()
    .max(60, 'College name is too long')
    .when('$isFieldTouched', notEmpty('College name'));

// tournament validation

export const dateValidation = yup
    .date()
    .required('This date is required')
    .min(new Date(), 'This date must be in the future');

export const tournamentDeadlineValidation = dateValidation
    .test(
        'deadline-less-than-to-startdate',
        'The deadline must come before the start date and end date',
        function (deadline: Date) {
            const { startDate, endDate } = this.parent;

            if (deadline && startDate && endDate) {
                return (deadline < new Date(startDate)) && (deadline < new Date(endDate));
            }

            return true;
        }
    );

export const tournamentStartValidation = dateValidation
    .test(
        'startdate-less-than-enddate',
        'The start date must come before the end date and after the deadline',
        function (startDate: Date) {
            const { endDate, registerDeadline } = this.parent;

            if (startDate && endDate && registerDeadline) {
                return (startDate < new Date(endDate)) && (startDate > new Date(registerDeadline));
            }

            return true;
        }
    );

export const tournamentEndValidation = dateValidation
    .test(
        'enddate-greater-than-startdate',
        'The end date must come after the start date and deadline',
        function (endDate: Date) {
            const { startDate, registerDeadline } = this.parent;

            if (endDate && startDate && registerDeadline) {
                return (endDate > new Date(startDate)) && (endDate > new Date(registerDeadline));
            }

            return true;
        }
    );

export const tournamentNameValidation = yup
    .string()
    .trim()
    .max(30, 'Tournament name is too long')
    .when('$isFieldTouched', notEmpty('Tournament name'));

// bracket validation
export const gameScoreValidation = yup
    .number()
    .typeError('Score must be a number')
    .min(0, 'Score must be at least 0')
    .max(1000, 'Score must be at most 1000')

export const gameStateValidation = yup
    .string()
    .oneOf(['UNSTARTED', 'IN_PROGRESS', 'PLAYED'])
    .typeError('Game state is not valid')