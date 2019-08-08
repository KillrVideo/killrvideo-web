import {JOIN_ROOM,LEAVE_ROOM,GET_MESSAGES,SEND_MESSAGE,USER_JOINED,USER_LEFT,NEW_MESSAGE} from "../consts"

const ChatReducer = (state = '', action) => {
    switch (action.type) {
        case JOIN_ROOM:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case LEAVE_ROOM:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case GET_MESSAGES:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case SEND_MESSAGE:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case USER_JOINED:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case USER_LEFT:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case NEW_MESSAGE:
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

export default ChatReducer








