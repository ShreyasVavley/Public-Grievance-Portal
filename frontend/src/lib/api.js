// Central API base URL — set NEXT_PUBLIC_API_URL in .env.local for mobile testing
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default API_BASE;
