
// constants
var SF2TWEETS_HOST = '<host>';
var SF2TWEETS_PORT = '<port>';
var SF2TWEETS_ROUTE = '/tweets.json';

// imports
var http = require('http');
var EventEmitter = require('events').EventEmitter;

var TweetController = exports.TweetController = function() {
    EventEmitter.call(this);
}

TweetController.prototype = Object.create(EventEmitter.prototype);

TweetController.prototype.postTweet = function postTweet(tweet) {
    // check for location
    var location = tweet.user.location ? tweet.user.location : 'unknown';
    
    // build the post string from an object
    var data = JSON.stringify({
        'tweet' : {
            'twitterId' : tweet.id_str,
            'twitterUserScreenName' : tweet.user.screen_name,
            'twitterUserAvatarUrl' : tweet.user.profile_image_url,
            'twitterUserLocation' : location,
            'message' : tweet.text,
            'messageEntities' : tweet.entities
        }
    });
    
    var requestOptions = {
        host: SF2TWEETS_HOST,
        port: SF2TWEETS_PORT,
        path: SF2TWEETS_ROUTE,
        method: 'POST',
        headers: {
            'Accept-Type' : 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    
    var tweetController = this;
    
    // post tweet to Symfony2 app
    var request = http.request(requestOptions, function(response) {
        response.setEncoding('UTF-8');
        response.on('data', function(chunk){
            try {
                // decode the respone JSON
                var data = JSON.parse(chunk);
                
                // notify listeners that a tweet was processed if successful
                if (data.tweet) {
                    tweetController.emit('tweet_processed', data.tweet);
                }
            } catch(e) {
                tweetController.emit('parse_error', e);
            }
        });
    });
    
    request.on('error', function(e) {
        console.error(e);
    });
    
    // send POST data
    request.write(data);
    request.end();
};
