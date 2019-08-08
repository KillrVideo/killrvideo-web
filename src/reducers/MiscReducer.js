import {SET_CONFIG,TOGGLE_WHAT_IS_THIS,SHOW_TOUR} from "../consts"

const MiscReducer = (state = '', action) => {
    switch (action.type) {
        case SET_CONFIG:
            return {
                ...state,
                test: {
                    test: true
                }
            }
        case TOGGLE_WHAT_IS_THIS:
            return {
                ...state,
                showWhatIsThis:!state.showWhatIsThis
            }
        case SHOW_TOUR:
            return {
                ...state,
                showTour: action.tourActive,
            }
        default:
            return state
    }
}

export default MiscReducer








