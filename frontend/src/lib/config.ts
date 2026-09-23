/**
 * Configurações de endpoints e origens externas do Frontend
 * Suporta override via variáveis de ambiente (.env.local) mantendo fallbacks padrão de desenvolvimento.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export const MINI_SITES_ORIGIN = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN || 'http://127.0.0.1:8000';
