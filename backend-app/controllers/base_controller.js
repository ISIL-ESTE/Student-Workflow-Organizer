const AppError = require('../utils/app_error');
const APIFeatures = require('../utils/api_features');

/**
 * Delete a document by ID (soft delete)
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.deleteOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, {
            deleted: true,
            ...(req.user && { deletedBy: req.user._id }),
            deletedAt: Date.now(),
        });

        if (!doc) {
            return next(
                new AppError(404, 'fail', 'No document found with that id')
            );
        }

        res.status(204).json({
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a document by ID
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.updateOne = (Model) => async (req, res, next) => {
    try {
        // get the user who is updating the document
        const userid = req.user._id;
        req.body.updatedBy = userid;
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(
                new AppError(404, 'fail', 'No document found with that id')
            );
        }

        res.status(200).json({
            data: {
                doc,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new document
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.createOne = (Model) => async (req, res, next) => {
    try {
        // get the user who is creating the document
        const userid = req.user._id;
        req.body.createdBy = userid;
        const doc = await Model.create(req.body);

        res.status(201).json({
            data: {
                doc,
            },
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Get a document by ID
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.getOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findById(req.params.id);

        if (!doc) {
            return next(
                new AppError(404, 'fail', 'No document found with that id')
            );
        }

        res.status(200).json({
            data: {
                doc,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all documents
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.getAll = (Model) => async (req, res, next) => {
    try {
        const s = req.body.search;
        const features = new APIFeatures(Model.find(), req.query)
            .sort()
            .paginate();

        const doc = await features.query;

        res.status(200).json({
            results: doc.length,
            data: {
                data: doc,
            },
        });
    } catch (error) {
        next(error);
    }
};
