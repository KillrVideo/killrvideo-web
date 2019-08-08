import {TEST_REDUCE} from "../consts"

export const changeTestReduce = (booltest) => {
    return {
        type: TEST_REDUCE,
        test:booltest
    }
}

export function buttonClick(){
    return (dispatch, getState) => {
        dispatch(changeTestReduce(false))
    }
}
