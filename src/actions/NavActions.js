import {CHANGE_SCREEN} from "../consts"

export const changeScreen = (page) => {
    window.sessionStorage.setItem("page", page)
    return {
        type: CHANGE_SCREEN,
        page: page
    }
}

