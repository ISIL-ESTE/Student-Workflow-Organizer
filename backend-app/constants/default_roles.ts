import Actions from './actions';

interface Role {
    type: string;
    authorities: Array<string>;
    restrictions: Array<string>;
}

const Roles: { [key: string]: Role } = {
    SUPER_ADMIN: {
        type: 'SUPER_ADMIN',
        authorities: Object.values(Actions),
        restrictions: [],
    },
    ADMIN: {
        type: 'ADMIN',
        authorities: [
            Actions.DELETE_USER,
            Actions.UPDATE_USER,
            Actions.BAN_USER,
        ],
        restrictions: [],
    },
    USER: {
        type: 'USER',
        authorities: [Actions.UPDATE_CALANDER],
        restrictions: [],
    },
};
Object.freeze(Roles);

export default Roles;
