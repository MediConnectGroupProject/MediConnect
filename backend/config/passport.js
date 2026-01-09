import passport from 'passport';
import {
    Strategy as JwtStrategy
} from 'passport-jwt';
import prisma from './connection.js';

const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.mediconnect;
    }
    return null;
};

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: payload.id
                }
            });

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport;