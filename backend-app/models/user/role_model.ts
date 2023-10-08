import mongoose, { Schema } from 'mongoose';
import Actions from '@constants/actions';
import validator from 'validator';
import { IRole } from '@interfaces/models/i_role';

const roleSchema: Schema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true,
            validate: {
                validator: (value: string) => value.length > 0,
            },
        },
        authorities: {
            type: [String],
            required: true,
            default: [],
            validate: {
                validator: (value: string[]) =>
                    value.every((v) =>
                        validator.isIn(v, Object.values(Actions))
                    ),
            },
        },
        restrictions: {
            type: [String],
            required: true,
            default: [],
            validate: {
                validator: (value: string[]) =>
                    value.every((v) =>
                        validator.isIn(v, Object.values(Actions))
                    ),
            },
        },
    },
    {
        timestamps: true,
    }
);

const roleModel = mongoose.model<IRole>('Role', roleSchema);
export default roleModel;
