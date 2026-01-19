import bcrypt from 'bcryptjs';
import prisma from '../config/connection.js';
import generateAuthToken from '../utils/authToken.js';
import crypto from 'crypto';

import sendEmail from '../utils/sendEmails.js';
import {
    verificationEmail
} from '../utils/emailVerifyTemplate.js';
import {
    getPrimaryRole
} from '../utils/getPrimaryRole.js';

// User registration
const register = async (req, res) => {

    const {
        firstName,
        lastName,
        phone,
        email,
        password
    } = req.body;


    // Check if user already exists
    const userExists = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (userExists) {

        return res.status(400).json({
            message: 'User already exists'
        });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate verfication token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');

    // Create a new user
    const newUser = await prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationToken: hashedVerifyToken,
            emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),

            roles: {
                create: {
                    role: {
                        connect: {
                            name: 'PATIENT'
                        }
                    }
                }
            }
        }
    });

    // send verification email here ....
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    await sendEmail({
        to: email,
        subject: 'Verify your email',
        html: verificationEmail(verifyUrl)
    });


    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            email: newUser.email
        }
    });

};

// User login
const login = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // check user exists by email
    const user = await prisma.user.findFirst({
        where: {
            email: email,
            status: 'ACTIVE',
        },
        include: {
            roles: {
                where: {
                    status: 'ACTIVE'
                },
                include: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        return res.status(401).json({

            message: 'Invalid credentials'
        });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

        return res.status(400).json({

            message: 'Invalid credentials'
        });
    }

    // Check if email is verified
    console.log('Login Debug:', { email: user.email, isVerified: user.isEmailVerified, passMatch: isMatch });
    if (!user.isEmailVerified) {

        return res.status(403).json({
            message: 'Please verify your email before logging in'
        });
    }

    // Generate auth token
    const roleNames = user.roles.map(r => r.role.name);
    const primaryRole = getPrimaryRole(roleNames);

    const tokenData = {
        id: user.id,
        role: roleNames, // token uses flattened roles usually
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    };
    const token = generateAuthToken(tokenData, res);

    return res.status(200).json({

        message: 'User logged in successfully',
        user: {
            id: user.id,
            email: user.email,
            roles: roleNames,
            firstName: user.firstName,
            lastName: user.lastName,
            primaryRole: primaryRole
        }
    });
};

// User logout
const logout = async (req, res) => {

    res.cookie('mediconnect', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: new Date(0)
    });

    return res.status(200).json({

        message: 'User logged out successfully'
    });
};

const verifyEmail = async (req, res) => {

    const {
        token
    } = req.query;

    if (!token) {

        return res.status(400).json({
            message: 'Invalid or missing token'
        });
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        return res.status(400).json({
            message: 'Invalid or expired token'
        });
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null
        }
    });

    return res.status(200).json({

        message: 'Email verified successfully'
    });
};

const getMe = async (req, res) => {
    // passport already verified JWT
    return res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            roles: req.user.roles,
            name: req.user.firstName + ' ' + req.user.lastName,
            primaryRole: getPrimaryRole(req.user.roles),
        },
    });
};

export {
    login,
    register,
    logout,
    verifyEmail,
    getMe,
};