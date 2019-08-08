import {GET_USER,RESET_USER,LOGIN,LOGOUT,GET_CURRENT_USER,REGISTER} from "../consts"

const UserReducer = (state = '', action) => {
    switch (action.type) {
        case GET_USER:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case RESET_USER:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case LOGIN:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case LOGOUT:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case GET_CURRENT_USER:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case REGISTER:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        default:
            return state
    }
}

export default UserReducer








