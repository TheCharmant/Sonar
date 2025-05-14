import { auth, db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate password reset link for Google users promoted to admin
export const generatePasswordResetLink = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user from Firebase Auth
    const userRecord = await auth.getUser(userId);
    
    // Check if user has a password provider
    const hasPasswordProvider = userRecord.providerData.some(
      provider => provider.providerId === 'password'
    );
    
    // If user already has a password provider, no need for reset link
    if (hasPasswordProvider) {
      return res.status(400).json({ 
        error: 'User already has a password set up',
        hasPassword: true 
      });
    }
    
    // Add actionCodeSettings for the password reset link
    const actionCodeSettings = {
      url: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5174/login',
      handleCodeInApp: true
    };
    
    // Generate password reset link with actionCodeSettings
    const resetLink = await auth.generatePasswordResetLink(userRecord.email, actionCodeSettings);
    
    // Send email with reset link if requested
    const { sendEmail } = req.query;
    if (sendEmail === 'true') {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: userRecord.email,
          subject: 'Sonar Admin Dashboard - Password Setup',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2c3e50; margin-bottom: 5px;">Sonar</h1>
                <p style="color: #7f8c8d; font-size: 16px;">Email Management Dashboard</p>
              </div>
              
              <div style="border-top: 3px solid #3498db; margin-bottom: 20px;"></div>
              
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Admin Access Password Setup</h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
                You have been granted admin access to the Sonar Email Management Dashboard. Please use the button below to set up your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Set Up Password</a>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              
              <p style="word-break: break-all; color: #7f8c8d; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 14px;">
                ${resetLink}
              </p>
              
              <div style="margin: 30px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db; color: #34495e;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>Important:</strong> This link will expire in 24 hours.
                </p>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
                If you did not request admin access to Sonar, please ignore this email or contact support.
              </p>
              
              <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px; text-align: center; color: #7f8c8d; font-size: 14px;">
                <p>&copy; ${new Date().getFullYear()} Sonar Email Management. All rights reserved.</p>
              </div>
            </div>
          `
        });
        
        // Create audit log for email sent
        await createAuditLog({
          type: AuditLogTypes.USER_MGMT,
          action: AuditLogActions.PASSWORD_RESET_EMAIL_SENT,
          performedBy: req.user?.uid || 'system',
          details: {
            userId: userId,
            userEmail: userRecord.email
          }
        });
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Continue with the response even if email fails
      }
    }
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.PASSWORD_RESET_LINK_GENERATED,
      performedBy: req.user?.uid || 'system',
      details: {
        userId: userId,
        userEmail: userRecord.email
      }
    });
    
    res.status(200).json({ 
      resetLink: resetLink,
      userEmail: userRecord.email,
      emailSent: sendEmail === 'true'
    });
  } catch (error) {
    console.error('Error generating password reset link:', error);
    res.status(500).json({ error: `Failed to generate password reset link: ${error.message}` });
  }
};




