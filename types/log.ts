export interface LogEntry {
  id: string
  eventType: string
  updatedBy: string
  LogAt: string
  oldUrl?: string
  newUrl?: string
}

export interface LinkDetails {
  id: string
  shortCode: string
  createdAt: string
  updatedAt: string
}

export interface GetLogsResponse {
  success: boolean
  message: string
  linkDetails: LinkDetails
  data: LogEntry[]
}
