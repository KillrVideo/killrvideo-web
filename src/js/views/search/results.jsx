import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { range } from 'lodash';
import { pushState } from 'redux-router';

import { Alert, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';

import { searchFor, nextPageClick, previousPageClick, unload } from 'actions/search';
import Icon from 'components/shared/icon';
import VideoPreview from 'components/videos/video-preview';

class SearchResults extends Component {
  componentDidMount() {
    this.props.searchFor(this.props.query, SearchResults.queries.preview());
  }
  
  componentDidUpdate(prevProps) {
    // If the search query changes, do a new search
    if (this.props.query !== prevProps.query) {
      this.props.searchFor(this.props.query, SearchResults.queries.preview());
    }
  }
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  gotoVideo(videoId) {
    this.props.pushState(null, `/view/${videoId}`);
  }
  
  nextPage() {
    this.props.nextPageClick(SearchResults.queries.preview());
  }
  
  previousPage() {
    this.props.previousPageClick();
  }
  
  render() {
    const { query, isLoading, previews, currentPageIndex, morePreviewsAvailable } = this.props;
    const previousPageDisabled = isLoading || currentPageIndex === 0;
    const nextPageDisabled = isLoading || (morePreviewsAvailable === false && currentPageIndex + 8 >= previews.length);
    
    return (
      <div>
        <h3 className="section-divider">
          <span><em>{query}</em> Videos</span>
        </h3>
        
        <div id="search-results">
          <h4 className={isLoading && previews.length === 0 ? undefined : 'hidden'}>
            <Icon name="spinner" animate="spin" /> Searching...
          </h4>
          
          <Alert bsStyle="info" className={isLoading === false && previews.length === 0 ? undefined : 'hidden'}>
            There are currently no videos for <strong>{query}</strong>. Why don't you <Link to="/videos/add" className="alert-link">add one</Link>?
          </Alert>
          
          <Row>
            {range(0, 8).map(idx => {
              // Get the index in the preview collection adjusting for the current page start index
              const previewIdx = currentPageIndex + idx;
              if (previewIdx >= previews.length) return;
              
              const preview = previews[previewIdx];
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

// Prop validation
SearchResults.propTypes = {
  // From redux router
  query: PropTypes.string.isRequired,
  
  // From redux search state
  isLoading: PropTypes.bool.isRequired,
  previews: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPageIndex: PropTypes.number.isRequired,
  morePreviewsAvailable: PropTypes.bool.isRequired,
  
  // Actions
  searchFor: PropTypes.func.isRequired,
  nextPageClick: PropTypes.func.isRequired,
  previousPageClick: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { search: { results }, router: { location: { query: { query } } } } = state;
  return {
    query,
    ...results
  };
}

export default connect(mapStateToProps, { searchFor, nextPageClick, previousPageClick, unload, pushState })(SearchResults);