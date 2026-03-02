/**
 * Centralized API configuration
 * All API endpoints are built from the base URL defined in environment variables
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://propai-api.hirenq.com";

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // Auth endpoints
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    forgotPassword: `${API_BASE_URL}/api/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/reset-password`,

    // Proposals endpoints
    proposals: `${API_BASE_URL}/api/proposals`,
    proposalsDetails: `${API_BASE_URL}/api/proposals/details`,
    publicProposal: `${API_BASE_URL}/api/public/proposal`,

    // Clients endpoints
    clients: `${API_BASE_URL}/api/clients`,

    // Users endpoints
    users: `${API_BASE_URL}/api/users`,

    // Settings endpoints
    settings: `${API_BASE_URL}/api/settings`,

    // Variables endpoints
    variables: `${API_BASE_URL}/api/variables`,

    // Signatures endpoints
    signatures: `${API_BASE_URL}/api/signatures`,

    // System templates endpoints
    systemTemplates: `${API_BASE_URL}/api/system-templates`,
    clientTemplates: `${API_BASE_URL}/api/client-templates`,

    // Package endpoints
    packages: `${API_BASE_URL}/api/packages`,

    // Media endpoints
    media: `${API_BASE_URL}/api/media`,

    // Subscriber users endpoints
    subscriberUsers: `${API_BASE_URL}/api/subscriber-users`,

    // AI Generation endpoints
    aiGeneration: `${API_BASE_URL}/api/ai-generation`,

    // Analytics endpoints
    analytics: `${API_BASE_URL}/api/analytics`,

    // PPT endpoints
    generatePPT: `${API_BASE_URL}/api/proposal`,
    previewPPT: `${API_BASE_URL}/api/proposals/details-ppt`,
    pptStyles: `${API_BASE_URL}/api/ppt/styles`,
  },
};

export default apiConfig;
