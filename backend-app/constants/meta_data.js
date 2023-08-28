/**
 * @param {import('mongoose').Schema} model
 * @returns {void}
 * @description Add common fields to a model
 *
 **/
exports.apply = (model) => {
    model.add({
        deleted: {
            type: Boolean,
            default: false,
        },
        UpdatedBy: {
            type: String,
        },
        createdBy: {
            type: String,
            default: 'System',
        },
        deletedBy: {
            type: String,
        },
        deletedAt: {
            type: Date,
        },
    });
};
