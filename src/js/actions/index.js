import createAction from 'redux-actions/lib/createAction';

export const TOGGLE_WHAT_IS_THIS = 'TOGGLE_WHAT_IS_THIS';

export const toggleWhatIsThis = createAction(TOGGLE_WHAT_IS_THIS);

export const SEARCH_BOX_SUBMIT = 'SEARCH_BOX_SUBMIT';
export const SEARCH_BOX_CHANGE = 'SEARCH_BOX_CHANGE';

export const searchBoxSubmit = createAction(SEARCH_BOX_SUBMIT, data => data);
export const searchBoxChange = createAction(SEARCH_BOX_CHANGE, query => query);

