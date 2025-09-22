export interface EmailLog {
  status: string;
  student?: {
    name: string;
    email: string;
    course: string;
    year: string;
  };
  guest?: {
    name: string;
    email: string;
    organization: string;
    designation: string;
  };
  professor?: {
    name: string;
    email: string;
    college: string;
    department: string;
  };
}

export interface SmsLog {
  status: string;
  student?: {
    name: string;
    phone: string;
    course: string;
    year: string;
  };
  guest?: {
    name: string;
    phone: string;
    organization: string;
    designation: string;
  };
  professor?: {
    name: string;
    phone: string;
    college: string;
    department: string;
  };
}

export interface WhatsappLog {
  status: string;
  student?: {
    name: string;
    phone: string;
    course: string;
    year: string;
  };
  guest?: {
    name: string;
    phone: string;
    organization: string;
    designation: string;
  };
  professor?: {
    name: string;
    phone: string;
    college: string;
    department: string;
  };
}

export interface Invitation {
  id: string;
  emailLogs: EmailLog[];
  smsLogs: SmsLog[];
  whatsappLogs: WhatsappLog[];
  createdAt: Date;
}

