# WTWR (What to Wear?): Back End

The back-end project is focused on creating a server for the WTWR application. You’ll gain a deeper understanding of how to work with databases, set up security and testing, and deploy web applications on a remote machine. The eventual goal is to create a server with an API and user authorization.

## Technologies

- Node JS
- Express JS
- MongoDB
- MongoDB Compass
- Mongoose
- Postman
- Validation
- JSON
- Git

## Express JS

Express.js is responsible for creating the sever, creating routes,
listening for http requests, & then routing those requests appropriately.

## Database & Mapper

MongoDB is used as our NoSQL database. In this app Mongoose is used to define the shape of the
documents that get stored in MongoDB via Mongoose.Schema(). Models in Mongoose are used to
create, cast, store, delete, & query data.

## Validation

Validator.js is used to verify that certain properties in the schemas,
avatar & imageUrl, are valid URLs.

## Hot Reload

SE Project Express uses nodemon to enable hot reloading, or the ability for the server
to refresh itself whenever source code is changed.

## Running the Project

`npm run start` — to launch the server

`npm run dev` — to launch the server with the hot reload feature

### Testing

Before committing your code, make sure you edit the file `sprint.txt` in the root folder. The file `sprint.txt` should contain the number of the sprint you're currently working on. For ex. 12

# GitHub Page

- [Link to the Github Page](https://mirkozlatunic.github.io/se_project_express/)

**Created By [Mirko Zlatunic](https://github.com/mirkozlatunic)**
