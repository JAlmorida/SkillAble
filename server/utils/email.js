import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendPasswordResetEmail = async ( to, resetUrl ) => {
    await sgMail.send({
        to, 
        from: 'skillableorg@gmail.com', 
        subject: "Password Reset", 
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });
}

export const sendEmailConfirmation = async ( to, confirmationCode ) => {
    await sgMail.send({
        to, 
        from: 'skillableorg@gmail.com', 
        subject: "Email Confirmation", 
        html: `<p>Your confirmation code is: <b>${confirmationCode}</b></p>`,
    })
}

export const sendApprovalEmail = async (to, userName) => {
    await sgMail.send({
        to,
        from: 'skillableorg@gmail.com',
        subject: "Account Approved - Welcome to SkillAble!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3b82f6; margin: 0; font-size: 28px; font-weight: bold;">
                        Skill<span style="color: #1d4ed8;">Able</span>
                    </h1>
                </div>
                
                <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">
                        🎉 Your Account Has Been Approved!
                    </h2>
                    <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
                        Hello <strong>${userName}</strong>,
                    </p>
                    <p style="color: #374151; margin: 0; line-height: 1.6;">
                        Great news! Your SkillAble account has been approved by our admin team. You can now access all features of our learning platform.
                    </p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px;">
                        What you can do now:
                    </h3>
                    <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
                        <li>Explore our course catalog</li>
                        <li>Enroll in courses that interest you</li>
                        <li>Start your learning journey</li>
                        <li>Connect with other learners</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-bottom: 25px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                       style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Get Started Now
                    </a>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        If you have any questions, feel free to contact our support team.
                    </p>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                        Happy Learning!<br>
                        The SkillAble Team
                    </p>
                </div>
            </div>
        `
    })
}
