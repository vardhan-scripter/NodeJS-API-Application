const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const auth = require("./routes/api/auth");
const media = require("./routes/api/media");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

const db = require("./setup/dbconfig").dbconnection;

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

mongoose.
connect(db).
then(() => console.log("Mongodb connected successfully")).
catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);

app.use("/api/auth", auth);
app.use("/api/media", media);


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));