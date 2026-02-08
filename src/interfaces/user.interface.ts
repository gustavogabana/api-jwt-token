/**
 * User interface for authenticated requests
 * 
 * Properties:
 * - sub: Subject (user ID) from JWT token
 * - role: User's role for authorization (e.g., 'admin', 'user')
 * - name: User's display name
 */
export interface User {
    sub: string;
    role: string;
    name: string;
}
