export interface UserOut {
  id: string
  email: string
  full_name: string
  avatar_url?: string | null
  dark_mode: boolean
}

export interface Company {
  id: string
  name: string
  industry: string
  logo_url?: string | null
  website?: string | null
  collected_data: string[]
  retention_period_months: number
  third_party_sharing: boolean
  risk_score: number
  breach_status: 'none' | 'past' | 'active'
  created_at: string
  updated_at: string
}

export interface PrivacyPolicy {
  id: string
  company_id: string
  source_url?: string | null
  ai_summary?: string | null
  collected_data_summary: string[]
  retention_summary?: string | null
  third_party_sharing_summary?: string | null
  user_rights_summary: string[]
  risk_level: 'low' | 'medium' | 'high'
  last_analyzed_at: string
}

export interface RiskAssessment {
  id: string
  company_id: string
  score: number
  breach_factor: number
  retention_factor: number
  transparency_factor: number
  sharing_factor: number
  recommendations: string[]
  assessed_at: string
}

export interface BreachRecord {
  id: string
  company_id: string
  breach_date: string
  compromised_data: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  resolved: boolean
  user_notified: boolean
}

export interface DeletionRequest {
  id: string
  company_id: string
  jurisdiction: 'GDPR' | 'DPDP' | 'CCPA'
  status: 'sent' | 'awaiting' | 'resolved' | 'escalated'
  deadline: string
  pdf_path?: string | null
  sent_at: string
  resolved_at?: string | null
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface DashboardOverview {
  companies_tracking: number
  average_risk_score: number
  recent_breaches: number
  pending_requests: number
  privacy_health_score: number
  resolved_requests: number
}
