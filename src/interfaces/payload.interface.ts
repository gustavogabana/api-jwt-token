/**
 * Payload interface for JWT token claims
 * 
 * Represents the data encoded in the JWT token body
 * 
 * Properties:
 * - sub: Subject (user ID) - identifies the token's recipient
 * - role: User's authorization role
 * - name: User's display name
 */
export interface Payload {
    sub: string;
    role: string;
    name: string;
}
