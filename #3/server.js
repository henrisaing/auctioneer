//StAuth10222: I Henri Saing, 000132162 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/auctioneer', function(req,res){
    res.sendFile(__dirname + '/auctioneer.html');
});

app.get('/bidder', function(req,res){
    res.sendFile(__dirname + '/bidder.html');
});

app.get('/', function(req,res){
    res.sendFile(__dirname + '/auction.html');
});

var bidInfo = {};
var maxBidder = {name:"Nobody", bid: '0', id: '0'};
var bidsCounter = 0;
var bidHistory = {};
io.on('connection', function(socket){

    socket.on('startAuction', function (data){
        bidInfo = {};
        maxBidder = {name:"", bid: '0', id: '0'};
        bidsCounter = 0;
        bidHistory = {};
        socket.broadcast.emit('sendAuction', {
            time: data.time,
            item: data.item,
            minBid: data.minBid
        });
    });

    socket.on('endAuction', function(){
        socket.broadcast.emit('closeAuction', maxBidder);
    });

    socket.on('sendBid', function(data){
        bidInfo[data.name] = [data.bid, socket.id];
        bidsCounter++;
        bidHistory[bidsCounter] = [data.name, data.bid];
        for(const bidder in bidInfo){
            if(parseInt(bidInfo[bidder][0]) > parseInt(maxBidder['bid'])){
                maxBidder['name'] = bidder;
                maxBidder['bid'] = bidInfo[bidder][0];
                maxBidder['id'] = bidInfo[bidder][1];
            }
        }
        for(const bidder in bidInfo){
            let msg = "Error";
            if(bidInfo[bidder][1] == maxBidder['id']){
                msg = "You are the top bidder!";
            }else{
                msg = "Bid too low";
            }
            io.to(bidInfo[bidder][1]).emit('sendInfo',msg);
        }
        socket.broadcast.emit('updateBids', [bidInfo, maxBidder, bidsCounter, bidHistory]);
    });
})



// start server
http.listen(3000, function(){
    //debug here
});