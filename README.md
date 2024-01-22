
Node.js Blog with Express, Multer, and EJS
This is a simple blog built with Node.js using the Express framework, Multer for handling file uploads, and EJS as the templating engine.

Features
Express.js: A minimal and flexible Node.js web application framework that provides a robust set of features to develop web and mobile applications.

Multer: Middleware for handling multipart/form-data, primarily used for uploading files. In this blog, Multer is employed to handle image uploads for blog posts.

EJS (Embedded JavaScript): A simple templating engine that lets you generate HTML markup with plain JavaScript. It allows dynamic content rendering on the server side.

Installation
Clone this repository:

bash
Copy code
git clone https://github.com/Victor-Okenwa/myNodeBlog.git
Navigate to the project directory:

bash
Copy code
cd nodejs-express-blog
Install dependencies:

bash
Copy code
npm install
Create a .env file in the root directory and set the following variables:

env
Copy code
PORT=5000
Update the PORT variable with the desired port number.

Usage
Start the server:

bash
Copy code
npm start
Open your web browser and visit http://localhost:5000 (or the port you specified in the .env file).

Explore the blog, create new posts, and upload images.

File Structure
server.js: Main entry point for the application.

routes/: Contains route definitions for different parts of the application.

views/: EJS templates for rendering HTML views.

public/: Static files (e.g., stylesheets, client-side scripts).

public/profiles: Folder to store user profile uploaded images.

public/thumbnails: Folder to store user blog thumbnails.

controllers/: Handles the business logic for different routes.

Contributing
If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request.

License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as per the terms of the license.

Happy Hacking! 🚀