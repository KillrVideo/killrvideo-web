import { createAction } from 'redux-actions';

export const TOGGLE_WHAT_IS_THIS = 'TOGGLE_WHAT_IS_THIS';

export const toggleWhatIsThis = createAction(TOGGLE_WHAT_IS_THIS);

export const TOGGLE_TOUR = 'TOGGLE_TOUR';

export const toggleTour = createAction(TOGGLE_TOUR);