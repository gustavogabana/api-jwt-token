import fastifyJwt from '@fastify/jwt';
import Fastify, { type FastifyInstance } from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import { authRoutes } from './routes/auth.route.ts';

/**
 * Get the directory name in ES modules context
 * Required for path operations in Node.js ES modules
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initialize Fastify instance with logging enabled
 */
const app: FastifyInstance = Fastify({
  logger: true
});

/**
 * Register Fastify JWT plugin with RSA256 algorithm
 * 
 * Configuration:
 * - Algorithm: RS256 (RSA with SHA-256)
 * - Public key: Used to verify token signatures
 * - Private key: Used to sign new tokens
 */
app.register(fastifyJwt, {
    secret: {
        private: fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8'),
        public: fs.readFileSync(path.join(__dirname, 'keys/public.pem'), 'utf8'),
    },
    sign: {
        algorithm: 'RS256'
    }
});

/**
 * Register authentication routes
 * Includes: /login, /refresh, and /me endpoints
 */
app.register(authRoutes);

/**
 * Start the server
 * Listens on http://localhost:3000
 */
const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
