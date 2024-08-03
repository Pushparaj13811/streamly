# Streamly

## Description
Streamly is a backend system for a video streaming and hosting site, similar to YouTube. It handles video uploading, storage, streaming, user authentication, and video management.

## Features
- **User Authentication**: Users can create accounts, log in, and manage their profiles.
- **Google Authentication**: Integrated with Google OAuth for secure authentication.
- **Video Uploading**: Users can upload videos to the platform.
- **Video Storage**: Secure and scalable storage for uploaded videos.
- **Video Streaming**: Seamless video streaming capabilities.
- **Video Management**: Admins can manage videos, including editing, deleting, and categorizing them.
- **Search Functionality**: Search for videos based on keywords, categories, or other criteria.
- **User Interaction**: Like, comment on, and share videos.
- **Analytics**: Provides analytics on video views, user engagement, and other metrics.

## Technologies Used
- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cloud Storage**: Cloudinary
- **Authentication**: JSON Web Tokens (JWT) with bcrypt, Google OAuth
- **Video Streaming**: fluent-ffmpeg
- **Other Dependencies**: Axios, Cookie-parser, CORS, dotenv, http-status-code, http-status-codes, multer, Prettier, Nodemon
- **Passport Strategies**: `passport`, `passport-google-oauth`, `passport-google-oauth20`

## Installation
1. Clone the repository: `git clone https://github.com/Pushparaj13811/streamly/`
2. Install dependencies: `npm install`
3. Configure environment variables: Create a `.env` file and set the required variables.
4. Start the server: `npm run dev`

## Scripts
- **dev**: Runs the server with `nodemon` and environment variable support. Uses experimental JSON modules. Command: `npm run dev`

## Usage
1. Register an account or log in to an existing account.
2. Use Google authentication to sign in securely.
3. Upload videos to the platform.
4. Explore and watch videos uploaded by other users.
5. Interact with videos by liking, commenting, and sharing.
6. Admins can manage videos through the admin panel.

## Contributing
Contributions are welcome! Please follow the guidelines outlined in the [CONTRIBUTING.md](./contributing.md) file.

## License
This project is licensed under the ISC License. See the [LICENSE](./LICENSE) file for details.

## Contact
For any inquiries or support, please contact [pushparajmehta002@gmail.com](mailto:pushparajmehta002@gmail.com).
