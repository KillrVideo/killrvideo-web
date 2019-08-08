import React from 'react';
import Icon from './icon';
import Joyride from 'react-joyride';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

class Tour extends React.Component {

  constructor(props) {
    super(props);
    // binding callbacks so that we can access variables inside the Tour object
    this.handleJoyrideCallback = this.handleJoyrideCallback.bind(this);    
    this.selectorCallback = this.selectorCallback.bind(this);
  }

  selectorCallback(event) {
    // removing callback so that we have a one-time event
    event.target.removeEventListener(event.type, this.selectorCallback);

    // Advance the tour - but need to delay until after the page renders
    var joyride = this.joyride;
    setTimeout(function() {joyride.next();}, 200);
  }

  handleJoyrideCallback(result) {
    //console.log("handleJoyrideCallback - type: " + result.type + ", action: " + result.action + ", index: " + result.index);
    //console.log(result);

    // For steps where we allow a click through the overlay, the tour does not get advanced automatically
    // Therefore we register our own (one time) callback on the selector that can advance the tour
    if (result.step && result.step.allowClicksThruHole) {
      //console.log("handleJoyrideCallback - allowClicksThroughHole, selector: " + result.step.selector);
      var selectedObj = document.querySelector(result.step.selector);

      if (result.type === "tooltip:before" && result.action === "next") {
        selectedObj.addEventListener("click", this.selectorCallback );        
      }
    }
    
    // If the user exits the tour (via the 'X' in the upper right) or finishes the tour (via the 'Last' button
    // on the final step), set the tour state to off
    if ( (result.type === "step:after" && result.action === "close") || result.type === "finished") {
      this.props.toggleTour();
      this.joyride.reset(true);
    }

    // If current user is signed in, sign them out so tour steps work correctly
    if (result.type === "step:after" && result.index === 13) { // special case
      this.props.push('/account/signout');
    }

  }

  render() {

    return (
      <Joyride
        ref={c => (this.joyride = c)}
        run={this.props.showTour} // or some other boolean for when you want to start it
        type={"continuous"}
        showOverlay={true} // true - greys out items not in focus
        allowClicksThruHole={false} // true - allows mouse clicks within selected area
        autoStart={true} // shows first step when enabled (instead of beacon)
        disableOverlay={true} // true - clicking on overlay has no effect, false - click closes tooltip
        showSkipButton={false} // we want to force them to enter things and not be able to skip steps, at least by default
        showBackButton={false} // disabling back button (hopefully temporarily)
        scrollToSteps={false} // Gilardi says default behavior (true) is annoying
        callback={this.handleJoyrideCallback}
        steps={[
          // Starting on the Home Page (Unauthenticated)
          {
            title: <h4>Welcome to KillrVideo!</h4>,
            selector: "#logo",
            position: "bottom",
            text: "KillrVideo is an open source demo video sharing application built on DataStax Enterprise powered by " +
            "Apache Cassandra. If you're new to technologies like Cassandra, Apache Spark, search, and graph, this demo is a " +
            "great way to learn more about how to build your own applications and services on top of DataStax Enterprise.",
            isFixed: true
          },
          {
            selector: ".navbar-brand", // "#logo"
            position: "bottom",
            text: "This tour will walk you through some of the features of the site. Along the way we'll point out some of the " +
            "interesting technical things going on behind the scenes and provide you with links for learning more about those " +
            "topics. We'll start our tour on the home page. <br/><br/><strong>Click on the KillrVideo logo to go to the home page</strong>.",
            isFixed: true,
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          {
            selector: "#show-tour", 
            position: "bottom",
            text: "You can exit the tour at any time by clicking on the 'X' in the upper corner of the current step. " +
            "You can re-start the tour from the beginning at any time using this 'Tour' button.",
            isFixed: true, 
            allowClicksThruHole: false
          },
          {
            selector: "#recent-videos div ul.list-unstyled li:first-child",
            //selector: "#recent-videos ul.list-unstyled li:first-child div.video-preview",
            position: "right",
            text: "Let's get started by looking at a video. <br/><br/><strong>Click on a video to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // View video page (unauthenticated)
          {
            selector: "#view-video-row", 
            position: "bottom",
            text: "This is the View Video page where users can playback videos added to the site. Details like the video's description and name " +
            "are stored in a catalog in Cassandra, similar to how a Product Catalog might work on an e-commerce site. The Cassandra Query Language or " +
            "CQL makes it easy to store this information. If you're experienced with SQL syntax from working with relational databases, it will " +
            "look very familiar to you."
          },
          {
            selector: "#view-video-player", 
            position: "right",
            text: "Here's what the <code>videos</code> table for the catalog looks like in CQL:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE videos (\r\n" +
            "  videoid uuid, userid uuid,\r\n" +
            "  name text, description text,\r\n" +
            "  location text, location_type int,\r\n" +
            "  preview_image_location text, tags set&lt;text&gt;,\r\n" +
            "  added_date timestamp,\r\n" +
            "  PRIMARY KEY (videoid)\r\n" +
            ");</code></pre>" +
            "<br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCreateTableTOC.html' target='_blank'>Managing Tables</a></li>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlCreateTable.html' target='_blank'>CREATE TABLE reference</a></li>" +
            "</ul>"
          },
          {
            selector: "#view-video-title",
            position: "bottom",
            text: "Querying the data from the <code>videos</code> table to show things like the video title is also easy with CQL. Here's what the query looks like " +
            "to retrieve a video from the catalog in Cassandra:<br/><br/>" +
            "<pre><code>" +
            "SELECT * FROM videos\r\n" +
            "WHERE videoid = ?;" +
            "</code></pre>" +
            "In CQL, the <code>?</code> character is used as a placeholder for bind variable values. If you've ever done parameterized SQL queries before, the idea " +
            "is the same." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/queriesTOC.html' target='_blank'>Querying Data with CQL</a></li>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlSelect.html' target='_blank'>SELECT statement reference</a></li>" +
            "</ul>"
          },
          {
            selector: "#view-video-author",
            position: "bottom",
            text: "Videos are added to the catalog by users on the site. Let's take a look at this user's profile. " +
            "<br/><br/><strong>Click on the author for this video to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // View user profile (unauthenicated)
          {
            selector: "#user-profile", 
            position: "bottom",
            text: "This is the user profile page. Here you can see basic information about a user, along with any comments they've made on the site and " +
            "any videos they've added to the catalog."
          },
          {
            selector: "#user-profile-col",
            position: "right",
            text: "Just like the video catalog data, basic profile information for a user is stored in a CQL table and users can be looked up by unique " +
            "id. Here's what the <code>users</code> table looks like:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE users (\r\n" +
            "  userid uuid,\r\n" +
            "  firstname text,\r\n" +
            "  lastname text,\r\n" +
            "  email text,\r\n" +
            "  created_date timestamp,\r\n" +
            "  PRIMARY KEY (userid)\r\n" +
            ");</code></pre>"
          },
          {
            selector: "#user-profile-row", // TODO more focused?
            position: "right",
            text: "Since the <code>users</code> table has the <code>PRIMARY KEY</code> defined as the <code>userid</code> column, Cassandra allows us to look users " +
            "up by unique id like this:<br/><br/>" +
            "<pre><code>" +
            "SELECT * FROM users\r\n" +
            "WHERE userid = ?;" +
            "</code></pre>" +
            "Pretty straightforward, right?" +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useSimplePrimaryKeyConcept.html' target='_blank'>Defining a Basic Primary Key with CQL</a></li>" +
            "</ul>"
          },
          {
            selector: "#register",
            position: "bottom",
            text: "Most of the interesting things you can do on KillrVideo like adding videos to the catalog or leaving comments on a video, require you to " +
            "be logged in as a registered user. Let's take a look at the user registration process. <br/><br/><strong>Click on the Register button to continue.</strong>",
            isFixed: true,
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // User registration page (unauthenticated)
          {
            selector: "#register-account-fields",
            //selector: "#register-account form",
            position: "bottom",
            text: "This is the user registration form for KillrVideo. It probably looks like many of the forms you've filled out before to register for a web " +
            "site. Here we collect basic information like your name and email address. " +
            "<br/><br/><strong>Optional: enter your information to create an account if you haven't done so already, then select 'Next'.</strong>"
          },
          {
            selector: "#register-account form button.btn-primary",
            position: "right",
            text: "When a user submits the form, we insert the data into Cassandra. Here's what it looks like to use a CQL <code>INSERT</code> " +
            "statement to add data to our <code>users</code> table:<br/><br/>" +
            "<pre><code>" +
            "INSERT INTO users (userid,\r\n" +
            "  firstname, lastname, email, created_date)\r\n" +
            "VALUES (?, ?, ?, ?, ?);" +
            "</code></pre>" +
            "See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useInsertDataTOC.html' target='_blank'>Inserting and Updating Data with CQL</a></li>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlInsert.html' target='_blank'>INSERT statement reference</a></li>" +
            "</ul>" +
            "<strong>If you've entered values to create a new user, click the 'Register' button. If you already have an account you may skip this step " +
            " by selecting the 'Next' button.</strong>",
            allowClicksThruHole: true
          },
          // Starting on the Home Page (Unauthenticated)
          {
            selector: "#logo",
            position: "bottom",
            text: "If you did register a new user, KillrVideo conveniently logs you in automatically. However, for the purposes of this tour we'll make sure you're logged out " + 
            "so that we can talk a bit more about how the log in process works.",
            isFixed: true
          },    
          {
            selector: "#sign-in",
            position: "bottom",
            text: "You might have noticed that our <code>users</code> table doesn't have a <code>password</code> column and so the <code>INSERT</code> " +
            "statement we just showed you isn't capturing that value from the form. Why not? Let's take a look at the Sign In page for an explanation. " +
            "<br/><br/><strong>Click the Sign In button to continue.</strong>",
            isFixed: true,
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // Sign In page (unauthenticated)
          {
            selector: "#signin-fields",
            position: "right",
            text: "This is the sign in form for KillrVideo. Once a user enters their credentials, we'll need to look them up by email address and verify " +
            "their password. <br/><br/><strong>Enter your credentials here now.</strong>"
          },
          {
            selector: "#signin-password",
            position: "right",
            text: "If our <code>users</code> table had a <code>password</code> column in it, you might be tempted to try a query like this to look a user up by email " +
            "address:<br/><br/>" +
            "<pre><code>" +
            "SELECT password FROM users\r\n" +
            "WHERE email = ?;" +
            "</code></pre>" +
            "But if we try to execute that query, Cassandra will give us an <code>InvalidQuery</code> error. Why is that? <br/>" +
            "In Cassandra, the <code>WHERE</code> clause of your query is limited to columns that are part of the <code>PRIMARY KEY</code> of the table. You'll " +
            "Remember that in our <code>users</code> table, this was the <code>userid</code> column (so that we could look users up by unique id on the user profile " +
            "page). So how do we do a query to look a user up by email address so we can log them in?" +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/whereConditionsPK.html?hl=where' target='_blank'>Restricting queries using WHERE clauses</a></li>" +
            "</ul>",
            allowClicksThruHole: false
          },
          {
            selector: "#signin-email",
            position: "right",
            text: "To solve this problem we'll create a second table in Cassandra for storing user data and make sure that it has the appropriate <code>PRIMARY KEY</code> " +
            "definition for querying users by email address. In KillrVideo, that table looks like this:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE user_credentials (\r\n" +
            "  email text,\r\n" +
            "  password text,\r\n" +
            "  userid uuid\r\n" +
            "  PRIMARY KEY (email)\r\n" +
            ");</code></pre>" +
            "When a user registers for the site, we'll insert the data captured into both the <code>users</code> and <code>user_credentials</code> tables. This is a " +
            "data modeling technique called <strong>denormalization</strong> and is something that you'll use a lot when working with Cassandra." +
            "<br/>See also: " +
            "<ul>" +
            "    <li><a href='https://academy.datastax.com/courses/ds220-data-modeling' target='_blank'>DS220: Data Modeling Course</a></li>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/ddl/dataModelingCQLTOC.html' target='_blank'>CQL Data Modeling</a></li>" +
            "</ul>"
          },
          {
            selector: "#signin-account button.btn-primary",
            position: "right",
            text: "Now that we have a <code>user_credentials</code> table, we can do a query like this to look a user up by email address and verify their password:<br/><br/>" +
            "<pre><code>" +
            "SELECT password\r\n" +
            "FROM user_credentials\r\n" +
            "WHERE email = ?;" +
            "</code></pre>" +
            "Let's sign into KillrVideo with the account credentials you just created. <br/><br/><strong>Click the Sign In button to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // Home page (authenticated)
          {
            selector: "#recent-videos",
            position: "bottom",
            text: "Now that you know a little bit more about querying and data modeling with Cassandra, let's talk about this Recent Videos section. If you remember our " +
            "<code>videos</code> table when we were discussing the video catalog, you'll recall that it had a <code>PRIMARY KEY</code> of <code>videoid</code> for " +
            "looking videos up by unique identifier. As you can probably guess, that table isn't going to help us for this section where we need to show the latest " +
            "videos added to the site.",
            allowClicksThruHole: false
          },
          {
            selector: "#video-lists div", 
            position: "bottom",
            text: "But by leveraging denormalization again, we can create a table that allows us to query the video data added to the site by time. In KillrVideo, the" +
            "<code>latest_videos</code> table looks like this:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE latest_videos (\r\n" +
            "  yyyymmdd text, added_date timestamp,\r\n" +
            "  videoid uuid, userid uuid,\r\n" +
            "  name text, preview_image_location text,\r\n" +
            "  PRIMARY KEY (\r\n" +
            "    yyyymmdd, added_date, videoid)\r\n" +
            ") WITH CLUSTERING ORDER BY (\r\n" +
            "  added_date DESC, videoid ASC);" +
            "</code></pre>" +
            "See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCompoundPrimaryKeyConcept.html' target='_blank'>Defining a partition key with clustering columns</a></li>" +
            "</ul>"
          },
          {
            selector: "#recent-videos",
            position: "bottom",
            text: "This is a really simple example of a <strong>time series data model</strong>. Cassandra is great at storing time series data and lots of companies " +
            "use DataStax Enterprise for use cases like the Internet of Things (IoT) which are often collecting a lot of time series data from a multitude of " +
            "sensors or devices." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='https://academy.datastax.com/use-cases/internet-of-things-time-series' target='_blank'>Cassandra IoT use cases</a></li>" +
            "    <li><a href='https://www.datastax.com/internet-of-things' target='_blank'>DataStax IoT case studies</a></li>" +
            "    <li><a href='https://www.datastax.com/2014/10/connecting-to-the-future-of-internet-of-things-with-cassandra' target='_blank'>Connecting to the Future of Internet of Things with Cassandra</a></li>" +
            "</ul>"
          },
          {
            selector: "#video-lists div", 
            position: "bottom",
            text: "One interesting thing about the <code>latest_videos</code> table is how we go about inserting data into it. In KillrVideo, we decided that the Recent " +
            "Videos list should only ever show videos from <em>at most</em> the last 7 days. As a result, we don't really need to retain any data that's older than " +
            "7 days. While we could write some kind of background job to delete old data from that table on a regular basis, instead we're leveraging Cassandra's " +
            "ability to specify a <strong>TTL</strong> or <strong>Time to Live</strong> when inserting data to that table.",
          },
          {
            selector: "#recent-videos",
            position: "bottom",
            text: "Here's what an <code>INSERT</code> statement into the <code>latest_videos</code> table looks like:<br/><br/>" +
            "<pre><code>" +
            "INSERT INTO latest_videos (\r\n" +
            "  yyyymmdd, added_date, videoid,\r\n" +
            "  userid, name,\r\n" +
            "  preview_image_location)\r\n" +
            "VALUES (?, ?, ?, ?, ?, ?)\r\n" +
            "USING TTL 604800;" +
            "</code></pre>" +
            "By specifying <code>USING TTL 604800</code>, we are telling Cassandra to automatically expire or delete that record after 604,800 seconds (or 7 days)." +
            "<br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useExpire.html' target='_blank'>Expiring Data with Time-To-Live</a></li>" +
            "</ul>"
          },
          {
            selector: "#recent-videos div ul.list-unstyled li:first-child",            
            waitForTargetOn: "#recent-videos-list",
            position: "bottom",
            text: "Let's look at a few other things we can do now that we're signed in to the site. <br/><br/><strong>Click on a video to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // View video page (authenticated)
          {
            selector: "#view-video-details",
            position: "bottom",
            text: "Since we're signed in, we can now rate videos as we watch them on the site. The overall rating for a video is calculated using the values " +
            "from two <code>counter</code> columns stored in Cassandra."
          },
          {
            selector: "#video-rating-and-sharing",
            position: "bottom",
            text: "Here's what the <code>video_ratings</code> table looks like:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE video_ratings (\r\n" +
            "  videoid uuid,\r\n" +
            "  rating_counter counter,\r\n" +
            "  rating_total counter,\r\n" +
            "  PRIMARY KEY (videoid)\r\n" +
            ");</code></pre>" +
            "Columns of type <code>counter</code> are a special Cassandra column type that allow operations like increment/decrement and are great for storing " +
            "approximate counts." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCountersConcept.html' target='_blank'>Creating a Counter table with CQL</a></li>" +
            "</ul>"
          },
          {
            selector: "#view-video-comments > h5",
            position: "left",
            text: "The latest comments for a video are also displayed and now that we're signed in, we can leave comments of our own. Comments are another simple " +
            "example of a <em>time series data model</em>."
          },
          {
            selector: "#view-video-tags",
            position: "bottom",
            text: "When users add videos to the catalog, we ask them to provide tags for the video they are adding. These are just keywords that apply to the content " +
            "of the video. Clicking on a tag is the same as using the search box in the header to search for videos with that keyword. Let's see how search works. " +
            "<br/><br/><strong>Click on a tag to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // Search results page (authenticated)
          {
            selector: "#search-result-page",
            position: "bottom",
            text: "Here we see can see the search results for the keyword we clicked on. Searching for videos on KillrVideo is powered by the Search feature of " +
            "DataStax Enterprise. This feature creates indexes that allow us to do powerful Lucene queries on our video catalog data that are not possible to do " +
            "with just CQL. The indexes are automatically updated in the background as new data is added to our catalog tables in Cassandra." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://www.datastax.com/products/datastax-enterprise-search' target='_blank'>DataStax Enterprise Search</a></li>" +
            "</ul>"
          },
          {
            selector: "#search-results",
            position: "bottom",
            text: "On KillrVideo, we've enabled DataStax Enterprise Search on our <code>videos</code> table which holds our video catalog. When a user searches for " +
            "videos, we're then able to issue a Lucene query that searches for relevant videos. For example, we could use a Lucene query " +
            "like this to search for videos with the word <em>cassandra</em> in the <code>description</code> column:<br/><br/>" +
            "<pre><code>" +
            "description:cassandra" +
            "</code></pre>" +
            "See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesAbout.html' target='_blank'>DSE Search Queries</a></li>" +
            "</ul>"
          },
          {
            selector: "#search-result-page div",
            position: "right",
            text: "Lucene queries in DataStax Enterprise are also integrated with CQL, so I can get data from the <code>videos</code> table using that query like this:<br/><br/>" +
            "<pre><code>" +
            "SELECT * FROM videos\r\n" +
            "WHERE solr_query =\r\n" +
            "  'description:cassandra';" +
            "</code></pre>" +
            "See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesCql.html' target='_blank'>CQL Solr Queries in DSE Search</a></li>" +
            "</ul>"
          },
          {
            selector: "#search-results",
            position: "right",
            text: "But we're not limited to just querying on a single field. Since DataStax Enterprise Search is powered by Solr, we have all that power available " +
            "to us as well. The query we issue to return search results on this page for <em>cassandra</em> actually looks like this:<br/><br/>" +
            "<pre><code>" +
            "{ 'q': '{!edismax qf=\"name^2 tags^1 description\"}cassandra' }" +
            "</code></pre>" +
            "This uses Solr's Extended DisMax parser to search across multiple columns and gives a boost to search results with <em>cassandra</em> in the <code>name</code> " +
            "or <code>tags</code> columns over just the <code>description</code> column." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesJSON.html' target='_blank'>DSE Search Queries with JSON</a></li>" +
            "    <li><a href='https://lucene.apache.org/solr/guide/6_6/the-extended-dismax-query-parser.html' target='_blank'>Extended DisMax Parser</a></li>" +
            "</ul>"
          },
          {
            selector: "#search-box",
            position: "right",
            text: "Search suggestions are also powered by DataStax Enterprise. If you start to enter a search term into the search box, you'll get video names " +
            "that match your search terms as suggestions. Try typing <em>cassandra</em> into the search box to see an example. This is done by enabling the Solr " +
            "Suggester component in DSE Search." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='https://lucene.apache.org/solr/guide/6_6/suggester.html' target='_blank'>SOLR Suggester</a></li>" +
            "</ul>",
            isFixed: true
          },
          {
            selector: "#search-results div.row div.col-sm-3",
            position: "right",
            text: "There are some other cool things we can do with DataStax Enterprise Search beyond just full-text searching. Let's look at a video again to check out " +
            "another KillrVideo feature powered by DSE Search. <br/><br/><strong>Click on a video to continue.</strong>",
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // View video page (authenticated)
          {
            selector: "#view-video-related",
            position: "top",
            text: "Down here we see a list of videos that are related to the one we're currently viewing. This list is also powered by DataStax Enterprise Search. By " +
            "turning on Solr's MoreLikeThis feature in DSE, we can issue queries that will return videos with similar terms (in their titles, descriptions, etc.) to the " +
            "video we're currently viewing." +
            "<br/>See also: " +
            "<ul>" +
            "    <li><a href='https://lucene.apache.org/solr/guide/6_6/morelikethis.html' target='_blank'>MoreLikeThis Component</a></li>" +
            "</ul>",
            isFixed: true
          },
          {
            selector: "#logo",
            position: "bottom",
            text: "DataStax Enterprise also offers some other interesting features beyond just Search. Let's go back to the home page to take a look at another one of those. " +
            "<br/><br/><strong>Click on the KillrVideo logo to continue.</strong>",
            isFixed: true,
            allowClicksThruHole: true,
            style: {
              button: {
                display: 'none',
              }
            }
          },
          // Home page (authenticated)
          {
            selector: "#recommended-videos",
            position: "top",
            text: "Here, you see <strong>personalized recommendations</strong> for videos on the site that you might be interested in watching. This list of videos is " +
            "driven by DataStax Enterprise Graph. In addition to the Cassandra tables for data including users, videos, and ratings, KillrVideo also uses a graph to " +
            "represent these elements as vertices, and the relationships between them as edges, for example, a rating edge that represents which user rated a particular " +
            "video, and the value of that rating." + 
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://www.datastax.com/products/datastax-enterprise-graph' target='_blank'>DataStax Enterprise Graph</a></li>" +
            "</ul>"
          },
          {
            selector: "#video-lists div#recommended-videos",
            position: "top",
            text: "As you watch and rate videos on KillrVideo, we record those ratings in Cassandra. Here's what the <code>video_ratings_by_user</code> table looks like " +
            "where we store that information:<br/><br/>" +
            "<pre><code>" +
            "CREATE TABLE video_ratings_by_user (\r\n" +
            "  videoid uuid,\r\n" +
            "  userid uuid,\r\n" +
            "  rating int,\r\n" +
            "  PRIMARY KEY (videoid, userid)\r\n" +
            ");</code></pre>"
          },
          {
            selector: "#recommended-videos",
            position: "top",
            text: "Using DSE Graph, we can leverage your ratings and to identify other users that gave similar ratings to those movies, and recommend other videos those users " +
            "rated highly that you haven't seen. This approach is known as collaborative filtering. KillrVideo uses a graph traversal implemented using the Gremlin language " +
            "and a Domain Specific Language (DSL) we built on top of Gremlin." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='http://tinkerpop.apache.org/' target='_blank'>Apache Tinkerpop (Gremlin)</a></li>" +
            "    <li><a href='https://www.datastax.com/dev/blog/gremlin-dsls-in-java-with-dse-graph' target='_blank'>Gremlin DSLs in Java with DSE Graph</a></li>" +
            "</ul>"
          },
          {
            selector: "#logo",
            position: "bottom",
            text: "Thanks for taking the time to learn more about KillrVideo! Remember, KillrVideo is completely open source, so check it out on GitHub " +
            "to dig deeper into how things work. There's also great self-paced training courses for DataStax Enterprise available online at the DataStax " +
            "Academy web site." +
            "<br/><br/>See also: " +
            "<ul>" +
            "    <li><a href='https://github.com/KillrVideo' target='_blank'>KillrVideo on GitHub</a></li>" +
            "    <li><a href='https://academy.datastax.com/' target='_blank'>Free Online Courses at DataStax Academyb</a></li>" +
            "    <li><a href='http://www.datastax.com/customers' target='_blank'>Companies Using DataStax Enterprise</a></li>" +
            "</ul>",
            isFixed: true
          }
        ]}
      />
    )
  }
}

// Export component
// export default connect(null, { push: routeActions.push })(Tour);
export default Tour;