export const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  AGENT: "agent",
});

export const roleHomePath = {
  [USER_ROLES.CUSTOMER]: "/customer",
  [USER_ROLES.AGENT]: "/agent",
};
