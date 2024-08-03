import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use environment variable
            scope: ["profile", "email"],
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const {
                    id: googleId,
                    displayName: fullName,
                    emails,
                    photos,
                } = profile;
                const email = emails[0].value;
                const avatar = photos[0].value;
                const username = email.split("@")[0];

                let user = await User.findOne({ googleId });
                let userByEmail = await User.findOne({ email });
                let userByUsername = await User.findOne({ username });

                if (!(user || userByEmail || userByUsername)) {
                    user = await User.create({
                        googleId,
                        username,
                        fullName,
                        email,
                        avatar,
                        refreshToken,
                        // No password for Google users
                    });
                }

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;
