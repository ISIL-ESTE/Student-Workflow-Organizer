import mongoose from 'mongoose';
import '@utils/register_paths';
import Role from '@models/user/role_model';
import User from '@models/user/user_model';
import logger from '@utils/logger';
import { DATABASE, ADMIN_EMAIL, ADMIN_PASSWORD } from '@config/app_config';
import Actions from '@constants/actions';

// Connect to MongoDB

async function seed() {
    await mongoose
        .connect(
            DATABASE as string,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions
        )
        .then(() => logger.info('MongoDB Connected'))
        .catch((err: any) => logger.error(err));

    interface Role {
        name: string;
        authorities: Array<string>;
        restrictions: Array<string>;
    }

    const Roles: { [key: string]: Role } = {
        SUPER_ADMIN: {
            name: 'SUPER_ADMIN',
            authorities: Object.values(Actions),
            restrictions: [],
        },
        ADMIN: {
            name: 'ADMIN',
            authorities: [
                Actions.DELETE_USER,
                Actions.UPDATE_USER,
                Actions.BAN_USER,
            ],
            restrictions: [],
        },
        USER: {
            name: 'USER',
            authorities: [Actions.UPDATE_CALANDER],
            restrictions: [],
        },
    };
    Object.freeze(Roles);

    // Seed default roles
    async function seedRoles() {
        const roles = await Role.find();
        if (roles.length === 0) {
            for (const role of Object.values(Roles)) {
                await Role.create(role);
            }
            logger.info('Roles seeded');
        } else {
            logger.info('Roles already seeded');
        }
    }

    // seed default users
    const createAdminUser = async () => {
        try {
            const user = await User.findOne({ email: ADMIN_EMAIL });
            if (!user) {
                // make sure super admin role is created if not created throw error
                const superAdminRole = await Role.findOne({
                    name: 'SUPER_ADMIN',
                });
                if (!superAdminRole) {
                    throw new Error('Super Admin role not found');
                }
                await User.create({
                    name: 'Supper Admin',
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    roles: [superAdminRole._id],
                    authorities: superAdminRole.authorities,
                    restrictions: superAdminRole.restrictions,
                    active: true,
                });
            } else {
                logger.info('default users already created');
            }
        } catch (err) {
            logger.error(err.stack);
        }
    };

    // create a default normal user

    await seedRoles();
    await createAdminUser();
}

seed()
    .then(() => {
        mongoose.disconnect();
        logger.info('Seeding completed successfully.');
    })
    .catch((err) => {
        logger.error('Error seeding the database:', err);
        mongoose.disconnect();
    });
