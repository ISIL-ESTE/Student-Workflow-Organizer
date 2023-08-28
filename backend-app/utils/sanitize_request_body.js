/**
 * sanitize request body
 * @param {Model} Model - The mongoose model
 * @param {Object} body - The request body
 * @returns {Object} - The sanitized request body
 * @description - This function sanitizes the request body by removing any field that is not in the schema
 * @example
 * const sanitizedBody = sanitizeRequestBody(User, req.body);
 */
const sanitizeRequestBody = (schema, body) => {
    const sanitizedData = {};

    for (const key in body) {
        if (schema.path(key)) {
            sanitizedData[key] = schema.path(key).applySetters(body[key]);
        }
    }

    return sanitizedData;
};

module.exports = sanitizeRequestBody;
