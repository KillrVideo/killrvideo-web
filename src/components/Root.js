import React from 'react';
import Header from './layout/header';
import Footer from './layout/footer';
import { connect } from 'react-redux';
import Register from './account/register/index'
import SignIn from './account/sign-in/index'
import Home from './home'
import Tour from './shared/tour'

class RootContainer extends React.Component{
    render() {
        return (
            <div>
                <div>
                    <Header/>
                        {{
                            "Home": <Home/>,
                            "Register": <Register/>,
                            "Tour": <Tour/>,
                            "SignIn": <SignIn/>
                        }[this.props.page]}
                        <div id="push-footer" className="hidden-xs">
                        </div>
                    <Footer className="hidden-xs" />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    console.log(state)
    return {
        page: state.NavReducer.page,
        suggestions: state.VideoReducer.suggestions
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {

    }
}

const Root = connect(
    mapStateToProps,
    mapDispatchToProps
)(RootContainer);

export default Root