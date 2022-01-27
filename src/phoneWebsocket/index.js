class PhoneWebsocket {
  wsInstance = null;
  url = "";

  init(url) {
    this.url = url;
  }

  test() {
    console.log(this.url);
  }
}

export default PhoneWebsocket;
