const checkLengthPass = (pass) => {
  return pass.length < 8;
};

const checkPassConfirm = (pass, confirm) => {
  return pass !== confirm;
};

export { checkLengthPass, checkPassConfirm };
