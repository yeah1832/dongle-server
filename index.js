const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");
const { Storage } = require("./models/Storage");
const config = require("./config/key");
const port = process.emit.PORT || 4000;
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("방가방가");
});
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

app.post("/api/storage/save", (req, res) => {
  //필요한 정보들을 Client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const storage = new Storage(req.body);

  storage.save((err, saveInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});
app.get("/api/storage/load", (req, res) => {
  Storage.find({ id: req.body.id }).toArray((err, items) => {
    res.json(items);
    //console.log(items);
  });
});

app.post("/api/users/register", (req, res) => {
  //회원가입 할 때 필요한 정보들을 Client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 DB에서 찾음
  User.findOne({ id: req.body.id }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        id: "제공된 아이디에 해당하는 유저가 없습니다."
      });
    }

    // 요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다."
        });

      // 비밀번호까지 맞다면 토큰 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // token을 저장
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.post("/api/users/loginDup", (req, res) => {
  // 요청된 이메일을 DB에서 찾음
  User.findOne({ id: req.body.id }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        id: "제공된 아이디에 해당하는 유저가 없습니다."
      });
    } else {
      return res.status(200).send({
        loginSuccess: true
      });
    }
  });
});
// role 1 = 어드민      role 2 = 특정 부서 어드민
// role 0 = 일반 유저   role 0이 아니면 관리자
app.get("/api/users/auth", auth, (req, res) => {
  // 여기 까지 미들웨어 통과해 왔다는 얘기는 Authentication이 True라는 뜻
  res.status(200).json({
    _id: req.user.id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });

    return res.status(200).send({
      success: true
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
