module.exports = {
  async subMobileNumber(mobile) {
    const subStringMobile =
      mobile.length == 11
        ? mobile.substring(2, 11)
        : mobile.length == 10
        ? mobile.substring(1, 10)
        : mobile.length == 12
        ? mobile.substring(3, 12)
        : mobile;
    return subStringMobile;
  }, 
};
