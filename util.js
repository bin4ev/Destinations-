export function extendPartial(context) {
    let user = getUserData()
    context.isLoggedIn = Boolean(user)
    context.email=user? user.email:''
 
    return context.loadPartials({
        'header': '/templates/commons/header.hbs',
        'footer': '/templates/commons/footer.hbs'
    })

}


export function errorHandler(error) {
    console.log(error);
};

export function saveUserData(data) {
    let { user: { email, uid } } = data;
    localStorage.setItem('user', JSON.stringify({ email, uid }))
}

export function getUserData() {
    let user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null
}
export  function clearUserData(){
localStorage.removeItem('user')
}