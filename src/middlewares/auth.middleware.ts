import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Authentication middleware that verifies JWT tokens on protected routes
 * 
 * @param request - Fastify request object containing the JWT token
 * @param reply - Fastify reply object for sending responses
 * 
 * Validates the JWT token signature and expiration.
 * Returns 401 Unauthorized if token is invalid or expired.
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token using the public key from Fastify JWT plugin
    await request.jwtVerify();
  } catch (err) {
    // Return 401 Unauthorized if token verification fails
    reply.status(401).send({ message: 'Unauthorized' });
  }
}
