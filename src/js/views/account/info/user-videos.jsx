import React, { Component, PropTypes } from 'react';
import { Row, Col, Table, Button } from 'react-bootstrap';
import moment from 'moment';
import { range } from 'lodash';

import LoadingSpinner from 'components/shared/loading-spinner';
import ViewVideoLink from 'components/videos/view-video-link';
import Icon from 'components/shared/icon';

class UserVideos extends Component {
  render() {
    const { isLoading, previews, morePreviewsAvailable, currentPageIndex } = this.props.videos;
    
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    const previousPageDisabled = isLoading || currentPageIndex === 0;
    const nextPageDisabled = isLoading || currentPageIndex + 10 > previews.length && morePreviewsAvailable === false;
    
    return (
      <div>
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Added Date</th>
            </tr>
          </thead>
          <tbody>
            {previews.map(p => {
              return (
                <tr key={p.videoId}>
                  <td><ViewVideoLink videoId={p.videoId}>{p.name}</ViewVideoLink></td>
                  <td>{moment(p.addedDate).format('LLL')}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        
        <Row>
          <Col xs={6} sm={4}>
            <Button bsStyle="default" block disabled={previousPageDisabled} onClick={() => this.props.previousPageClick()}>
              <Icon name="chevron-circle-left" /> Previous Page
            </Button>
          </Col>
          <Col xs={6} sm={4} smOffset={4}>
            <Button bsStyle="default" block disabled={nextPageDisabled} onClick={() => this.props.nextPageClick()}>
              <Icon name="chevron-circle-right" /> Next Page
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

UserVideos.propTypes = {
  videos: PropTypes.object.isRequired,
  nextPageClick: PropTypes.func.isRequired,
  previousPageClick: PropTypes.func.isRequired
};

UserVideos.queries = {
  videos() {
    return [
      [ [ 'videoId', 'name', 'addedDate' ] ]
    ];
  }
};

export default UserVideos;