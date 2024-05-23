const iceServerConfig = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
};

const displayMediaOptions = {
    video: {
        cursor: "always",
      displaySurface: "browser",
    },
    // audio: {
    //   suppressLocalAudioPlayback: false,
    // },
    // preferCurrentTab: false,
    // selfBrowserSurface: "exclude",
    // systemAudio: "include",
    // surfaceSwitching: "include",
    // monitorTypeSurfaces: "include",
};


//connecting to our signaling server 
const conn = new WebSocket('ws://192.168.6.49:8080/socket');

conn.onopen = function() {
    console.log("Connected to the signaling server");
    initialize();
};

conn.onmessage = function(msg) {
    console.log("Got message", msg.data);
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
    // when somebody wants to call us
    case "offer":
        handleOffer(data);
        break;
    case "answer":
        handleAnswer(data);
        break;
    // when a remote peer sends an ice candidate to us
    case "candidate":
        handleCandidate(data);
        break;
    default:
        break;
    }
};

function send(message) {
    conn.send(JSON.stringify(message));
}

const peerConnection = new RTCPeerConnection(iceServerConfig);
var dataChannel;
var input = document.getElementById("messageInput");
let localStream;

const initialize = async () => {
    try {        
        // localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
        localStream = await window.navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    } catch (err) {
        console.error(`Error: ${err}`)
    }
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('createOffer').addEventListener('click', ()=>{
        createOffer()
    })

    document.getElementById('send').addEventListener('click', ()=>{
        sendMessage()
    })    
}


function createOffer() {
    peerConnection.createOffer(function(offer) {
        send({
            event : "offer",
            data : offer
        });
        peerConnection.setLocalDescription(offer);
    }, function(error) {
        alert("Error creating an offer");
    });
}




function iceCandidateInit() {
    

    // Setup ice handling
    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            send({
                event : "candidate",
                data : event.candidate
            });
        }
    };

    // creating data channel
    dataChannel = peerConnection.createDataChannel("dataChannel", {
        reliable : true
    });

    dataChannel.onerror = function(error) {
        console.log("Error occured on datachannel:", error);
    };

    // when we receive a message from the other peer, printing it on the console
    dataChannel.onmessage = function(event) {
        console.log("message:", event.data);
    };

    dataChannel.onclose = function() {
        console.log("data channel is closed");
    };
  
  	peerConnection.ondatachannel = function (event) {
        dataChannel = event.channel;
  	};
}


function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // create and send an answer to an offer
    peerConnection.createAnswer(function(answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });
    }, function(error) {
        alert("Error creating an answer");
    });

};

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("connection established successfully!!");
};

function sendMessage() {
    dataChannel.send(input.value);
    input.value = "";
}