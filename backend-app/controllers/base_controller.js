const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

/**
 * Delete a document by ID
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
exports.deleteOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError(404, "fail", "No document found with that id"), req, res, next);
        }

        res.status(204).json({
            status: "success",
            data: null
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
exports.updateOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError(404, "fail", "No document found with that id"), req, res, next);
        }

        res.status(200).json({
            status: "success",
            data: {
                doc
            }
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
exports.createOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                doc
            }
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
exports.getOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findById(req.params.id);

        if (!doc) {
            return next(new AppError(404, "fail", "No document found with that id"), req, res, next);
        }

        res.status(200).json({
            status: "success",
            data: {
                doc
            }
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
exports.getAll = Model => async (req, res, next) => {
    try {
        const features = new APIFeatures(Model.find(), req.query)
            .sort()
            .paginate();

        const doc = await features.query;

        res.status(200).json({
            status: "success",
            results: doc.length,
            data: {
                data: doc
            }
        });

    } catch (error) {
        next(error);
    }

};
