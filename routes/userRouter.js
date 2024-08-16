import express from 'express';
import User from '../models/userSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

//api to signup a user
/*
    1. url: /api/users/signup
    2. fields: {name, email, password}
    3. method: POST
    4. access: PUBLIC
*/
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    let avatar =
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTOkHm3_mPQ5PPRvGtU6Si7FJg8DVDtZ47rw&usqp=CAU';

    let user = await User.findOne({ email: email });

    if (user) {
      return res.status(201).json({ msg: 'User already exists' });
    }

    /* This code is generating a salt using `bcrypt.genSalt()` method with a cost factor of 10, and
        then using that salt to hash the password using `bcrypt.hash()` method. Salting and hashing
        the password is a common technique used to securely store passwords in a database. The salt
        is a random string that is added to the password before hashing, which makes it more
        difficult for attackers to crack the password using techniques like rainbow tables. The
        resulting hash is then stored in the database instead of the plain text password. */

    let salt = await bcrypt.genSalt(10); // salt is actually encrypted password
    password = await bcrypt.hash(password, salt); //password=salt

    let userObj = {
      name: name,
      email: email,
      password: password,
      avatar: avatar,
    };

    user = new User(userObj);
    await user.save();
    res.status(200).json({ msg: 'Signed up successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to login a user
/*
    1. url: /api/users/login
    2. fields: {email, password}
    3. method: POST
    4. access: PUBLIC
*/

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(201).json({ msg: 'Invalid email' });
    }

    let check = await bcrypt.compare(password, user.password);
    if (!check) {
      res.status(201).json({ msg: 'Invalid password' });
      return;
    }

    // create a token and send to Client
    /* This code is creating a JSON Web Token (JWT) for the authenticated user and sending it back to the
    client as a response to the login request. */
    let payload = {
      user: {
        id: user._id,
        name: user.name,
      },
    };

    /* This code is creating a JSON Web Token (JWT) for the authenticated user and sending it back to the
      client as a response to the login request. The `jwt.sign()` method takes in a payload
      object, a secret key, and a callback function. The payload object contains the user
      information that will be encoded in the token. The secret key is used to sign the token and
      verify its authenticity. The callback function is called with an error object and the token
      string. If there is an error, it will be thrown, otherwise, the token will be sent back to the
      client as a response to the login request. */

    //JWT token will always change every time a user logs in.

    jwt.sign(payload, process.env.JWT_SECRET_KEY, (error, token) => {
      if (error) throw error;
      res.status(200).json({
        msg: 'Logged in successfully',
        token: token,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get user info
/*
    1. url: /api/users/me
    2. fields: no fields
    3. method: get
    4. access: PRIVATE
*/

router.get('/me', authenticate, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

export default router;
