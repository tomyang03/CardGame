const signIn = (name, password) => {
  console.log("signIn");
  sessionStorage.setItem("name", name);

  sessionStorage.setItem("password", password);
  sessionStorage.setItem("isAuthenticated", true);
};

const getAuth = () => {
  return {
    name: sessionStorage.getItem("name"),
    password: sessionStorage.getItem("password"),
    // sessionStorage.getItem("isAuthenticated") returns  a string ie "true", so we have to manually set it to true or false
    isAuthenticated:
      sessionStorage.getItem("isAuthenticated") == "true" ? true : false,
  };
};

const signOut = () => {
  alert("sign out");
  sessionStorage.setItem("name", "");
  sessionStorage.setItem("password", "");
  sessionStorage.setItem("isAuthenticated", false);
};

export { signIn, signOut, getAuth };
