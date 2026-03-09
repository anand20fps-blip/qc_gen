export type IssueSeverity = 'high' | 'medium' | 'low';

export interface QCIssue {
  type: string;
  page: number;
  description: string;
  severity: IssueSeverity;
}

export interface QCResult {
  filename: string;
  total_pages: number;
  issues_found: number;
  issues: QCIssue[];
}
