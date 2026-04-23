export function userResponse(user){
    const {id, name, email, createdAt, updatedAt} = user.get({plain:true});

    return {
        id, name, email, createdAt, updatedAt
    }
}