var access_token = "";
var DB_URL = "?characterEncoding=UTF-8";
var DB_USER = "";
var DB_PSWD = "";

function sendMessage(to, msg) {
  var url = "https://api.vk.com/method/messages.send?user_id=" + to + "&message=" + msg + "&access_token="+access_token;
  var response = doURL(url);
  return response;
}

function doGet() {
  return HtmlService.createHtmlOutput(checkNewYear());
}

function getConnection() {
  return Jdbc.getConnection(DB_URL, DB_USER, DB_PSWD);
}

function fetchAllFriends() {
  var url = "https://api.vk.com/method/friends.get?fields=name&access_token="+access_token;
  var response = doURL(url);
  return response;
}

function parseFriends(response) {
  return JSON.parse(response).response;
}

function doURL(url) {
  var response = UrlFetchApp.fetch(url);
  return response.getContentText();
}

function saveFriends(f) {
  var con = getConnection();
  var st = con.prepareStatement('INSERT INTO friend (id, first_name, last_name) values (?, ?, ?)');
  for (i = 0; i < f.length; i++) {
    st.setInt(1, f[i].uid);
    st.setString(2, f[i].first_name);
    st.setString(3, f[i].last_name);
    st.addBatch();
  }
  var batch = st.executeBatch();
  con.close();
}

function startMessaging() {
  var names = '';
  var rs = getConnection().createStatement().executeQuery("select * from friend where sended != true limit 5;");
  while (rs.next()){
    var name = rs.getString('first_name');
    var uid = rs.getInt('id');
    sendMessage(uid, name + ', с Новым годом!');
    names = names + ' ' + name;
    getConnection().createStatement().execute('update friend set sended = 1 where id = ' + uid);
  }
  return names;
}

function checkNewYear() {
  var r;
  var d = new Date();
  if (d.getMonth() == 0) {
    var time = d.getDate();
    if (time == 1) {
      r = startMessaging();
    }
  }
  return r;
}
