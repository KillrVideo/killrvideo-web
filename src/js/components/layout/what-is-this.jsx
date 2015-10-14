import React, { Component, PropTypes } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import Icon from 'components/shared/icon';

class WhatIsThis extends Component {
  render() {
    return (
      <Collapse in={this.props.showWhatIsThis}>
        <div id="what-is-this">
          <div className="container">
            <div className="row">
            
              <div className="col-sm-4">
                <h4><em>What</em> is KillrVideo?</h4>
                <p>
                  KillrVideo is a sample web application developed in C# and  
                  uses <a href="http://www.datastax.com/products/datastax-enterprise" target="_blank">DataStax Enterprise</a> running 
                  on Microsoft Azure as the database platform. The site demonstrates a number of DataStax Enterprise components in action
                  including <a href="http://www.datastax.com/products/datastax-enterprise-production-certified-cassandra" target="_blank">Apache Cassandra</a>  
                  , <a href="http://www.datastax.com/products/datastax-enterprise-analytics" target="_blank">DSE Analytics</a>  
                  , and <a href="http://www.datastax.com/products/datastax-enterprise-search" target="_blank">DSE Search</a>. The application's  
                  code, data models, data and more are freely available on GitHub.
                </p>
                <hr className="visible-xs-block"/>
              </div>
              
              <div className="col-sm-4">
                <h4><em>Get</em> the code!</h4>
                <p>
                  All the code, including the CQL used to create the schema for the site is available on GitHub. Pull requests
                  for any bugs, improvements, etc. are accepted (and greatly appreciated).
                </p>
                <br/>
                <Button bsStyle="success" href="https://github.com/luketillman/killrvideo-csharp" target="_blank">
                  <Icon icon="github"/> Get the code
                </Button>
                <hr className="visible-xs-block"/>
              </div>
              
              <div className="col-sm-4">
                <h4><em>Learn more</em> about DataStax Enterprise and Cassandra</h4>
                <p>
                  There are many free resources available to help you learn about DataStax Enterprise and Cassandra, including:
                </p>
                <ul>
                  <li><a href="https://academy.datastax.com/" target="_blank">DataStax Academy</a> (free online training for Cassandra and DSE)</li>
                  <li><a href="http://docs.datastax.com/en/index.html" target="_blank">DataStax Documentation</a></li>
                  <li><a href="http://docs.datastax.com/en/getting_started/doc/getting_started/intro.html" target="_blank">Getting Started</a> with DataStax Enterprise and Cassandra documentation</li>
                  <li><a href="http://www.datastax.com/" target="_blank">DataStax website</a> (software downloads and more)</li>
                  <li><a href="http://planetcassandra.org/" target="_blank">Planet Cassandra</a> website</li>
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