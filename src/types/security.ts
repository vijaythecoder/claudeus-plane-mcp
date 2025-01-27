export interface SecurityConfig {
  requireExplicitConsent: boolean;
  auditEnabled: boolean;
  privacyControls: {
    maskSensitiveData: boolean;
    allowExternalDataSharing: boolean;
  };
}

export interface SecurityAuditLog {
  timestamp: string;
  action: string;
  resource: string;
  user: string;
  success: boolean;
  details?: Record<string, unknown>;
} 