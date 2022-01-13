const updates = ['email']
const allowedUpdates = ['name', 'email', 'age', 'password']
const isValidOperation = updates.every(update => allowedUpdates.includes(update))

console.log(isValidOperation)