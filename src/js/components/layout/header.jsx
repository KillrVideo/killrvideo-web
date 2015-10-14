import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import { toggleWhatIsThis } from 'actions';
import Image from 'components/shared/image';
import WhatIsThis from 'components/layout/what-is-this';
import SearchBox from 'components/layout/search-box';

class Header extends Component {
  logoutUser() {
    // TODO: Logout user
  }
  
  submitSearch(data) {
    pushState(null, '/search/results', { query: data.query });
  }
    
  render() {
    let loggedInMenu, signIn, register;
    if (this.props.loggedInUser) {
      // Menu for logged in users
      loggedInMenu = (
        <li className="dropdown">
          <a id="loggedin-user" href="#" className="dropdown-toggle" data-toggle="dropdown">
            {this.props.loggedInUser.firstName + ' ' + this.props.loggedInUser.lastName}
            <img src={this.props.loggedInUser.profileImageUrl} alt="Profile image" className="img-circle user-gravatar"/>
            <span className="caret"></span>
          </a>
          <ul className="dropdown-menu" role="menu">
            <li><a id="my-account" href="/account/info"><i className="fa fa-cog fa-fw"></i> My Account</a></li>
            <li><a id="add-video-link" href="/videos/add"><i className="fa fa-video-camera fa-fw"></i> Add a Video</a></li>
            <li className="divider"></li>
            <li><a href="#" onClick={e => this.logoutUser()}><i className="fa fa-sign-out fa-fw"></i> Sign Out</a></li>
          </ul>
        </li>
      );
    } else {
      // Buttons for logging in or registering the site
      signIn = (
        <li>
          <Link id="sign-in" to="/account/signin" className="text-uppercase">Sign in</Link>
        </li>
      );
      register = (
        <li>
          <Link id="register" to="/account/register" className="bg-success text-uppercase">Register</Link>
        </li>
      );
    }
  
    // TODO: Switch to react-bootstrap navbar once brand/header with collapse is implemented
    // (see https://github.com/react-bootstrap/react-bootstrap/pull/1184)
    return (
      <div id="header">
        <nav className="navbar navbar-default navbar-fixed-top" role="navigation" id="navbar-main">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <Link to="/" className="navbar-brand" id="logo">
                <Image src="killrvideo.png" alt="KillrVideo.com Logo" />
              </Link>
            </div>
            <div className="navbar-collapse collapse">
              <SearchBox suggestions={this.props.searchSuggestions} onSubmit={data => this.submitSearch(data)} />

              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a href="#" onClick={e => this.props.toggleWhatIsThis()} className={this.props.showWhatIsThis ? 'dropup' : ''}>
                    What is this? <span className="caret"></span>
                  </a>
                </li>
                {signIn}
                {register}
                {loggedInMenu}
              </ul>
            </div>
          </div>
        </nav>
        <WhatIsThis showWhatIsThis={this.props.showWhatIsThis} toggleWhatIsThis={this.props.toggleWhatIsThis} />
      </div>
    );
  }
}

Header.propTypes = {
  // Mapped from state
  loggedInUser: PropTypes.object,
  showWhatIsThis: PropTypes.bool.isRequired,
  searchSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Actions
  toggleWhatIsThis: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { loginState, whatIsThis, search } = state;
  return {
    loggedInUser: loginState.loggedInUser,
    showWhatIsThis: whatIsThis.visible,
    searchSuggestions: search.suggestions
  };
}

export default connect(mapStateToProps, { toggleWhatIsThis })(Header);