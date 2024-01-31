import { IUser } from '@root/interfaces/models/i_user';
import { Model } from 'mongoose';
import AppError from '@utils/app_error';
import APIFeatures from '@utils/api_features';

/**

/**
 * Delete a document by ID (soft delete)
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
export const deleteOne = async (
    Model: Model<any>,
    userId: string,
    id: string
): Promise<void> => {
    const doc = await Model.findByIdAndUpdate(
        id,
        {
            deleted: true,
            deletedBy: userId,
            deletedAt: Date.now(),
        },
        { new: true }
    );
    if (!doc) throw new AppError(404, 'No document found with that id');
};

/**
 * Update a document by ID
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
export const updateOne = async (
    Model: Model<any>,
    userId: string,
    id: string,
    body: any
): Promise<void> => {
    body.updatedBy = userId;
    const payload = new Model(body);
    const doc = await Model.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    if (!doc) throw new AppError(404, 'No document found with that id');
};

/**
 * Create a new document
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
export const createOne = async (
    Model: Model<any>,
    body: any,
    user: IUser
): Promise<any> => {
    // get the user who is creating the document
    if (user === undefined)
        throw new AppError(
            401,
            'You are not authorized to perform this action'
        );
    const userid = user._id;
    body.createdBy = userid;

    const doc = await Model.create(body);

    return doc;
};

/**
 * Get a document by ID
 * @param {Model} Model - The mongoose model
 * @returns {Function} - Express middleware function
 */
export const getOne = async (Model: Model<any>, id: string): Promise<any> => {
    const doc = await Model.findById(id);

    if (!doc) throw new AppError(404, 'No document found with that id');

    return doc;
};

/**
 * Get all documents
 * @param {Model} Model - The mongoose model
 * @param {Object} query - The query object
 * @returns {Function} - Express middleware function
 */
export const getAll = async (
    Model: Model<any>,
    query: Record<string, string>
): Promise<any> => {
    const features = new APIFeatures(Model.find(), query).sort().paginate();

    const doc = await features.query;

    return {
        results: doc.length,
        data: doc,
    };
};
