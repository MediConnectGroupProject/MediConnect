import passport from 'passport';
import {
  Strategy as JwtStrategy
} from 'passport-jwt';
import prisma from './connection.js';

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.mediconnect;
  }
  return token;
};

passport.use(
  new JwtStrategy({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // payload = { id, roles }
        const user = await prisma.user.findFirst({
          where: {
            id: payload.id,
            status: 'ACTIVE',
            isEmailVerified: true
          },
          include: {
            roles: {
              where: {
                status: 'ACTIVE'
              },
              include: {
                role: true
              },
            },
          },
        });

        if (!user) {
          return done(null, false);
        }

        // Check Token Version (Session Invalidation)
        if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
             return done(null, false);
        }

        // attach roles as array of strings
        const roles = user.roles.map(r => r.role.name);

        return done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles,
          currentRole: payload.currentRole || null
        });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;