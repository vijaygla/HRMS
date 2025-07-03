import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HRMS System" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name, tempPassword) => ({
    subject: 'Welcome to HRMS - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to HRMS!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been created successfully. Here are your login details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p style="color: #dc2626; font-size: 14px;">Please change your password after first login.</p>
        </div>
        <p>You can access the system at: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
        <p>Best regards,<br>HRMS Team</p>
      </div>
    `
  }),

  leaveApproval: (employeeName, leaveType, status, startDate, endDate) => ({
    subject: `Leave Request ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'approved' ? '#10b981' : '#dc2626'};">Leave Request ${status}</h2>
        <p>Dear ${employeeName},</p>
        <p>Your ${leaveType} request has been <strong>${status}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>
        <p>Best regards,<br>HRMS Team</p>
      </div>
    `
  }),

  payrollGenerated: (employeeName, month, year, netPay) => ({
    subject: `Payroll Generated - ${month}/${year}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payroll Generated</h2>
        <p>Dear ${employeeName},</p>
        <p>Your payroll for ${month}/${year} has been processed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Net Pay:</strong> $${netPay}</p>
          <p><strong>Period:</strong> ${month}/${year}</p>
        </div>
        <p>You can view your detailed payslip in the HRMS portal.</p>
        <p>Best regards,<br>HRMS Team</p>
      </div>
    `
  })
};