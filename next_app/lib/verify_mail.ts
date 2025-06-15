import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'pinkylohc@gmail.com',
      pass: 'yyhi lsxo umpe oavf',
    },
  });
  
  export const sendVerificationEmail = async (
    email: string, 
    token: string
  ) => {

    const confirmLink = `https://fyp-host.vercel.app/auth/new-verification?token=${token}`; 
    //const confirmLink = `https://fyp-llm.vercel.app/auth/new-verification?token=${token}`; 
    const mailOptions = {
      from: 'pinkylohc@gmail.com',
      to: email,
      subject: "Confirm your email address",
      html:`<p>Click <a href="${confirmLink}">here</a> to confirm your email address</p>`
    };
  
    try {

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  

  export const sendResetEmail = async (
    email: string, 
    token: string
  ) => {

    const confirmLink = `https://fyp-host.vercel.app/auth/new-password?token=${token}`; 
    //const confirmLink = `https://fyp-llm.vercel.app/auth/new-password?token=${token}`; 
    const mailOptions = {
      from: 'pinkylohc@gmail.com',
      to: email,
      subject: "Reset your password",
      html:`<p>Click <a href="${confirmLink}">here</a> to reset your password</p>`
    };
  
    try {

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
   
