// Drop and recreate the keyspace
DROP KEYSPACE IF EXISTS killrvideo_web;
CREATE KEYSPACE killrvideo_web WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

// Session data
CREATE TABLE killrvideo_web.express_session (
   sid text,
   session text,
   expires timestamp,
   PRIMARY KEY (sid)
);