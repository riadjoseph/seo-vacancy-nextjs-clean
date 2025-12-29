// Type definitions for indexing operations

export type IndexingNotificationType = 'URL_UPDATED' | 'URL_DELETED'

export interface GoogleIndexingResult {
  success: boolean
  url: string
  type: IndexingNotificationType
  error?: string
}

export interface IndexNowConfig {
  key: string
  host: string
}

export interface IndexNowResult {
  success: boolean
  submitted: number
  error?: string
}

export interface GoogleServiceAccount {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}
