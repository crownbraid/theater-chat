$(function() {

    var socket = io();
    var newMessage = $('#message');
    var username = $('#userName');
    var messageWindow = $('#message-window');
    var videoWindow = $('#video-window');

    // initial signup
    getRooms();
    $('#confirm').on('click', function(e) {
        e.preventDefault();
        var username = $('#username').val()
        if (username) {
            userObj.username = username;
            userObj.color = $("#color-select").val(),
            userObj.avatar = iconSelect.getSelectedValue(),
            socket.emit('new-user', userObj);
            $('.popup, #close').toggle();
        }
    });

    $('#roomList').on('click', '.roomLink', function(e) {
        e.preventDefault();
        getRoom(this.id);
    });

    $('#back-to-main').on('click', function(e) {
        e.preventDefault();
        socket.emit('switchRoom', 'home');
        invertDisplay();
        getRooms();
    })

    $('#createroom-submit').on('click', function(e) {
        e.preventDefault();
        var roomname = $('#newRoomName').val()
        $.ajax('/room/' + roomname, {
            type: 'POST',
            statusCode: {
                201: function() {
                    console.log('logged in');
                },
                500: function() {
                    console.log('could not login');
                }
            }
        }).done(function(res) {
            $('#newRoomName').val("");
            socket.emit('switchRoom', roomname);
            invertDisplay()
            messageWindow.html("");
        }).fail(function(res) {
            console.log("login failed");
        });
    });



    function getRooms() {
        $.ajax('/rooms/', {
            type: 'GET',
            statusCode: {
                201: function() {
                    console.log('logged in');
                },
                500: function() {
                    console.log('could not login');
                }
            }
        }).done(function(res) {
            $('#roomList').html("");
            newMessage.val();
            res.forEach(function(room) {
                if (room != "home") {
                    $('#roomList').append("<button class='roomLink' id='" + room + "'>" + room + "</button>");
                }
            });
        }).fail(function(res) {
            console.log("login failed");
        });
    }

    function getRoom(roomname) {
        $.ajax('/room/' + roomname, {
            type: 'GET',
            statusCode: {
                201: function() {
                    console.log('logged in');
                },
                500: function() {
                    console.log('could not login');
                }
            }
        }).done(function(res) {
            socket.emit('switchRoom', roomname);
            invertDisplay();
            messageWindow.html("");
        }).fail(function(res) {
            console.log("login failed");
        });
    }
    


    // chatbox controller
    var addMessage = function(message) {
        messageWindow.append('<div class="message">' + message + '</div>');
        // speechBubble(message);
    };

    $('#close').on('click', function(e) {
        e.preventDefault();
        div_hide('account-setup');
    });

    newMessage.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        var message = userObj.username + " said: " + newMessage.val();
        console.log(message);
        socket.emit('new-message', message);
        newMessage.val('');
    });

    socket.on('new-message', addMessage);
    socket.on('update-chat', updateChat);
    socket.on('user-left', addMessage);

    function updateChat(roomname, messages) {
        messageWindow.append('<div class="message">You have joined room ' + roomname + '</div>');
        messages.forEach(function(message) {
            setTimeout(function() {
                messageWindow.append('<div class="message">' + message + '</div>');
            }, 100);
        });
    }

        var bubbleStatus = 'off';

    function speechBubble(message) {
        if (bubbleStatus == 'off') {
            $('#bubble' + userObj.username).stop().delay(3000).animate({'opacity': '0.0'}, 2000);
        } else {

        }
    }



    // video controller
    var video = $("#video-window .video");
    var videoController = video[0];
    var paused = false;

    $('#moderator').on('click', function(event) {
        event.preventDefault();
        userObj.moderator = !userObj.moderator;
        if (userObj.moderator) {
            video.attr('controls', true);
            videoController.addEventListener("seeked", function () {
                playPause('pause');
            });
            videoController.addEventListener("pause", function () {
                newtime = videoController.currentTime;
                socket.emit('timecode-change', newtime);
            });
            videoController.addEventListener("play", function () {
                newtime = videoController.currentTime;
                playPause('play');
                socket.emit('timecode-change-play', newtime);
            });
            $(this).text('turn off moderation');
        } else {
            video.attr('controls', false); 
            $(this).text('turn on moderation');
        }
    });

        socket.on('timecode-change', changeTimeCode);
        socket.on('timecode-change-play', changeTimeCodePlay);

    function changeTimeCode(newtime) {
        if (!userObj.moderator) {
            console.log(userObj.moderator);
            playPause('pause')
            videoController.currentTime = newtime;
        }
    }
    function changeTimeCodePlay(newtime) {
        if (!userObj.moderator) {
            playPause('pause')
            videoController.currentTime = newtime;
            playPause('play');
        }
    }
    function playPause(condition) {
        if (condition == 'play') {
            videoController.play();
        } else if (condition == 'pause') {
            videoController.pause();
        }
    }
});

var userObj = {
    username: "No username yet",
    color: 'white',
    avatar: null,
    moderator: false
}

function invertDisplay() {
    $('#room-selector, #room, #moderator, #back-to-main').toggle();
}
function div_show(div) {
    document.getElementById(div).style.display = "block";
}
function div_hide(div){
    document.getElementById(div).style.display = "none";
}























/*


    function seatCreator() {
        videoWindow.append('<div id="bubble' + user.username + '" class="bubble"><blockquote class="rectangle-speech-border"><p>' + message + '</p></blockquote></div>');
        $('#seats').append('<img src="./media/seat_tops.png" class="seats">');
    }



// <<< Management of Search History >>>
var storage = localStorage;
var searchHist;

function getHistory() {
    if (storage.hasOwnProperty('userInfo')) {
        userInfo = JSON.parse(storage['userInfo']);
        user.username = userInfo.userName;
    }
    updateUserProfile();
}


function backupHistory() {
    storage.setItem('searchHistory', JSON.stringify({terms: searchHist}));
    console.log(searchHist);
}
function updateSearchHistoryInterface() {
    searchHist.forEach(function(term, i) {
       $('#term' + (i + 1)).html(term); 
    });
}
function addToHistory(item) {
    var index = searchHist.findIndex(function(term) {
        return term === "";
    });
    if (index == -1) return;
    searchHist[index] = item;
    updateSearchHistoryInterface();
    backupHistory();
}
function removeFromHistory(position) {
    searchHist[position] = "";
    updateSearchHistoryInterface();
}

*/