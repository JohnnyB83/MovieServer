# Movie Server Project

## Features
  * User account creation and authentication using passport local
  * Option to edit / delete comments / movies added to server if user is the owner or admin status
  * Persistent comments and movie ratings stored in MongoDB schema
  * Basic admin console to delete / add users to admin status
  * Local search by name for movies within database
  * IMDB movie info lookup using imdb-api calls. Automatically imports movie data into add new movie form
  * External drive mouting to show total space remaining when adding a new movie to the drive
  * Simple streaming of .MP4 movies in HTML5 viewer
  
  ## Dependencies
  * express
  * express-session
  * body-parser
  * ejs
  * method-override
  * mongoose
  * passport
  * passport-local
  * passport-local-mongoose
  * imdb-api
  
  ## License
  MIT
