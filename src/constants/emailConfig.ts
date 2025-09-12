/**
 * EmailJS Configuration
 * Centralized configuration for email service integration
 * 
 * @description This file contains all EmailJS-related configuration
 * making it easier to manage, update, and potentially switch to environment variables
 */

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  recipientEmail: string;
  recipientName: string;
}

/**
 * Default EmailJS configuration
 * 
 * @note In production environments, consider moving these values to environment variables:
 * - VITE_EMAILJS_SERVICE_ID
 * - VITE_EMAILJS_TEMPLATE_ID  
 * - VITE_EMAILJS_PUBLIC_KEY
 * - VITE_RECIPIENT_EMAIL
 */
export const EMAIL_CONFIG: EmailConfig = {
  serviceId: "service_ea205oa",
  templateId: "template_o2y5538", 
  publicKey: "i2duMx6NvyyeZvrwf",
  recipientEmail: "contato@jorgemolina.dev",
  recipientName: "Jorge"
} as const;

/**
 * Email template parameter mapping
 * Defines the structure expected by the EmailJS template
 */
export interface EmailTemplateParams {
  from_name: string;
  to_name: string;
  from_email: string;
  to_email: string;
  message: string;
}

/**
 * Creates EmailJS template parameters from form data
 * 
 * @param formData - Form data from contact form
 * @returns Formatted parameters for EmailJS template
 */
export const createEmailTemplateParams = (formData: {
  name: string;
  email: string; 
  message: string;
}): Record<string, string> => ({
  from_name: formData.name,
  to_name: EMAIL_CONFIG.recipientName,
  from_email: formData.email,
  to_email: EMAIL_CONFIG.recipientEmail,
  message: formData.message
});