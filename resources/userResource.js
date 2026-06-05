const userResource = (data) => {
  const user = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    profileImage: data.profileImage,
  };
  return user;
};

const userResourceArray = (data) => {
  const users = data.map((user) => {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
    };
  });
  return users;
};

module.exports = {
  userResource,
  userResourceArray,
};
