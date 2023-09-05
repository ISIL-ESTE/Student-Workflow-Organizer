import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import AppError from '@utils/app_error';
import APIFeatures from '@utils/api_features';

interface RequestWithUser extends Request {
    user?: {
        _id: string;
    };
}

/**
 * Delete a document by ID (soft delete)
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
export const deleteOne =
    (Model: Model<any>) =>
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const doc = await Model.findByIdAndUpdate(
                req.params.id,
                {
                    deleted: true,
                    ...(req.user && { deletedBy: req.user._id }),
                    deletedAt: Date.now(),
                },
                { new: true }
            );

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
export const updateOne =
    (Model: Model<any>): Function =>
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
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
                doc,
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
export const createOne =
    (Model: Model<any>) =>
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            // get the user who is creating the document
            const userid = req.user._id;
            req.body.createdBy = userid;

            const doc = await Model.create(req.body);

            res.status(201).json({
                doc,
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
export const getOne =
    (Model: Model<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doc = await Model.findById(req.params.id);

            if (!doc) {
                return next(
                    new AppError(404, 'fail', 'No document found with that id')
                );
            }

            res.status(200).json({
                doc,
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
export const getAll =
    (Model: Model<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const s = req.body.search;
            const features = new APIFeatures(Model.find(), req.query)
                .sort()
                .paginate();

            const doc = await features.query;

            res.status(200).json({
                results: doc.length,
                data: doc,
            });
        } catch (error) {
            next(error);
        }
    };
