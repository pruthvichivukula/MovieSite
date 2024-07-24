
# Movie Site
This is the code for a movie voting website.
This is my first nodejs project so the code kinda sucks. If you wanna look at the smelly ahh spaghetti code, I apologize in advance.

## Features so far:
- Register users
- Login in users
- Users can search for movies (tmdb api)
- Users can add movies from the search to the voting list
- Users can vote on movies (for, abstain, or against)
- Movie score updates to reflect user votes in "real-time"

## Planned features/changes:
- Reorganise the code files into an src folder
- Rework main.js to use external functions so that there is better cohesion. (Separate Auth functions, Voting functions, and WebSocket score updating functions)


## Features that could be nice I guess?
- Make it look prettier and not like its from 1998 lol


# Install and initialize

## Install
idk m8, install vscode and pull from the repo I guess? packages should be in package.json

## Initiallize

### Database
I used an external mariaDB database to store the movie, user, and vote data.  The database will have to have its tables initialized.

`TO BE ADDED: SQL commands for creating the tables`

### .env
You will need to create a .env file. It should have the following entries.
`SESSION_SECRET= > your session secret for auth. Probably make it a long random value.`
`DB_HOST=`> the hostname of your db
`DB_USER=`> the username of the user account of your db
`DB_PASSWORD=`> the password of the user account of your db
`DB_DATABASE=`> the name of your db
