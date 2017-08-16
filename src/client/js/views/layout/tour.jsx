import React, { Component, PropTypes } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import Icon from 'components/shared/icon';
import Joyride from 'react-joyride';

class Tour extends Component {
  
  handleJoyrideCallback(result) {
    //const{joyride} = this.props;

    // if (result.action == 'close') {
    //   this.setState({run: false});
    // }

  }

  render() {
    //const { joyride } = this.props;
      
    return ( 
      // <Collapse in={this.props.showTour}>
      //   <div id="tour">
      //     <div className="container">
      //       <div className="row">
            
      //         <div className="col-sm-4">
      //           <h4>Welcome to KillrVideo</h4>
      //           <p>
      //             KillrVideo is an open source demo video sharing application built on DataStax Enterprise powered by
      //             <a href="http://cassandra.apache.org" target="_blank">Apache Cassandra</a>. If you're new to Cassandra, 
      //             this demo is a great way to learn more about how to build your own applications and services on top of 
      //             <a href="http://www.datastax.com/products/datastax-enterprise" target="_blank">DataStax Enterprise</a>.
      //           </p>
      //           <br />
      //           <Button bsStyle="success" href="https://killrvideo.github.io/docs/" target="_blank">
      //             <Icon name="book" /> Documentation
      //           </Button>
  
      //           { /* On mobile, add a link to hide the tour UI */ }
      //           <br/>
      //           <a href="#" className="visible-xs-block text-muted small dropup" onClick={e => this.props.toggleTour()}>
      //             <span className="caret"></span> Hide 'Tour'
      //           </a>
      //         </div>
              
      //       </div>
      //     </div>
      //   </div>
      // </Collapse>
      
      <div id="tour">
        <Joyride
        ref={c => (this.joyride = c)}
        steps={[
          {
            title: <h4>A Step</h4>,
            text: "more text",
            selector: '#recent-videos',
            position: 'bottom'
          },
          {
            title: <h4>Welcome to KillrVideo</h4>,
            text: "KillrVideo is an open source demo video sharing application built on DataStax Enterprise powered by " +
             "Apache Cassandra. If you're new to Cassandra, this demo is a great way to learn more about how to build your own " +
             "applications and services on top of DataStax Enterprise.",
            selector: '#header',
            position: 'bottom'
          },
          {
            title: <h4>A Step</h4>,
            text: "more text",
            selector: '#recent-videos',
            position: 'bottom'
          }
        ]}
        run={this.props.showTour} // or some other boolean for when you want to start it
        type={"continuous"}
        showOverlay={true}
        allowClicksThruHole={true}
        autoStart={true}
        disableOverlay={true}
        showSkipButton={false}
        callback={this.handleJoyrideCallback}
        />
      </div>
    )
  }
}

export default Tour;