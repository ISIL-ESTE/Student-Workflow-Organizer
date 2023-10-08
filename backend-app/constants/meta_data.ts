/**
 * @param {Schema<Document>} model
 * @returns {void}
 * @description Add common fields to a model
 *
 **/
const apply = (model: any): void => {
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

export default {
    apply,
};
