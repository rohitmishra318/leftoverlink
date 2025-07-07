const userModel = require('../models/user.model');

module.exports.createUser = async ({ fullname, email, password }) => {
    try {
        const user = new userModel({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email,
            password
        });
        await user.save();
        return user;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
};