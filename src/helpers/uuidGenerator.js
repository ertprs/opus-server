// Function to create unique values for a UUID
let uid = "";
let values = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const getUuid = () => {
  uid = "";
  for (let i = 0; i < 10; i++) {
    let x;
    if (i === 0) {
      x = getRandomInt(1, values.length - 10);
    } else {
      x = getRandomInt(1, values.length);
    }
    uid = uid + values[x];
  }

  return uid;
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = {
  getUuid,
};
