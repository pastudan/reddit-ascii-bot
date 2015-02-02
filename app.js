var Ascii = require('ascii');
var request = require("request")
var fs = require("fs")

var url = "http://www.reddit.com/r/pics/new.json"

request({
    url : url,
    json: true
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        var imageRegex = /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;
        var r = [];
        for (i in body.data.children) {
            console.log(body.data.children[i].data.id);
            if (imageRegex.test(body.data.children[i].data.url)) {
                console.log("IMAGE MATCH");
                r[i] = {
                    filename: '',
                    request: ''
                }
                var filename = "/tmp/"+body.data.children[i].data.id;
                r[i].request = request(body.data.children[i].data.url).pipe(fs.createWriteStream(filename));
                r[i].request.on('finish', function () {
                    var pic = new Ascii(this.path);

                    // output in terminal (terminal mode)
                    pic.convert(function (err, result) {
                        console.log(result);
                        require('fs').writeFile(this.path+".txt", result);

                    });

                });
            }
        }
        // Print the json response
    }
});