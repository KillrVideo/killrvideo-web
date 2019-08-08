import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import Icon from '../shared/icon';
import UserProfileImage from '../users/user-profile-image';
import WhatIsThis from './what-is-this';
import SearchBox from './search-box';
import Tour from '../shared/tour';
import {toggleWhatIsThis, toggleTour,testButton, testButton2} from '../../actions/MiscActions'
import {changeScreen} from '../../actions/NavActions'

class HeaderContainer extends React.Component {
  componentDidMount() {
      this.props.getCurrentUser();
  }

  render() {
    // // Leave these undefined if we haven't gotten the current user information from the server yet
    let loggedInMenu, signIn, register;

    // If the user is logged in then show them account and full menu options
    if (this.props.currentUser.isLoggedIn === true) {
      // Menu for logged in users
      let { firstName, lastName, email } = this.props.currentUser.info;
      let menuTitle = 'My Account';
      if (!!firstName && !!lastName && !!email) {
        menuTitle = (
          <span>
            {firstName + ' ' + lastName + ' '}
            <UserProfileImage email={email} className="small img-circle" />
          </span>
        );
      }

      loggedInMenu = (
        <NavDropdown eventKey={4} title={menuTitle} id="loggedin-user">
          <MenuItem eventKey={4.1} onSelect={e => this.props.changeScreen('AccountInfo')}>
            <Icon name="cog" fixedWidth /> My Account
          </MenuItem>
          <MenuItem eventKey={4.2} onSelect={e => this.props.changeScreen('AddVideo')}>
            <Icon name="video-camera" fixedWidth /> Add a Video
          </MenuItem>
          <MenuItem divider />
            <MenuItem eventKey={4.3} onSelect={e => this.props.changeScreen('SignOut')}>
                <Icon name="sign-out" fixedWidth /> Sign Out
            </MenuItem>
        </NavDropdown>

      );
    }

    // if the user is not loged in show them sign in and Register buttons
    if (this.props.currentUser.isLoggedIn === false) {
      // Buttons for logging in or registering the site
      signIn = (
        <NavItem id="sign-in" eventKey={2} href="#" onSelect={e => this.props.changeScreen('SignIn')} className="text-uppercase">
          Sign in
        </NavItem>
      );
      register = (
        <NavItem id="register" eventKey={3} href="#" onSelect={e => this.props.changeScreen('Register')} className="bg-success text-uppercase">
          Register
        </NavItem>
      );
    }
      
    return (
      <div id="header">
        <Navbar fixedTop id="navbar-main">
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/" id="logo">
                <img src='../../images/killrvideo.png' alt="KillrVideo.com Logo" />
              </a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
              <SearchBox onSubmit={vals => this.props.submitSearch(vals.query)} getSuggestions={this.props.getSuggestions} />
            <Nav navbar pullRight>
              <NavItem id="show-tour" eventKey={1} href="#" onSelect={e => this.startTour(this.props.currentUser.isLoggedIn)} >
                <Icon name="map-signs" fixedWidth /> Tour: <span>{this.props.showTour ? 'On' : 'Off'}</span>
              </NavItem>
              <NavItem eventKey={1} href="#" onSelect={e => this.props.toggleWhatIsThis()} className={this.props.showWhatIsThis ? 'dropup' : ''}>
                What is this? <span className="caret"></span>
              </NavItem>
                <NavItem eventKey={1} href="#" onSelect={e => this.props.testButton()}>
                    test
                </NavItem>
                <NavItem eventKey={1} href="#" onSelect={e => this.props.testButton2()}>
                    test2
                </NavItem>
              {signIn}
              {register}
              {loggedInMenu}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <WhatIsThis showWhatIsThis={this.props.showWhatIsThis} toggleWhatIsThis={() => {this.props.toggleWhatIsThis(this.props.showWhatIsThis)}} />
        <Tour showTour={this.props.showTour} toggleTour={this.props.toggleTour} />
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
        currentUser: state.UserReducer.currentUser,
        showWhatIsThis: state.MiscReducer.showWhatIsThis,
        showTour: state.MiscReducer.showTour,
        searchSuggestions: state.MiscReducer.searchSuggestions
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        toggleWhatIsThis: (current) => {
            dispatch(toggleWhatIsThis(current))
        },
        toggleTour: () => {
            dispatch(toggleTour())
        },
        getCurrentUser: () => {
            // dispatch(getCurrentUser())
        },
        getSuggestions: () => {
            // dispatch(getSuggestions())
        },
        submitSearch: (query) => {
            // this.props.push({
            //   pathname: '/search/results',
            //   query: { q }
            // });
        },
        startTour: () => {

            // If current user is signed in, sign them out so tour steps work correctly ("Register" button needs to be available)
            //   if (logout) this.props.push('/account/signout');
            //
            //   this.props.toggleTour();
        },
        changeScreen: (page) => {
            dispatch(changeScreen(page))
        },
        testButton:()=>{
            dispatch(testButton())
        },
        testButton2:()=>{
            dispatch(testButton2())
        }
    }
}

const Header = connect(
    mapStateToProps,
    mapDispatchToProps
)(HeaderContainer)

export default Header



