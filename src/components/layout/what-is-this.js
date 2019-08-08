import React from 'react';
import { Button, Collapse } from 'react-bootstrap';
import Icon from '../shared/icon';

class WhatIsThis extends React.Component {
  render() {
    return (
      <Collapse in={this.props.showWhatIsThis}>
        <div id="what-is-this">
          <div className="container">
            <div className="row">
            
              <div className="col-sm-4">
                <h4><em>What</em> is KillrVideo?</h4>
                <p>
                  KillrVideo is a reference web application for users looking to learn about using their programming language
                  of choice with <a href="http://cassandra.apache.org" target="_blank">Apache Cassandra</a> and <a href="http://www.datastax.com/products/datastax-enterprise" target="_blank">DataStax Enterprise</a>.
                </p>
                <br />
                <Button bsStyle="success" href="https://killrvideo.github.io/docs/" target="_blank">
                  <Icon name="book" /> Documentation
                </Button>
                <hr className="visible-xs-block"/>
              </div>
              
              <div className="col-sm-4">
                <h4><em>Get</em> the code!</h4>
                <p>
                  All the code, including the CQL used to create the schema for the site is available on GitHub. Pull requests
                  for any bugs, improvements, etc. are greatly appreciated.
                </p>
                <br/>
                <Button bsStyle="success" href="https://killrvideo.github.io/getting-started/" target="_blank">
                  <Icon name="github"/> Get the code
                </Button>
                <hr className="visible-xs-block"/>
              </div>
              
              <div className="col-sm-4">
                <h4><em>Learn more</em> about DataStax Enterprise and Cassandra</h4>
                <p>
                  There are many free resources available to help you learn about DataStax Enterprise and Cassandra, including:
                </p>
                <ul>
                  <li><a href="https://academy.datastax.com/" target="_blank">DataStax Academy</a> (free online training)</li>
                  <li><a href="http://docs.datastax.com/en/index.html" target="_blank">DataStax Documentation</a></li>
                  <li><a href="http://cassandra.apache.org/doc/latest/" target="_blank">Apache Cassandra Documentation</a></li>
                </ul>
  
                { /* On mobile, add a link to hide the what is this UI */ }
                <br/>
                <a href="#" className="visible-xs-block text-muted small dropup" onClick={e => this.props.toggleWhatIsThis()}>
                  <span className="caret"></span> Hide 'What is This?'
                </a>
              </div>
              
            </div>
          </div>
        </div>
      </Collapse>
    )
  }
}

export default WhatIsThis;