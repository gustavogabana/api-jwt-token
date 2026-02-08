import { authMiddleware } from '@/middlewares/auth.middleware.ts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * User type definition for the login response
 */
type User = {
    id: string;
    name: string;
    role: string;
};

/**
 * In-memory store for refresh tokens
 * In production, this should be stored in a database with user associations
 */
const refreshTokens = new Map<string, string>();

/**
 * Authentication routes handler
 * 
 * Registers the following routes:
 * - POST /login - Generate access and refresh tokens
 * - POST /refresh - Refresh expired access tokens
 * - GET /me - Get current authenticated user (protected)
 * 
 * @param app - Fastify instance
 */
export async function authRoutes(app: FastifyInstance) {
    /**
     * POST /login
     * Generates and returns access token (10m) and refresh token (7d)
     */
    app.post('/login', async (_, reply: FastifyReply) => {
        const user: User = {
            id: '1',
            name: 'John Doe',
            role: 'admin'
        };

        // Generate access token with 10-minute expiration
        const accessToken = app.jwt.sign(
            { sub: user.id, name: user.name, role: user.role }, 
            { expiresIn: '10m' }
        );

        // Generate refresh token with 7-day expiration
        const refreshToken = app.jwt.sign(
            { sub: user.id, name: '', role: '' },
            { expiresIn: '7d' }
        );

        // Store refresh token in memory for validation
        refreshTokens.set(refreshToken, user.id);
        
        return reply.send({ accessToken, refreshToken });
    });

    /**
     * POST /refresh
     * Issues a new access token using a valid refresh token
     */
    app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        const { refreshToken } = request.body as { refreshToken: string };
        
        // Validate refresh token exists in storage
        if (!refreshToken || !refreshTokens.has(refreshToken)) {
            return reply.status(401).send({ message: 'Invalid refresh token' });
        }

        try {
            // Verify refresh token signature and expiration
            const decoded = app.jwt.verify<{ sub: string }>(refreshToken);
            
            // Generate new access token with user's original ID
            const newAccessToken = app.jwt.sign(
                { sub: decoded.sub, name: 'John Doe', role: 'admin' }, 
                { expiresIn: '10m' }
            );

            return reply.send({ accessToken: newAccessToken });
        } catch (err) {
            // Return 401 if token verification fails
            return reply.status(401).send({ message: 'Invalid refresh token' });
        }
    });

    /**
     * GET /me
     * Returns current authenticated user information
     * Protected route - requires valid access token
     */
    app.get('/me', { preHandler: [authMiddleware] }, async (request: FastifyRequest) => {
        return { 
            message: "Access granted to protected route",
            user: request.user 
        };
    });
}
