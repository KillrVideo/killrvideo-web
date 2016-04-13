Falcor Routes called by KillrVideo Web App
==========================================

Here is a list of all the falcor routes called by the KillrVideo web project. This 
can be used as a reference when implementing a backend for KillrVideo.

Get Routes List
---------------

### User as Root
- `usersById[{ key:uuid }][ 'email', 'firstName', 'lastName' ]`
- `usersById[{ key:uuid }].comments[{ range }][ 'commentId', 'comment', 'addedDate' ]`
- `usersById[{ key:uuid }].comments[{ range }].video[ 'videoId', 'name', 'previewImageLocation' ]`
- `usersById[{ key:uuid }].videos[{ range }][ 'videoId', 'name', 'addedDate' ]`
- `currentUser[ 'userId', 'email', 'firstName', 'lastName' ]`
- `currentUser.comments[{ range }][ 'commentId', 'comment', 'addedDate' ]`
- `currentUser.comments[{ range }].video[ 'videoId', 'name', 'previewImageLocation' ]`
- `currentUser.ratings[{ key:uuid }].rating`
- `currentUser.videos[{ range }][ 'videoId', 'name', 'previewImageLocation', 'addedDate' ]`
- `currentUser.videos[{ range }].stats.views`
- `currentUser.videos[{ range }].author[ 'firstName', 'lastName' ]`
- `currentUser.recommendedVideos[{ range }][ 'videoId', 'name', 'previewImageLocation', 'addedDate' ]`
- `currentUser.recommendedVideos[{ range }].stats.views`
- `currentUser.recommendedVideos[{ range }].author[ 'firstName', 'lastName' ]`

### Video as Root
- `videosById[{ key:uuid }][ 'name', 'description', 'tags', 'addedDate', 'locationType, 'location' ]`
- `videosById[{ key:uuid }][ 'status', 'statusDate' ]`
- `videosById[{ key:uuid }].stats.views`
- `videosById[{ key:uuid }].rating[ 'count', 'total' ]`
- `videosById[{ key:uuid }].author[ 'firstName', 'lastName', 'email', 'userId' ]`
- `videosById[{ key:uuid }].comments[{ range }][ 'commentId', 'comment', 'addedDate' ]`
- `videosById[{ key:uuid }].comments[{ range }].author[ 'firstName', 'lastName', 'email', 'userId' ]`
- `videosById[{ key:uuid }].addedComments[0][ 'commentId', 'comment', 'addedDate' ]`
- `videosById[{ key:uuid }].addedComments[0].author[ 'firstName', 'lastName', 'email', 'userId' ]`
- `videosById[{ key:uuid }].relatedVideos[{range}][ 'videoId', 'name', 'previewImageLocation', 'addedDate']`
- `videosById[{ key:uuid }].relatedVideos[{range}].stats.views`
- `videosById[{ key:uuid }].relatedVideos[{range}].author[ 'firstName', 'lastName' ]`

### Video Collection as Root
- `recentVideos[{ range }][ 'videoId', 'name', 'previewImageLocation', 'addedDate' ]`
- `recentVideos[{ range }].stats.views`
- `recentVideos[{ range }].author[ 'firstName', 'lastName' ]`
- `search[{ key:query=term }][{ range }][ 'videoId', 'name', 'previewImageLocation', 'addedDate' ]`
- `search[{ key:query=term }][{ range }].stats.views`
- `search[{ key:query=term }][{ range }].author[ 'firstName', 'lastName' ]`

### Chat Room as Root
- `chatRooms[{ key:string }].users.length`
- `chatRooms[{ key:string }].users[{ range }][ 'userId', 'firstName', 'lastName' ]`
- `chatRooms[{ key:string }].messages[{ range }].author[ 'firstName', 'lastName', 'email' ]`
- `chatRooms[{ key:string }].messages[{ range }][ 'messageId', 'message', 'addedDate' ]`
- `chatRooms[{ key:string }].messagesById[{ key:uuid }].author[ 'firstName', 'lastName', 'email' ]`
- `chatRooms[{ key:string }].messagesById[{ key:uuid }][ 'messageId', 'message', 'addedDate' ]`

Call Routes List
----------------

- `currentUser.login(email, password)`
- `currentUser.logout()`
- `currentUser.register(firstName, lastName, email, password)`
- `currentUser.videos.addYouTube(youTubeVideoId, name, description, tags)`
- `currentUser.videos.addUploaded(uploadUrl, name, description, tags)`
- `videosById[{ key:uuid }].comments.add(comment)`
- `videosById[{ key:uuid }].rate(newRating)`
- `videosById[{ key:uuid }].recordPlayback()`
- `chatRooms[{ key:string }].join()`
- `chatRooms[{ key:string }].leave()`
- `chatRooms[{ key:string }].sendMessage(messageBody)`

All Routes Tree
---------------

### `usersById[{ key:uuid }]`
- `.email`
- `.firstName`
- `.lastName`
- `.comments[{ range }]`
  - `.commentId`
  - `.comment`
  - `.addedDate`
  - `.video`
    - `.videoId`
    - `.name`
    - `.previewImageLocation`
- `.videos[{ range }]`
  - `.videoId`
  - `.name`
  - `.addedDate`

### `currentUser`
- `.userId`
- `.email`
- `.firstName`
- `.lastName`
- `.comments[{ range }]`
  - `.commentId`
  - `.comment`
  - `.addedDate`
  - `.video`
    - `.videoId`
    - `.name`
    - `.previewImageLocation`
- `.ratings[{ key:uuid }]`
  - `.rating`
- `.videos`
  - `.addYouTube(youTubeVideoId, name, description, tags)`
  - `.addUploaded(uploadUrl, name description, tags)`
- `.videos[{ range }]`
  - `.videoId`
  - `.name`
  - `.previewImageLocation`
  - `.addedDate`
  - `.stats`
    - `.views`
  - `.author`
    - `.firstName`
    - `.lastName`
- `.recommendedVideos[{ range }]`
  - `.videoId`
  - `.name`
  - `.previewImageLocation`
  - `.addedDate`
  - `.stats`
    - `.views`
  - `.author`
    - `.firstName`
    - `.lastName`
- `.login(email, password)`
- `.logout()`
- `.register(firstName, lastName, email, password)`
    
### `videosById[{ key:uuid }]`
- `.name`
- `.description`
- `.tags`
- `.addedDate`
- `.location`
- `.locationType`
- `.status`
- `.statusDate`
- `.recordPlayback()`
- `.stats`
  - `.views`
- `.rate(newRating)`
- `.rating`
  - `.count`
  - `.total`
- `.author`
  - `.firstName`
  - `.lastName`
  - `.email`
  - `.userId`
- `.comments.add(comment)`
- `.comments[{ range }]`
  - `.commentId`
  - `.comment`
  - `.addedDate`
  - `.author`
    - `.firstName`
    - `.lastName`
    - `.email`
    - `.userId`
- `.addedComments[0]`
  - `.commentId`
  - `.comment`
  - `.addedDate`
  - `.author`
    - `.firstName`
    - `.lastName`
    - `.email`
    - `.userId`
- `.relatedVideos[{ range }]`
  - `.videoId`
  - `.name`
  - `.previewImageLocation`
  - `.addedDate`
  - `.stats`
    - `.views`
  - `.author`
    - `.firstName`
    - `.lastName`

### `recentVideos[{ range }]`
- `.videoId`
- `.name`
- `.previewImageLocation`
- `.addedDate`
- `.stats`
  - `.views`
- `.author`
  - `.firstName`
  - `.lastName`
  
### `search[{ key:query=term }][{ range }]`
- `.videoId`
- `.name`
- `.previewImageLocation`
- `.addedDate`
- `.stats`
  - `.views`
- `.author`
  - `.firstName`
  - `.lastName`

### `chatRooms[{ key:string }]`
- `.messages[{ range }]`
  - `.messageId`
  - `.message`
  - `.addedDate`
  - `.author`
    - `.firstName`
    - `.lastName`
    - `.email`
- `.users`
  - `[{ range }]`
    - `.userId`
    - `.firstName`
    - `.lastName`
  - `.length`
- `.join()`
- `.leave()`
- `.sendMessage(messageBody)`
