const { createUser, getUser, updateUser, deleteUser } = require('./functions')

const test = async () => {
    await createUser("554195849459@c.us", "Mazora", "12/01", 15, '10/11');
}

test()