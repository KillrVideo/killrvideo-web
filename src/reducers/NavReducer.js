import {CHANGE_SCREEN} from "../consts"

const NavReducer = (state = '', action) => {
    switch (action.type) {
        case CHANGE_SCREEN:
            return {
                ...state,
                page: action.page
            }
        default:
            return state
    }
}

export default NavReducer








