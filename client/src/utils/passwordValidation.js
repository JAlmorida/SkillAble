export function getPasswordRequirements(password) {
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noTripleRepeat: !/(.)\1\1/.test(password),
  };
  // At least 3 of the 4 character types
  const types = [requirements.lowercase, requirements.uppercase, requirements.number, requirements.special];
  requirements.atLeastThreeTypes = types.filter(Boolean).length >= 3;
  return requirements;
}
