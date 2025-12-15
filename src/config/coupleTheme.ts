// 💕 Couple Theme Configuration
// This file contains the emails of the special couple who get a pink theme!
//
// ⚠️ IMPORTANT: Replace the placeholder emails below with your actual emails!

export const COUPLE_EMAILS = {
  // 👨 Add YOUR email here (the one you use to login)
  partner1: "manasc2009@gmail.com",

  // 👩 Add your GIRLFRIEND'S email here (the one she will use to login)
  partner2: "priyamprasad28@gmail.com",
};
/**
 * Check if the current chat is between the special couple
 * @param loggedInUserEmail - Email of the currently logged in user
 * @param chatPartnerEmail - Email of the user they're chatting with
 * @returns true if this is the couple's exclusive chat
 */
export const isCoupleChat = (
  loggedInUserEmail: string | undefined,
  chatPartnerEmail: string | undefined
): boolean => {
  if (!loggedInUserEmail || !chatPartnerEmail) return false;

  const coupleEmails = [
    COUPLE_EMAILS.partner1.toLowerCase(),
    COUPLE_EMAILS.partner2.toLowerCase(),
  ];

  const loggedInLower = loggedInUserEmail.toLowerCase();
  const partnerLower = chatPartnerEmail.toLowerCase();

  // Both users must be in the couple emails list
  return (
    coupleEmails.includes(loggedInLower) && coupleEmails.includes(partnerLower)
  );
};
