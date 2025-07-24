import passport, { use } from "passport";
import { Strategy as googleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as localStrategy } from "passport-local";
import bcryptjs from "bcryptjs"

passport.use(
    new localStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, {message: "User does not exit"})
            }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => 
                providerObjects.provider === "google")

            if(isGoogleAuthenticated && !isUserExist.password){
                return done(null, false, {message:"You have authenticated through google."})
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatched) {
                return done(null, false, {message: "Password does not match"})
            }

            return done(null, isUserExist)

        } catch (error) {
            done(error)
        }
    })
)

passport.use(
    new googleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value

                if (!email) {
                    return done(null, false, { message: "Email not found" })
                }

                let user = await User.findOne({ email })

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }
                return done(null, user)
            } catch (error) {
                console.log("Google strategy error", error)
                return done(error)
            }
        }
    )
)
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = User.findById(id);
        done(null, user)
    } catch (error) {
        done(error)
    }
})