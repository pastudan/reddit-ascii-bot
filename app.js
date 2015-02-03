var Ascii = require('ascii');
var request = require('request');
var fs = require('fs');
var gm = require ('gm');

var url = "http://www.reddit.com/r/pics/new.json";

var count = 0;

log = fs.readFileSync('log.txt', {encoding: 'utf8'}).split('\n');

request.post({
    url: 'https://www.reddit.com/api/login',
    json: true,
    form: {
        api_type: 'json',
        user: 'LetMeASCIIThatForYou',
        passwd: 'xSKrWIdFwCaBW2W',
        rem: true
    }
}, function(err, res, body){
//    console.log(body);
    var cookie = body.json.data.cookie
    var modhash = body.json.data.modhash

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
                    r[i] = {
                        filename: '',
                        request: ''
                    }
                    var id = body.data.children[i].data.id;
                    var filename = "/tmp/"+id;

                    if (log.indexOf(id) > -1) {
                        console.log('already processed')
                    } else {

                        r[i].request = request(body.data.children[i].data.url).pipe(fs.createWriteStream(filename));
                        (function (id) {
                            r[i].request.on('finish', function () {
                                var path = this.path;
                                console.log(path)
                                gm(path)
                                    .resize(500, 300)
                                    .write(path, function (err) {
                                        var pic = new Ascii(path);

                                        // output in terminal (terminal mode)
                                        pic.convert(function (err, ascii) {
                                            ascii = '    ' + ascii.replace(/\n/g, '\n    ')

//                                            require('fs').writeFile(path+".txt", ascii);

                                            console.log(id+'\n', ascii);
                                            request.post({
                                                url: 'http://www.reddit.com/api/comment',
                                                json: true,
                                                headers: {
                                                    'X-Modhash': modhash,
                                                    'Cookie': 'reddit_session='+cookie
                                                },
                                                form: {
                                                    api_type: 'json',
                                                    text: ascii,
                                                    thing_id: 't3_'+id,
                                                    uh: modhash
                                                }
                                            }, function(err, res, body){
                                                fs.appendFile('log.txt', id + '\n');
                                                console.log("\n\nID:"+id, body.json.errors)
                                            })

                                        });
                                    });

                            });
                        })(id)
                    }
                }
            }
        }
    });


});
