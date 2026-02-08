import type { Payload } from '@/interfaces/payload.interface.ts';
import type { User } from '@/interfaces/user.interface.ts';
import '@fastify/jwt';

/**
 * Extends Fastify instance with custom authenticate method
 */
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    };
};

/**
 * Extends @fastify/jwt module to include custom payload and user types
 */
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: Payload;
        user: User;
    };
};
