const enableMetaData = (model) => {
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

exports.enableMetaData = enableMetaData;
