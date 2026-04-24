export function userResponse(user){
    const {id, name, email, isAdmin, createdAt, updatedAt} = user.get({plain:true});

    return {
        id, name, email, isAdmin: isAdmin === true, createdAt, updatedAt
    }
}
