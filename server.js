var http = require('http')
var fs = require('fs')
var path=require('path')
var mime = require('mime')
var cache = {}  //用来缓存文件内容

function send404(response){
    response.writeHead(404,{'content-type':'text/plain'})
    response.write('error 404 not found')
    response.end()
}

function sendFile(response,filePath,fileContents){  //先写出正确的http头，然后发送文件的内容
    response.writeHead(200,{'content-type':mime.getType(path.basename(filePath))})
    response.end(fileContents)
}

function serverStatic(response,cache,absPath){
    //检查文件是否缓存在内存中
    
    if(cache[absPath]){
        //get file from cache
        sendFile(response,absPath,cache[absPath])
    }else{
        fs.exists(absPath,function(exists){
            if(exists){
                fs.readFile(absPath,function(err,data){
                    if(err){
                        send404(response)
                    }else{
                        cache[absPath] = data
                        sendFile(response,absPath,data)
                    }
                })
            }else{
                send404(response)
            }
        })
    }
}

var server = http.createServer(function(req,res){
    var filepath = false
    if(req.url === '/'){
        filepath = 'src/index.html'
    }else{
        filepath = 'src'+req.url
    }
    serverStatic(res,cache,filepath)
})

server.listen(3000,function(){
    console.log('server is listening on port 3000')
})