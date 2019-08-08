import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import killrVideo from './reducers'
import Root from './components/Root'
import ReduxThunk from 'redux-thunk'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();


// Require basic CSS needed by the app
import 'bootswatch/cosmo/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'gemini-scrollbar/gemini-scrollbar.css';
import './css/app.css';
import 'react-joyride/lib/react-joyride-compiled.css';

var initialState = {
    NavReducer: {
        page: "Home",
    },
    ChatReducer: {

    },
    MiscReducer:{
        showWhatIsThis: false,
        showTour: false,
        searchSuggestions: null,
    },
    UserReducer: {
        currentUser: {
            isLoggedIn: false,
            firstname:null,
            lastname:null,
            email:null,
            password:null
        }
    },
    VideoReducer: {
        suggestions: "this is a test",
        recentVideos: null,
        recommendedVideos: null,
        myVideos: null
    }
}

let store = createStore(
    killrVideo,
    initialState,
    applyMiddleware(
        ReduxThunk,
    ))


render(
    <Provider store={store}>
            <Root/>
    </Provider>,
    document.getElementById('root')
)
