var express = require('express')
var app = express()
var marked = require('marked');
var handlebars = require('handlebars');
var fs = require('fs');
var _ = require('lodash');
require('shelljs/global');
var config = require('./config.json');

String.prototype.matches = function(regex){
  var result = this.match(regex);
  return result;
}

if (!which('git')) {
  echo('Light CMS uses git as its publishing platform. Please configure a git repository in your repo.');
  exit(1);
}

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

var template;

fs.readFile("static/base_template.html", function(err, data){
  var templateString = "" + data;
  template = handlebars.compile(templateString);
});

exec('git submodule add --force ' + config.git_repository + ' posts');
var baseDir = "posts";
var allPosts = [];
var blog = {};

app.use('/static', express.static(__dirname + '/static'));

var refresh = function(req, res){
  cd(baseDir);
  exec('git pull')
  allPosts = fs.readdirSync("./");

  allPosts.forEach(function(post){
    if(post.matches(/^\..*/)) return;
    var fileData = fs.readFileSync(post);
    var newPost = {
      name: post.replace('.md', ''),
      post: marked(""+fileData)
    }
    blog[newPost.name] = newPost;
  });

  res.send("Refreshed");
  cd('..');
}

app.get('/refresh', refresh);

app.get('/', function (req, res) {
  var blogData = {
    title: config.blog_name,
    posts: _.values(blog)
  };
  res.send(template(blogData));
})

app.get('/:blog', function(req, res){
  var blogData = {
    title: req.params.blog,
    posts: [blog[req.params.blog]]
  };
  res.send(template(blogData));
});

refresh({}, {send: function(){}});
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
