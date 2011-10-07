
// constants
var TWITTER_USERNAME = '<name>';
var TWITTER_PASSWORD = '<pass>';
var TRACKING_KEYWORDS = ['#symfony2', 'symfony2', 'symfony 2', '#symfony', 'symfony'];
var IO_PORT = 9999;

// imports
var io = require('socket.io').listen(IO_PORT);
var TweetController = require('./tweet').TweetController;
var TwitterNode = require('twitter-node').TwitterNode;

// create the tweet controller to post tweets to the Symfony2 app
var tweetController = new TweetController();

// listen for the tweet_processed event
tweetController.addListener('tweet_processed', function(tweet) {
    // notify clients that a new tweet was received
    io.sockets.emit('tweet_received', tweet);
});

tweetController.addListener('parse_error', function(error) {
    console.error(error.message);
});

// create interface to Twitter Streaming API
var twitter = new TwitterNode({
    user: TWITTER_USERNAME, 
    password: TWITTER_PASSWORD,
    track: TRACKING_KEYWORDS
});

// add listeners for Twitter Streaming API events
twitter.addListener('error', function(error) {
    console.error(error.message);
})

twitter.addListener('tweet', function(tweet) {
    // post the tweet to the server to save to db
    tweetController.postTweet(tweet);
});

// start Twitter streaming
twitter.stream();
