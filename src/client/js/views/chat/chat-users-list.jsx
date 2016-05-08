import React, { Component, PropTypes } from 'react';
import GeminiScrollbar from 'react-gemini-scrollbar';
import LoadingSpinner from 'components/shared/loading-spinner';

class ChatUsersList extends Component {
  render() {
    const { users } = this.props;

    return (
      <GeminiScrollbar>
        <ul id="chat-users-list" className="list-unstyled">
          <li className={users.isLoading ? undefined : 'hidden'} key="loading">
            <LoadingSpinner />
          </li>
          {users.data.map(user => <li key={user.userId}>{user.firstName} {user.lastName}</li>)}
        </ul>
      </GeminiScrollbar>
    );
  }
}
// Falcor queries
ChatUsersList.queries = {
  user() {
    return [
      [ [ 'userId', 'firstName', 'lastName' ] ]
    ];
  }
};

// Prop validation
ChatUsersList.propTypes = {
  users: PropTypes.object.isRequired
};

export default ChatUsersList;