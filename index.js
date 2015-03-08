var express = require('express')
var app = express()
var marked = require('marked');
var handlebars = require('handlebars');
var fs = require('fs');
require('shelljs/global');

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

fs.readFile("base_template.html", function(err, data){
  var templateString = "" + data;
  template = handlebars.compile(templateString);
});

exec('git submodule add https://github.com/ellisande/blog posts');
var baseDir = "posts";
var allPosts = fs.readdirSync(baseDir);
var data = {
  posts: []
}

app.get('/refresh', function(req, res){
  cd('posts');
  exec('git pull')
  data.posts = [];
  allPosts = fs.readdirSync(baseDir);

  allPosts.forEach(function(post){
    if(post.matches(/^\..*/)) return;
    var fileData = fs.readFileSync(baseDir + '/' + post);
    var newPost = {
      name: post,
      post: marked(""+fileData)
    }
    data.posts.push(newPost);
  });

  res.send("Refreshed");
  cd('..');
});

app.get('/', function (req, res) {
  res.send(template(data));
})


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
