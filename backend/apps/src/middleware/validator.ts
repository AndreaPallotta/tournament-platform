import { ValidationError, validationResult } from 'express-validator';

const validate = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        const errorParams = errors
            .array()
            .reduce((params: any, error: ValidationError) => {
                if (error.param && !params.includes(error.param)) {
                    if (error.param.includes('_')) {
                        const paramName = error.param.replace(/_/g, ' ');
                        params.push(
                            paramName.charAt(0).toUpperCase() +
                                paramName.slice(1)
                        );
                    } else {
                        params.push(error.param);
                    }
                }
                return params;
            }, []);

        return res.status(400).json({
            error: `${errorParams.join(', ')} ${
                errorParams.length > 1 ? 'are' : 'is'
            } invalid`,
        });
    };
};

export default validate;
