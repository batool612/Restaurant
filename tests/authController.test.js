

const {signUp,login} = require('../controller/authController');

const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel'); // Mock the user model
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('signUp', () => {

        
        test('should return 400 if email already exists', async () => {
            userModel.findOne.mockResolvedValue({ email: 'test@example.com' }); // Mock user already exists

            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

    
            await signUp(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Email address already exists" });
        });
    

        test('should create a new user and return 200', async () => {
            userModel.findOne.mockResolvedValue(null); // Mock no existing user
            bcrypt.hash.mockResolvedValue('hashedPassword'); // Mock password hashing
            userModel.prototype.save = jest.fn().mockResolvedValue({
                name: 'Test',
                email: 'test@example.com',
                password: 'hashedPassword',

                role: 'user',
            });
    

            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

    
            await signUp(req, res);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User added" }));
        });
    
    
        test('should return 500 if an unexpected error occurs', async () => {
            userModel.findOne.mockImplementation(() => {
                throw new Error("Unexpected error");
            });
    
            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
    
            await signUp(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
        });

    });

    describe('login', () => {
        test('should return invalid credentials if email does not exist', async () => {
            userModel.findOne.mockResolvedValue(null); // Mock no user found

    

            const req = { body: { email: 'invalid@example.com', password: 'password' } };
            const res = {
                json: jest.fn(),
            };

    
            await login(req, res);
    
            expect(res.json).toHaveBeenCalledWith({ message: "invalid credintaial" });
        });
    

        test('should return invalid password for wrong password', async () => {
            userModel.findOne.mockResolvedValue({
                email: 'test@example.com',
                password: 'hashedPassword'
            });
            bcrypt.compare.mockResolvedValue(false); // Mock incorrect password

            const req = { body: { email: 'test@example.com', password: 'wrongPassword' } };
            const res = {
                json: jest.fn(),
            };

    
            await login(req, res);
    
            expect(res.json).toHaveBeenCalledWith({ message: "invalid password" });
        });
    
        test('should return invalid credentials for non-existent user with correct password', async () => {
            userModel.findOne.mockResolvedValue(null); // Mock no user found
    
            const req = { body: { email: 'nonexistent@example.com', password: 'password' } };
            const res = {
                json: jest.fn(),
            };
    
            await login(req, res);
    
            expect(res.json).toHaveBeenCalledWith({ message: "invalid credintaial" });
        });
    
        test('should return invalid credentials for non-existent user with incorrect password', async () => {
            userModel.findOne.mockResolvedValue(null); // Mock no user found
    
            const req = { body: { email: 'nonexistent@example.com', password: 'wrongPassword' } };
            const res = {
                json: jest.fn(),
            };
    
            await login(req, res);
    
            expect(res.json).toHaveBeenCalledWith({ message: "invalid credintaial" });
        });

        test('should return token and role for successful login', async () => {
            userModel.findOne.mockResolvedValue({
                _id: 'userId',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user'
            });
            bcrypt.compare.mockResolvedValue(true); // Mock correct password
            jwt.sign.mockReturnValue('mockToken'); // Mock token generation

            const req = { body: { email: 'test@example.com', password: 'password' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

    
            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "login is successfull",
                token: 'mockToken',
                role: 'user'
            }));
        });
    });

    
});

