import express, { response } from 'express';
import authenticate from '../middlewares/authenticate.js';
import User from '../models/userSchema.js';
import Post from '../models/postSchema.js';

const router = express.Router();

//api to create a new post
/*
    1. url: /api/posts/
    2. fields: text, image
    3. method: POST
    4. access: PRIVATE
*/
router.post('/', authenticate, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (
      req.body.image == '' ||
      req.body.image == 'undefined' ||
      req.body.image == null
    ) {
      req.body.image = ' ';
    }

    let newPost = {
      user: req.user.id,
      text: req.body.text,
      image: req.body.image,
      name: user.name,
      avatar: user.avatar,
    };
    //create a post
    let post = new Post(newPost);
    post = await User.populate(post, { path: 'user.avatar' });
    post = await post.save();
    post = await Post.find({ user: req.user.id }).populate('user', [
      '_id',
      'avatar',
    ]);
    res.status(200).json({ post: post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get all post
/*
    1. url: /api/posts
    2. fields: no
    3. method: GET
    4. access: PRIVATE
*/

router.get('/', authenticate, async (req, res) => {
  try {
    let posts = await Post.find().populate('user', ['_id', 'avatar']);
    if (!posts) {
      return res.status(201).json({ msg: 'No posts found' });
    }

    res.status(200).json({ posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to get one post
/*
    1. url: /api/posts/:postId
    2. fields: no
    3. method: GET
    4. access: PRIVATE
*/

router.get('/:postId', authenticate, async (req, res) => {
  try {
    let postId = req.params.postId;
    let post = await Post.findById(postId).populate('user', ['_id', 'avatar']);
    if (!post) {
      return res.status(401).json({ msg: 'No post found' });
    }

    res.status(200).json({ post: post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to delete a post with postId
/*
    1. url: /api/posts/:postId
    2. fields: no
    3. method: DELETE
    4. access: PRIVATE
*/

router.delete('/:postId', authenticate, async (req, res) => {
  try {
    let postId = req.params.postId;
    let post = await Post.findById(postId);
    if (!post) {
      return res.status(401).json({ msg: 'No post found' });
    }
    await Post.findByIdAndRemove(postId);

    res.status(200).json({ msg: 'Post deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to like/unlike a post with postId
/*
    1. url: /api/posts/like/:postId
    2. fields: no
    3. method: PUT
    4. access: PRIVATE
*/

router.put('/like/:postId', authenticate, async (req, res) => {
  try {
    let postId = req.params.postId;
    let userId = req.user.id;

    let post = await Post.findById(postId);
    var isLiked = post.likes.includes(userId);

    var option = isLiked ? '$pull' : '$addToSet';

    //like/unlike post
    let updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { [option]: { likes: userId } },
      { new: true }
    ).populate('user', ['_id', 'avatar']);
    res.status(200).json({ post: post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to create comment to a post with postId
/*
    1. url: /api/posts/comment/:postId
    2. fields: text
    3. method: POST
    4. access: PRIVATE
*/

router.post('/comment/:postId', authenticate, async (req, res) => {
  try {
    let postId = req.params.postId;
    let userId = req.user.id;

    let post = await Post.findById(postId);
    let user = await User.findOne({ _id: userId });

    if (!post) {
      res.status(401).json({ msg: 'No post found' });
    }

    let newComment = {
      user: req.user.id,
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
    };

    post.comments.unshift(newComment);
    await post.save();

    let commentedPost = await Post.findById(postId).populate('user', [
      '_id',
      'avatar',
    ]);
    res.status(200).json({ post: commentedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

//api to delete comment of a post with commentId
/*
    1. url: /api/posts/delete/:postId/:commentId
    2. fields: no
    3. method: DELETE
    4. access: PRIVATE
*/

router.delete('/delete/:postId/:commentId', authenticate, async (req, res) => {
  try {
    let postId = req.params.postId;
    let commentId = req.params.commentId;

    let post = await Post.findById(postId).populate('user', ['_id', 'avatar']);

    //pull the comments of a post
    let comment = post.comments.find((comment) => comment.id === commentId);

    if (!comment) {
      res.status(404).json({ msg: 'Comment does not exists' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Unauthorized user' });
    }

    let removeIndex = post.comments.findIndex(
      (comment) => comment._id == commentId
    );
    if (removeIndex != -1) {
      post.comments.splice(removeIndex, 1);
      await post.save();
      res.status(200).json({ post: post });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

export default router;
