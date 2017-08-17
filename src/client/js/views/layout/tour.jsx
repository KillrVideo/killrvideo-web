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

    return (
      <div id="tour">
        <Joyride
          ref={c => (this.joyride = c)}
          run={this.props.showTour} // or some other boolean for when you want to start it
          type={"continuous"}
          showOverlay={true}
          allowClicksThruHole={true}
          autoStart={true}
          disableOverlay={true}
          showSkipButton={false}
          callback={this.handleJoyrideCallback}
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
            },
            // Starting on the Home Page (Unauthenticated)
            {
              title: <h4>Welcome to KillrVideo!</h4>,
              text: "KillrVideo is an open source demo video sharing application built on DataStax Enterprise powered by " +
              "Apache Cassandra. If you're new to Cassandra, this demo is a great way to learn more about how to build your own " +
              "applications and services on top of DataStax Enterprise.",
              selector: "#logo",
              position: "bottom"
            },
            {
              selector: "#logo",
              position: "bottom",
              text: "This tour will walk you through some of the features of the site. Along the way we'll point out some of the " +
              "interesting technical things going on behind the scenes and provide you with links for learning more about those " +
              "topics."
            },
            {
              selector: "#tour-enabled",
              position: "bottom",
              text: "You can toggle this guided tour off at any time using this button. Turning it back on will take you to the home page and " +
              "restart the tour from the beginning."
            },
            {
              page: "home",
              selector: "#recent-videos-list ul.list-unstyled li:first-child div.video-preview",
              position: "bottom",
              text: "Let's get started by looking at a video.",
              callToAction: "Click on a video to continue.",
              beforeShowPromise: function () { return waitForElementIfNotPresent(this.target, "#recent-videos-list"); },
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#recent-videos-list div.video-preview", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // View video page (unauthenticated)
            {
              page: "viewVideo",
              selector: "#logo", // TODO: Make window?
              position: "bottom",
              text: "This is the View Video page where users can playback videos added to the site. Details like the video's description and name " +
              "are stored in a catalog in Cassandra, similar to how a Product Catalog might work on an e-commerce site. Cassandra Query Language or " +
              "CQL makes it easy to store this information. If you're experienced with SQL syntax from working with relational databases, it will " +
              "look very familiar to you.",
            },
            {
              page: "viewVideo",
              selector: "#logo", // TODO: Make window?
              position: "bottom",
              text: "Here's what the <code>videos</code> table for the catalog looks like in CQL:<br/><br/>" +
              "<pre><code>" +
              "CREATE TABLE videos (\r\n" +
              "  videoid uuid,\r\n" +
              "  userid uuid,\r\n" +
              "  name text,\r\n" +
              "  description text,\r\n" +
              "  location text,\r\n" +
              "  location_type int,\r\n" +
              "  preview_image_location text,\r\n" +
              "  tags set&lt;text&gt;,\r\n" +
              "  added_date timestamp,\r\n" +
              "  PRIMARY KEY (videoid)\r\n" +
              ");</code></pre>"
              /* links: [
                { label: "Managing Tables", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCreateTableTOC.html" },
                { label: "CREATE TABLE reference", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlCreateTable.html" }
              ] */
            },
            {
              page: "viewVideo",
              selector: "#view-video-title",
              position: "bottom",
              text: "Querying the data from that <code>videos</code> table to show things like the video title is also easy with CQL. Here's what the query looks like " +
              "to retrieve a video from the catalog in Cassandra:<br/><br/>" +
              "<pre><code>" +
              "SELECT * FROM videos\r\n" +
              "WHERE videoid = ?;" +
              "</code></pre>" +
              "In CQL, the <code>?</code> character is used as a placeholder for bind variable values. If you've ever done parameterized SQL queries before, the idea " +
              "is the same."
              /* links: [
                { label: "Querying Data with CQL", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/queriesTOC.html" },
                { label: "SELECT statement reference", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlSelect.html" }
              ] */
            },
           {
              page: "viewVideo",
              selector: "#view-video-author",
              position: "bottom",
              text: "Videos are added to the catalog by users on the site. Let's take a look at this user's profile.",
              callToAction: "Click on the author for this video to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#view-video-author > a", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // View user profile (unauthenicated)
            {
              page: "userProfile",
              selector: "#logo", // TODO: Make window?
              position: "bottom",
              text: "This is the user profile page. Here you can see basic information about a user, along with any comments they've made on the site and " +
              "any videos they've added to the catalog."
            },
            {
              page: "userProfile",
              selector: "#user-profile-header",
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
              page: "userProfile",
              selector: "#user-profile-header",
              position: "right",
              text: "Since the <code>users</code> table has the <code>PRIMARY KEY</code> defined as the <code>userid</code> column, Cassandra allows us to look users " +
              "up by unique id like this:<br/><br/>" +
              "<pre><code>" +
              "SELECT * FROM users\r\n" +
              "WHERE userid = ?;" +
              "</code></pre>" +
              "Pretty straightforward, right?",
              /* links: [
                { label: "Defining a Basic Primary Key with CQL", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useSimplePrimaryKeyConcept.html" }
              ] */
            },
            {
              page: "userProfile",
              selector: "#register",
              waitForTargetOn: "#navbar-main",
              position: "bottom",
              text: "Most of the interesting things you can do on KillrVideo like adding videos to the catalog or leaving comments on a video, require you to " +
              "be logged in as a registered user. Let's take a look at the user registration process.",
              callToAction: "Click on the Register button to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#register", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // User registration page (unauthenticated)
            {
              page: "register",
              selector: "#register-account form",
              position: "right",
              text: "This is the user registration form for KillrVideo. It probably looks like many of the forms you've filled out before to register for a web " +
              "site. Here we collect basic information like your name and email address."
            },
            {
              page: "register",
              selector: "#register-account form button.btn-primary",
              position: "top",
              text: "When a user submits the form, we insert the data into Cassandra. Here's what it looks like to use a CQL <code>INSERT</code> " +
              "statement to add data to our <code>users</code> table:<br/><br/>" +
              "<pre><code>" +
              "INSERT INTO users (\r\n" +
              "  userid, firstname, lastname,\r\n" +
              "  email, created_date)\r\n" +
              "VALUES (?, ?, ?, ?, ?);" +
              "</code></pre>",
              /* links: [
                { label: "Inserting and Updating Data with CQL", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useInsertDataTOC.html" },
                { label: "INSERT statement reference", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_reference/cql_commands/cqlInsert.html" }
              ] */
            },
            {
              page: "register",
              selector: "#sign-in",
              position: "bottom",
              text: "You might have noticed that our <code>users</code> table doesn't have a <code>password</code> column and so the <code>INSERT</code> " +
              "statement we just showed you isn't capturing that value from the form. Why not? Let's take a look at the Sign In page for an explanation.",
              callToAction: "Click the Sign In button to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#sign-in", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // Sign In page (unauthenticated)
            {
              page: "signIn",
              selector: "#signin-account",
              position: "right",
              text: "This is the sign in form for KillrVideo. Once a user enters their credentials, we'll need to look them up by email address and verify " +
              "their password."
            },
            {
              page: "signIn",
              selector: "#signin-email",
              position: "right",
              text: "If our <code>users</code> table had a <code>password</code> column in it, you might be tempted to try a query like this to look a user up by email " +
              "address:<br/><br/>" +
              "<pre><code>" +
              "SELECT password FROM users\r\n" +
              "WHERE email = ?;" +
              "</code></pre>" +
              "But if we try to execute that query, Cassandra will give us an <code>InvalidQuery</code> error. Why is that?"
            },
            {
              page: "signIn",
              selector: "#signin-account",
              position: "right",
              text: "In Cassandra, the <code>WHERE</code> clause of your query is limited to columns that are part of the <code>PRIMARY KEY</code> of the table. You'll " +
              "remember that in our <code>users</code> table, this was the <code>userid</code> column (so that we could look users up by unique id on the user profile " +
              "page). So how do we do a query to look a user up by email address so we can log them in?",
              /* links: [
                { label: "Restricting queries using WHERE clauses", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/whereConditionsPK.html?hl=where" }
              ] */
            },
            {
              page: "signIn",
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
              ");</code></pre>",
            },
            {
              page: "signIn",
              selector: "#signin-account",
              position: "right",
              text: "When a user registers for the site, we'll insert the data captured into both the <code>users</code> and <code>user_credentials</code> tables. This is a " +
              "data modeling technique called <strong>denormalization</strong> and is something that you'll use a lot when working with Cassandra.",
              /* links: [
                { label: "DS220: Data Modeling Course", url: "https://academy.datastax.com/courses/ds220-data-modeling" },
                { label: "CQL Data Modeling", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/ddl/dataModelingCQLTOC.html" }
              ] */
            },
            {
              page: "signIn",
              selector: "#signin-account button.btn-primary",
              position: "right",
              text: "Now that we have a <code>user_credentials</code> table, we can do a query like this to look a user up by email address and verify their password:<br/><br/>" +
              "<pre><code>" +
              "SELECT password\r\n" +
              "FROM user_credentials\r\n" +
              "WHERE email = ?;" +
              "</code></pre>" +
              "Let's sign into KillrVideo. We've filled in the form with some sample user credentials.",
              callToAction: "Click the Sign In button to continue.",
              showNextButton: false,
              onShow: function (tour) {
                // Fill in some sample user credentials
                $("#signin-email").val("guidedtour@killrvideo.com").change();
                $("#signin-password").val("guidedtour").change();

                addNextOnClickHandler("#signin-account button.btn-primary", tour); // TODO: Next on valid authentication, not just click
              },
              onHide: function () {
                removeNextOnClickHandler();
              }
            },
            // Home page (authenticated)
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-header > span",
              position: "right",
              text: "Now that you know a little bit more about querying and data modeling with Cassandra, let's talk about this Recent Videos section. If you remember our " +
              "<code>videos</code> table when we were discussing the video catalog, you'll recall that it had a <code>PRIMARY KEY</code> of <code>videoid</code> for " +
              "looking videos up by unique identifier. As you can probably guess, that table isn't going to help us for this section where we need to show the latest " +
              "videos added to the site."
            },
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-header > span",
              position: "right",
              text: "But by leveraging denormalization again, we can create a table that allows us to query the video data added to the site by time. In KillrVideo, the" +
              "<code>latest_videos</code> table looks like this:<br/><br/>" +
              "<pre><code>" +
              "CREATE TABLE latest_videos (\r\n" +
              "  yyyymmdd text,\r\n" +
              "  added_date timestamp,\r\n" +
              "  videoid uuid,\r\n" +
              "  userid uuid,\r\n" +
              "  name text,\r\n" +
              "  preview_image_location text,\r\n" +
              "  PRIMARY KEY (\r\n" +
              "    yyyymmdd, added_date, videoid)\r\n" +
              ") WITH CLUSTERING ORDER BY (\r\n" +
              "  added_date DESC, videoid ASC);" +
              "</code></pre>",
              /* links: [
                { label: "Defining a partition key with clustering columns", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCompoundPrimaryKeyConcept.html" }
              ] */
            },
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-header > span",
              position: "right",
              text: "This is a really simple example of a <strong>time series data model</strong>. Cassandra is great at storing time series data and lots of companies " +
              "use DataStax Enterprise for use cases like the Internet of Things (IoT) which are often collecting a lot of time series data from a multitude of " +
              "sensors or devices.",
              /* links: [
                { label: "Cassandra use case IoT", url: "https://academy.datastax.com/use-cases/internet-of-things-time-series" }
                { label: "DataStax IoT case studies", url: "https://www.datastax.com/internet-of-things" }
                { label: "Connecting to the Future of Internet of Things with Cassandra", url: "https://www.datastax.com/2014/10/connecting-to-the-future-of-internet-of-things-with-cassandra" }
              ] */
            },
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-list > div",
              position: "bottom",
              text: "One interesting thing about the <code>latest_videos</code> table is how we go about inserting data into it. In KillrVideo, we decided that the Recent " +
              "Videos list should only ever show videos from <em>at most</em> the last 7 days. As a result, we don't really need to retain any data that's older than " +
              "7 days. While we could write some kind of background job to delete old data from that table on a regular basis, instead we're leveraging Cassandra's " +
              "ability to specify a <strong>TTL</strong> or <strong>Time to Live</strong> when inserting data to that table.",
              beforeShowPromise: function () { return waitForElementIfNotPresent("#recent-videos-list ul.list-unstyled li:first-child div.video-preview", "#recent-videos-list"); }
            },
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-list > div",
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
              "By specifying <code>USING TTL 604800</code>, we are telling Cassandra to automatically expire or delete that record after 604,800 seconds (or 7 days).",
              /* links: [
                { label: "Expiring Data with Time-To-Live", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useExpire.html" }
              ], */
              beforeShowPromise: function () { return waitForElementIfNotPresent("#recent-videos-list ul.list-unstyled li:first-child div.video-preview", "#recent-videos-list"); }
            },
            // TODO: Add video page next?
            {
              page: "homeAuthenticated",
              selector: "#recent-videos-list ul.list-unstyled li:first-child div.video-preview",
              waitForTargetOn: "#recent-videos-list",
              position: "bottom",
              text: "Let's look at a few other things we can do now that we're signed in to the site.",
              callToAction: "Click on a video to continue.",
              beforeShowPromise: function () { return waitForElementIfNotPresent(this.target, "#recent-videos-list"); },
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#recent-videos-list div.video-preview", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // View video page (authenticated)
            {
              page: "viewVideoAuthenticated",
              selector: "div.video-rating-and-sharing",
              position: "bottom",
              text: "Since we're signed in, we can now rate videos as we watch them on the site. The overall rating for a video is calculated using the values " +
              "from two <code>counter</code> columns stored in Cassandra."
            },
            {
              page: "viewVideoAuthenticated",
              selector: "div.video-rating-and-sharing",
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
              "approximate counts.",
              /* links: [
                { label: "Creating a Counter table with CQL", url: "http://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useCountersConcept.html" }
              ] */
            },
            {
              page: "viewVideoAuthenticated",
              selector: "#view-video-comments > h5",
              position: "left",
              text: "The latest comments for a video are also displayed and now that we're signed in, we can leave comments of our own. Comments are another simple " +
              "example of a <strong>time series data model</strong>."
            },
            {
              page: "viewVideoAuthenticated",
              selector: "#view-video-tags a:first-child",
              position: "bottom",
              text: "When users add videos to the catalog, we ask them to provide tags for the video they are adding. These are just keywords that apply to the content " +
              "of the video. Clicking on a tag is the same as using the search box in the header to search for videos with that keyword. Let's see how search works.",
              callToAction: "Click on a tag to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#view-video-tags a", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // Search results page (authenticated)
            {
              page: "searchResultsAuthenticated",
              selector: "#body-content h3.section-divider > span",
              position: "right",
              text: "Here we see can see the search results for the keyword we clicked on. Searching for videos on KillrVideo is powered by the Search feature of " +
              "DataStax Enterprise. This feature creates indexes that allow us to do powerful Lucene queries on our video catalog data that are not possible to do " +
              "with just CQL. The indexes are automatically updated in the background as new data is added to our catalog tables in Cassandra.",
              /* links: [
                { label: "DataStax Enterprise Search", url: "http://www.datastax.com/products/datastax-enterprise-search" }
              ] */
            },
            {
              page: "searchResultsAuthenticated",
              selector: "#body-content h3.section-divider > span",
              position: "right",
              text: "On KillrVideo, we've enabled DataStax Enterprise Search on our <code>videos</code> table which holds our video catalog. When a user searches for " +
              "videos, we're then able to issue a Lucene query that searches for relevant videos. For example, we could use a Lucene query " +
              "like this to search for videos with the word <em>cassandra</em> in the <code>description</code> column:<br/><br/>" +
              "<pre><code>" +
              "description:cassandra" +
              "</code></pre>",
              /* links: [
                { label: "DSE Search Queries", url: "http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesAbout.html" }
              ] */
            },
            {
              page: "searchResultsAuthenticated",
              selector: "#body-content h3.section-divider > span",
              position: "right",
              text: "Lucene queries in DataStax Enterprise are also integrated with CQL, so I can get data from the <code>videos</code> table using that query like this:<br/><br/>" +
              "<pre><code>" +
              "SELECT * FROM videos\r\n" +
              "WHERE solr_query =\r\n" +
              "  'description:cassandra';" +
              "</code></pre>",
              /* links: [
                { label: "CQL Solr Queries in DSE Search", url: "http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesCql.html" }
              ] */
            },
            {
              page: "searchResultsAuthenticated",
              selector: "#body-content h3.section-divider > span",
              position: "right",
              text: "But we're not limited to just querying on a single field. Since DataStax Enterprise Search is powered by Solr, we have all that power available " +
              "to us as well. The query we issue to return search results on this page for <em>cassandra</em> actually looks like this:<br/><br/>" +
              "<pre><code>" +
              "{ 'q': '{!edismax qf=\"name^2 tags^1 description\"}cassandra' }" +
              "</code></pre>" +
              "This uses Solr's Extended DisMax parser to search across multiple columns and gives a boost to search results with <em>cassandra</em> in the <code>name</code> " +
              "or <code>tags</code> columns over just the <code>description</code> column.",
              /* links: [
                { label: "DSE Search Queries with JSON", url: "http://docs.datastax.com/en/dse/5.1/dse-dev/datastax_enterprise/search/queriesJSON.html" },
                { label: "Extended DisMax Parser", url: "https://lucene.apache.org/solr/guide/6_6/the-extended-dismax-query-parser.html" },
              ] */
            },
            {
              page: "searchResultsAuthenticated",
              selector: "#search-box",
              position: "right",
              text: "Search suggestions are also powered by DataStax Enterprise. If you start to enter a search term into the search box, you'll get video names " +
              "that match your search terms as suggestions. Try typing <em>cassandra</em> into the search box to see an example. This is done by enabling the Solr " +
              "Suggester component in DSE Search.",
              /* links: [
                { label: "SOLR Suggester", url: "https://lucene.apache.org/solr/guide/6_6/suggester.html" }
              ] */
            },
            {
              page: "searchResultsAuthenticated",
              selector: "#search-results div.row div.col-sm-3:first-child div.video-preview",
              position: "bottom",
              text: "There are some other cool things we can do with DataStax Enterprise Search beyond just full-text searching. Let's look at a video again to check out " +
              "another KillrVideo feature powered by DSE Search.",
              callToAction: "Click on a video to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("div.video-preview", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // View video page (authenticated)
            {
              page: "viewVideoAuthenticated",
              selector: "#view-video-related div.video-preview-list",
              position: "top",
              text: "Down here we see a list of videos that are related to the one we're currently viewing. This list is also powered by DataStax Enterprise Search. By " +
              "turning on Solr's MoreLikeThis feature in DSE, we can issue queries that will return videos with similar terms (in their titles, descriptions, etc.) to the " +
              "video we're currently viewing.",
              beforeShowPromise: function () { return waitForElementIfNotPresent(this.target, "#view-video-related"); },
              /* links: [
                { label: "MoreLikeThis Component", url: "https://lucene.apache.org/solr/guide/6_6/morelikethis.html" }
              ] */
            },
            {
              page: "viewVideoAuthenticated",
              selector: "#logo",
              position: "bottom",
              text: "DataStax Enterprise also offers some other interesting features beyond just Search. Let's go back to the home page to take a look at another one of those.",
              callToAction: "Click on the KillrVideo logo to continue.",
              showNextButton: false,
              onShow: function (tour) { addNextOnClickHandler("#logo", tour); },
              onHide: function () { removeNextOnClickHandler(); }
            },
            // Home page (authenticated)
            {
              page: "homeAuthenticated",
              selector: "#recommended-videos-header",
              position: "top",
              text: "Here, you see <strong>personalized recommendations</strong> for videos on the site that you might be interested in watching. This list of videos is " +
              "driven by DataStax Enterprise Analytics. DSE Analytics enables you to run analytics workloads with Apache Spark or Hadoop on top of your transactional " +
              "data stored in Cassandra.",
              /* links: [
                { label: "DataStax Enterprise Analytics", url: "http://www.datastax.com/products/datastax-enterprise-analytics" }
              ] */
            },
            {
              page: "homeAuthenticated",
              selector: "#recommended-videos-header",
              position: "top",
              text: "As you watch and rate videos on KillrVideo, we record those ratings in Cassandra. Here's what the <code>video_ratings_by_user</code> table looks like " +
              "where we store that information:<br/><br/>" +
              "<pre><code>" +
              "CREATE TABLE video_ratings_by_user (\r\n" +
              "  videoid uuid,\r\n" +
              "  userid uuid,\r\n" +
              "  rating int,\r\n" +
              "  PRIMARY KEY (videoid, userid)\r\n" +
              ");</code></pre>",
            },
            {
              page: "homeAuthenticated",
              selector: "#recommended-videos-header",
              position: "top",
              text: "Using DSE Analytics integration with Apache Spark, we're able to write a simple recommendation engine that leverages Spark's MLlib Machine Learning library " +
              "to consume the data in that table and output video recommendations based on the ratings you and other users on the site have given. Amazingly, the Spark job to do " +
              "this is less than 100 lines of code.",
              /* links: [
                { label: "Apache Spark MLlib", url: "http://spark.apache.org/docs/latest/mllib-guide.html" }
              ] */
            },
            {
              page: "homeAuthenticated",
              selector: "#logo",
              position: "bottom",
              text: "Thanks for taking the time to learn more about KillrVideo! Remember, KillrVideo is completely open source, so check it out on GitHub " +
              "to dig deeper into how things work. There's also great self-paced training courses for DataStax Enterprise available online at the DataStax " +
              "Academy web site.",
              showNextButton: false,
              showEndButton: true,
              /* links: [
                { label: "KillrVideo on GitHub", url: "https://github.com/KillrVideo" },
                { label: "Free Online Courses at DataStax Academy", url: "https://academy.datastax.com/" },
                { label: "Companies Using DataStax Enterprise", url: "http://www.datastax.com/customers" }
              ] */
            }
          ]}
        />
      </div>
    )
  }
}

export default Tour;