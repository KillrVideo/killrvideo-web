
import React from 'react';
import { connect } from 'react-redux';
import { range } from 'lodash';
import { routeActions } from 'react-router-redux';

import { Alert, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';

import { searchFor, nextPageClick, previousPageClick, unload } from 'actions/search';
import Icon from 'components/shared/icon';
import VideoPreview from 'components/videos/video-preview';

// Styles needed by the view
require('search-results.css');

class SearchResults extends React.Component {
  componentDidMount() {
    this.props.searchFor(this.props.searchTerm, SearchResults.queries.preview());
  }
  
  componentDidUpdate(prevProps) {
    // If the search term changes, do a new search
    if (this.props.searchTerm !== prevProps.searchTerm) {
      this.props.searchFor(this.props.searchTerm, SearchResults.queries.preview());
    }
  }
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  gotoVideo(videoId) {
    this.props.push(`/view/${videoId}`);
  }
  
  nextPage() {
    this.props.nextPageClick(SearchResults.queries.preview());
  }
  
  previousPage() {
    this.props.previousPageClick();
  }
  
  render() {
    const { searchTerm, isLoading, data, moreDataOnServer, currentPageIndex, pagingConfig, nextPageDisabled, previousPageDisabled } = this.props;
        
    return (
      <div id="search-result-page" className="body-content container">
        <h3 className="section-divider">
          <span><em>{searchTerm}</em> Videos</span>
        </h3>
        
        <div id="search-results">
          <h4 className={isLoading && data.length === 0 ? undefined : 'hidden'}>
            <Icon name="spinner" animate="spin" /> Searching...
          </h4>
          
          <Alert bsStyle="info" className={moreDataOnServer === false && data.length === 0 ? undefined : 'hidden'}>
            There are currently no videos for <strong>{searchTerm}</strong>. Why don't you <Link to="/videos/add" className="alert-link">add one</Link>?
          </Alert>
          
          <Row>
            {range(0, 8).map(idx => {
              // Get the index in the preview collection adjusting for the current page start index
              const previewIdx = currentPageIndex + idx;
              if (previewIdx >= data.length) return;
              
              const preview = data[previewIdx];
              return (
                <Col sm={3} key={preview.videoId}>
                  <VideoPreview preview={preview} onClick={() => this.gotoVideo(preview.videoId)} />
                </Col>
              );
            })}
          </Row>
          <Row>
            <Col xs={6} sm={3}>
              <Button bsStyle="default" block disabled={previousPageDisabled} onClick={() => this.previousPage()}>
                <Icon name="chevron-circle-left" /> Previous Page
              </Button>
            </Col>
            <Col xs={6} sm={3} smOffset={6}>
              <Button bsStyle="default" block disabled={nextPageDisabled} onClick={() => this.nextPage()}>
                <Icon name="chevron-circle-right" /> Next Page
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

// Falcor queries
SearchResults.queries = {
  preview() {
    return [
      [ 'videoId' ],
      ...VideoPreview.queries.preview()
    ];
  }
};

function mapStateToProps(state, ownProps) {
  return {
    searchTerm: ownProps.location.query.q,
    ...state.search.results
  };
}

export default connect(mapStateToProps, { searchFor, nextPageClick, previousPageClick, unload, push: routeActions.push })(SearchResults);