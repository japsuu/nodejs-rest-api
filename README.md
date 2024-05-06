# NodeJS REST API Example

## Required software

- git
- NodeJS

## Installation

1. Clone the repository:
   - **git clone https://github.com/japsuu/nodejs-rest-api nodejs_rest_api**
   - **cd nodejs_rest_api**
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   JWT_SECRET=your_secret_here
   ```
4. Run the server in development mode: `npm run dev`.

The server is now running on `http://localhost:3000`.

## Usage

### Login view

#### Registering a new user

In the web-ui, fill the form with your desired username, password, age and role, and click the "Register" button.
> Define the role as `admin` to create an admin user.

#### Logging in

Fill the login form with your username and password, and click the "Login" button.

### Notes view

Once logged in, you will be redirected to the notes view. Here you can create, edit and delete notes.

If you are logged in as an admin, you can also see a list of all users accounts and/or delete them.

You can log out by clicking the "Logout" button.