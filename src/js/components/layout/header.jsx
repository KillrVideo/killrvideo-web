import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import { Navbar, NavBrand, CollapsibleNav, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import { toggleWhatIsThis } from 'actions';
import { getCurrentUser, logout } from 'actions/authentication';
import Image from 'components/shared/image';
import Icon from 'components/shared/icon';
import UserProfileImage from 'components/users/user-profile-image';
import WhatIsThis from 'components/layout/what-is-this';
import SearchBox from 'components/layout/search-box';

class Header extends Component {
  componentWillMount() {
    // Refresh current user information from server if necessary
    if (this.props.currentUser.isFromServer === false) {
      this.props.getCurrentUser(Header.queries.currentUser());
    }
  }
  
  componentWillReceiveProps(nextProps) {
    // Send user to the home page on logout
    if (this.props.currentUser.isLoggedIn === true && nextProps.currentUser.isLoggedIn === false) {
      this.props.pushState(null, '/');
    }
  }
  
  submitSearch(data) {
    this.props.pushState(null, '/search/results', { query: data.query });
  }
    
  render() {
    // Leave these undefined if we haven't gotten the current user information from the server yet
    let loggedInMenu, signIn, register;
    
    if (this.props.currentUser.isFromServer) {
      if (this.props.currentUser.isLoggedIn) {
        // Menu for logged in users
        const menuTitle = (
          <span>
            {this.props.currentUser.info.firstName + ' ' + this.props.currentUser.info.lastName + ' '}
            <UserProfileImage email={this.props.currentUser.info.email} className="img-circle" />
          </span>
        );
        
        loggedInMenu = (
          <NavDropdown eventKey={4} title={menuTitle} id="loggedin-user">
            <MenuItem eventKey="1" onSelect={e => this.props.pushState(null, '/account/info')}>
              <Icon name="cog" fixedWidth /> My Account
            </MenuItem>
            <MenuItem eventKey="2" onSelect={e => this.props.pushState(null, '/videos/add')}>
              <Icon name="video-camera" fixedWidth /> Add a Video
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="3" onSelect={e => this.props.logout()}>
              <Icon name="sign-out" fixedWidth /> Sign Out
            </MenuItem>
          </NavDropdown>
          
        );
      } else {
        // Buttons for logging in or registering the site
        signIn = (
          <NavItem eventKey={2} href="#" onSelect={e => this.props.pushState(null, '/account/signin')} className="text-uppercase">
            Sign in
          </NavItem>
        );
        register = (
          <NavItem eventKey={3} href="#" onSelect={e => this.props.pushState(null, '/account/register')} className="bg-success text-uppercase">
            Register
          </NavItem>
        );
      }
    }
  
    // TODO: Switch to react-bootstrap navbar once brand/header with collapse is implemented
    // (see https://github.com/react-bootstrap/react-bootstrap/pull/1184)
    return (
      <div id="header">
        <Navbar fixedTop toggleNavKey={0} id="navbar-main">
          <NavBrand>
            <Link to="/" id="logo">
              <Image src="killrvideo.png" alt="KillrVideo.com Logo" />
            </Link>
          </NavBrand>
          <CollapsibleNav eventKey={0}>
            <SearchBox suggestions={this.props.searchSuggestions} onSubmit={data => this.submitSearch(data)} />
            <Nav navbar right>
              <NavItem eventKey={1} href="#" onSelect={e => this.props.toggleWhatIsThis()} className={this.props.showWhatIsThis ? 'dropup' : ''}>
                What is this? <span className="caret"></span>
              </NavItem>
              {signIn}
              {register}
              {loggedInMenu}
            </Nav>
          </CollapsibleNav>
          
        </Navbar>
        
        <WhatIsThis showWhatIsThis={this.props.showWhatIsThis} toggleWhatIsThis={this.props.toggleWhatIsThis} />
      </div>
    );
  }
}

// Prop validation
Header.propTypes = {
  // Mapped from state
  currentUser: PropTypes.object.isRequired,
  showWhatIsThis: PropTypes.bool.isRequired,
  searchSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Actions
  toggleWhatIsThis: PropTypes.func.isRequired,
  getCurrentUser: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

// Falcor queries
Header.queries = {
  currentUser() {
    return [
      [ [ 'firstName', 'lastName', 'email' ] ]
    ];
  }
};

function mapStateToProps(state) {
  const { authentication: { currentUser }, whatIsThis, search } = state;
  return {
    currentUser: currentUser,
    showWhatIsThis: whatIsThis.visible,
    searchSuggestions: search.suggestions
  };
}

export default connect(mapStateToProps, { toggleWhatIsThis, getCurrentUser, logout, pushState })(Header);