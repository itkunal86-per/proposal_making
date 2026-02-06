/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: { email: string };
}

export type ISODate = string; // YYYY-MM-DD

export interface AnalyticsQuery {
  start: ISODate;
  end: ISODate;
}

export interface SeriesPoint {
  date: ISODate;
  revenue: number;
}

export interface AnalyticsResponse {
  totals: {
    proposals: number;
    accepted: number;
    declined: number;
    activeClients: number;
    aiTokens: number;
    revenue: number;
  };
  series: SeriesPoint[];
}

// Proposal JSON - Simplified content structure
export interface ProposalTextContent {
  id: string;
  type: "heading" | "paragraph" | "listItem";
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  content: string;
}

export interface ProposalImageContent {
  id: string;
  url: string;
}

export interface ProposalSignatureField {
  id: string;
  recipientId: string;
  width: number;
  height: number;
  status: "pending" | "signed" | "declined";
}

export interface ProposalSection {
  id: string | number;
  title: string;
  layout: "single" | "two-column" | "three-column";
  texts?: ProposalTextContent[];
  images?: ProposalImageContent[];
  signatureFields?: ProposalSignatureField[];
}

export interface ProposalPricing {
  currency: string;
  taxRate: number;
  items: any[];
}

export interface ProposalJsonData {
  id: string;
  title: string;
  themeId: string;
  client: string;
  client_id: string;
  status: "draft" | "published" | "sent" | "accepted" | "declined";
  createdBy: string;
  sections: ProposalSection[];
  pricing?: ProposalPricing;
}

// Theme JSON - Design system
export interface ThemeFonts {
  primary: string;
  icon?: string;
}

export interface ThemeColors {
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  backgroundPrimary: string;
  backgroundDark: string;
  accent: string;
  border: string;
}

export interface HeadingStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  textTransform?: string;
  color: string;
  marginBottom: number;
}

export interface ParagraphStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color: string;
}

export interface ListItemStyle {
  fontSize: number;
  fontWeight: number;
  gap: number;
  iconColor: string;
  textTransform?: string;
}

export interface ThemeTypography {
  heading: {
    [key in "h1" | "h2" | "h3" | "h4" | "h5" | "h6"]?: HeadingStyle;
  };
  paragraph: ParagraphStyle;
  listItem?: ListItemStyle;
}

export interface BoxModel {
  defaultPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  borderRadius: number;
  borderWidth: number;
}

export interface LayoutConfig {
  sectionGap: number;
  columnGutter: number;
  maxWidth: number;
}

export interface ComponentStyles {
  textBlock?: {
    backgroundColor: string;
    borderColor: string;
  };
  darkPanel?: {
    backgroundColor: string;
    textColor: string;
  };
  featureList?: {
    icon: string;
    iconColor: string;
  };
}

export interface ThemeJsonData {
  themeId: string;
  name: string;
  fonts: ThemeFonts;
  colors: ThemeColors;
  typography: ThemeTypography;
  boxModel: BoxModel;
  layout: LayoutConfig;
  components: ComponentStyles;
}
