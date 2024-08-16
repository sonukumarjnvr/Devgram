import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import Profile from '../models/profileSchema.js';
import User from '../models/userSchema.js';

const router = express.Router();

//api to get a profile
/*
    1. url: /api/profiles/me
    2. fields: no
    3. method: GET
    4. access: PRIVATE
*/

router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(201).json({ msg: 'No profile found' });
    }
    res.status(200).json({ profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to create a profile
/*
    1. url: /api/profiles/
    2. fields: many(can see in the profile model)
    3. method: POST
    4. access: PRIVATE
*/

router.post('/', authenticate, async (req, res) => {
  try {
    let {
      image,
      company,
      website,
      location,
      designation,
      skills,
      bio,
      githubUsername,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    let profileObj = {
      user: req.user.id, // id gets from Token
      company: company ? company : '',
      website: website ? website : '',
      location: location ? location : '',
      designation: designation ? designation : '',
      skills: skills
        ? skills
            .toString()
            .split(',')
            .map((skill) => skill.trim())
        : '',

      bio: bio ? bio : '',
      githubUsername: githubUsername ? githubUsername : '',
      social: {
        youtube: youtube ? youtube : '',
        facebook: facebook ? facebook : '',
        twitter: twitter ? twitter : '',
        linkedin: linkedin ? linkedin : '',
        instagram: instagram ? instagram : '',
      },
    };

    //insert to db
    let profile = new Profile(profileObj);
    await profile.save();
    profile.populate('user');
    if (image == '' || image == null || image == 'undefined') {
      image =
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTOkHm3_mPQ5PPRvGtU6Si7FJg8DVDtZ47rw&usqp=CAU';
    }
    await User.findOneAndUpdate({ _id: req.user.id }, { avatar: image });
    res
      .status(200)
      .json({ msg: 'Post created successfully', profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: `${err.message}` });
  }
});

//api to update a profile
/*
    1. url: /api/profiles/
    2. fields: many(can see in the profile model)
    3. method: PUT
    4. access: PRIVATE
*/

router.put('/', authenticate, async (req, res) => {
  try {
    let {
      image,
      company,
      website,
      location,
      designation,
      skills,
      bio,
      githubUsername,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(401).json({ msg: 'Profile not found' });
    }

    let profileObj = {
      user: req.user.id, //id from token
      company: company ? company : '',
      website: website ? website : '',
      location: location ? location : '',
      designation: designation ? designation : '',
      skills: skills
        ? skills
            .toString()
            .split(',')
            .map((skill) => skill.trim())
        : '',

      bio: bio ? bio : '',
      githubUsername: githubUsername ? githubUsername : '',
      social: {
        youtube: youtube ? youtube : '',
        facebook: facebook ? facebook : '',
        twitter: twitter ? twitter : '',
        linkedin: linkedin ? linkedin : '',
        instagram: instagram ? instagram : '',
      },
    };

    //update to db
    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileObj },
      { new: true }
    );

    profile.populate('user');
    if (image == '' || image == null || image || 'undefined') {
      image =
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTOkHm3_mPQ5PPRvGtU6Si7FJg8DVDtZ47rw&usqp=CAU';
      await User.findOneAndUpdate({ _id: req.user.id }, { avatar: image });
    }
    response.status(200).json({
      msg: 'Profile is Updated Successfully',
      profile: profile,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get profile of a user
/*
    1. url: /api/profiles/users/:userId
    2. fields: no
    3. method: GET
    4. access: PUBLIC
*/

router.get('/users/:userId', async (req, res) => {
  try {
    let userId = req.params.userId;
    let profile = await Profile.findOne({ user: userId }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) {
      return res.status(401).json({ msg: 'No profile found for this user' });
    }

    res.status(200).json({ profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to add experience of a profile
/*
    1. url: /api/profiles/experience
    2. fields: title, company, location, from, to, current, description
    3. method: PUT
    4. access: PRIVATE
*/

router.put('/experience', authenticate, async (req, res) => {
  try {
    let { title, company, location, from, to, current, description } = req.body;
    let experienceObj = {
      title: title,
      company: company,
      location: location,
      from: from,
      to: to ? to : '',
      current: current ? current : false,
      description: description,
    };

    //get profile of a user
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(401).json({ msg: 'No profile found' });
    }
    profile.experience.unshift(experienceObj);
    profile = await profile.save();
    res.status(200).json({ profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to delete an experience of a profile
/*
    1. url: /api/profiles/experience/:expId
    2. fields: no
    3. method: DELETE
    4. access: PRIVATE
*/

router.delete('/experience/:expId', authenticate, async (req, res) => {
  try {
    let experienceId = req.params.expId;
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(401).json({ msg: 'No profile found' });
    }
    let removableIdx = profile.experience
      .map((exp) => exp._id.toString())
      .indexOf(experienceId);
    if (removableIdx !== -1) {
      profile.experience.splice(removableIdx, 1);
      profile = await profile.save();
      return res
        .status(200)
        .json({ msg: 'Experience is deleted', profile: profile });
    } else {
      return res.status(404).json({ msg: 'Experience not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to add education of a profile
/*
    1. url: /api/profiles/education/
    2. fields: school, degree, fieldOfStudy, from, description, to, current
    3. method: PUT
    4. access: PRIVATE
*/

router.put('/education', authenticate, async (req, res) => {
  try {
    let { school, degree, fieldOfStudy, from, description, to, current } =
      req.body;
    let educationObj = {
      school: school,
      degree: degree,
      fieldOfStudy: fieldOfStudy,
      from: from,
      description: description,
      to: to ? to : '',
      current: current ? current : false,
    };

    //get profile of a user
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(401).json({ msg: 'Profile not found' });
    }
    profile.education.unshift(educationObj);
    profile = await profile.save();
    res.status(200).json({ profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to delete education of a profile
/*
    1. url: /api/profiles/education/:eduId
    2. fields: no
    3. method: DELETE
    4. access: PRIVATE
*/

router.delete('/education/:eduId', authenticate, async (req, res) => {
  try {
    let educationId = req.params.eduId;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(401).json({ msg: 'Profile not found' });
    }
    let removableIdx = profile.education
      .map((edu) => edu._id.toString())
      .indexOf(educationId);
    if (removableIdx !== -1) {
      profile.education.splice(removableIdx, 1);
      profile = await profile.save();
      return res
        .status(200)
        .json({ msg: 'Education is deleted', profile: profile });
    } else {
      return res.status(201).json({ msg: 'Experience not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get all profile
/*
    1. url: /api/profiles/all
    2. fields: no
    3. method: GET
    4. access: PUBLIC
*/

router.get('/all', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      return res.status(401).json({ msg: 'No profiles found' });
    }
    return res.status(200).json({ profiles: profiles });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get only one profile
/*
    1. url: /api/profiles/:profileId
    2. fields: no
    3. method: GET
    4. access: PUBLIC
*/

router.get('/:profileId', async (req, res) => {
  try {
    let profileId = req.params.profileId;
    let profile = await Profile.findById(profileId).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) {
      return res.status(201).json({ msg: 'No profile found' });
    }
    return res.status(200).json({ profile: profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to follow/unfollow a post with profileId
/*
    1. url: /api/profiles/follow/:profileId
    2. fields: no
    3. method: PUT
    4. access: PRIVATE
*/

router.put('/follow/:profileId', authenticate, async (req, res) => {
  try {
    let userId = req.user.id;
    let profileId = req.params.profileId;

    let profile = await Profile.findById(profileId);
    let userProfile = await Profile.findOne({ user: userId });
    // console.log(userProfile);

    var isFollowed = profile.followers.includes(userId);
    var isFollowing = userProfile.following.includes(profile.user._id);

    var option = isFollowed ? '$pull' : '$addToSet';
    var option2 = isFollowing ? '$pull' : '$addToSet';

    //follow/unfollow user
    let updatedProfile = await Profile.findOneAndUpdate(
      { _id: profileId },
      { [option]: { followers: userId } },
      { new: true }
    ).populate('user', ['_id', 'avatar']);
    // res.status(200).json({ profile: profile });

    let userProfileUpdate = await Profile.findOneAndUpdate(
      { user: userId },
      { [option2]: { following: profile.user._id } },
      { new: true }
    ).populate('user', ['_id', 'avatar']);
    res
      .status(200)
      .json({ profile: updatedProfile, userProfile: userProfileUpdate });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

export default router;
