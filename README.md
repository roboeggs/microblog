##  Microblogging website ##
### CM2040 Database Networks and the Web ###

#### Installation requirements ####

* NodeJS 
    - follow the install instructions at https://nodejs.org/en/
    - we recommend using the latest LTS version
* Sqlite3 
    - follow the instructions at https://www.tutorialspoint.com/sqlite/sqlite_installation.htm 
    - Note that the latest versions of the Mac OS and Linux come with SQLite pre-installed

### Project Setup ###

To get started with this project:

1. Run `npm install` from the project directory to install all the node packages.

2. Run `npm run build-db` to create the database on Mac or Linux, 
   or run `npm run build-db-win` to create the database on Windows.

3. Run `npm run start` to start serving the web app (Access via http://localhost:3000)

You can also run: 
- `npm run clean-db` to delete the database on Mac or Linux before rebuilding it
- `npm run clean-db-win` to delete the database on Windows before rebuilding it


### Project Structure ###

- `views/`: Contains EJS templates used by Express
- `utils/`: Houses small modules that aid in development and simplify code
- `routes/`: Defines the main routes of the application
- `controllers/`: Implements the functions for each route

### Database Structure ###

The SQLite database consists of three main tables:

1. `users`: Stores user information
2. `articles`: Contains articles published by users
3. `comments`: Stores comments on articles

Key fields:
- `users`: user_id, first_name, last_name, email, blog, password
- `articles`: article_id, user_id, title, content, status, created, last_change, published, likes, views
- `comments`: comment_id, user_id, article_id, created, comment

### Additional Libraries ###

- Express.js: Web framework for Node.js
- EJS: Templating engine for generating HTML
- SQLite3: Database driver
- jsonwebtoken: For generating and verifying JWT tokens
- cookie-parser: For parsing cookies in requests

### Client-Side Routes

1. **Authentication Routes:**
   * **GET** `/login`: Renders the login page.
   * **POST** `/login`: Handles user login.
   * **POST** `/logout`: Handles user logout.
   * **POST** `/add-author`: Handles user registration.
   * **GET** `/add-author`: Renders the page to add a new user.

2. **Article Management Routes:**
   * **GET** `/create/:articleId?`: Renders the page to create a new article. `:articleId?` allows an optional parameter for editing an existing article.
   * **POST** `/create`: Handles the creation of a new article.
   * **POST** `/update/:articleId`: Handles updating an existing article identified by `:articleId`.
   * **POST** `/action`: Handles actions on articles such as publishing, deleting, or taking off from publication.
   * **GET** `/home-page`: Renders the home page with user information and articles.
   * **POST** `/comment/:article_id`: Handles adding a comment to a specific article identified by `:article_id`.

3. **Profile Settings Route:**
   * **GET** `/settings`: Renders the profile settings page.
   * **POST** `/settings`: Handles updating user profile settings.


### Notes for Running the Application ###

- Ensure all dependencies are installed before running the app
- The application will be accessible at http://localhost:3000 after starting

If you encounter any issues during setup or execution, please contact the developer.
