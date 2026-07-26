declare const sendResetPasswordEmail: (to: string, resetUrl: string) => Promise<void>;

export { sendResetPasswordEmail };
