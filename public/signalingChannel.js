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


// signaling 서버에서 메세지가 오면 처리해줌
conn.onmessage = function(msg) {
    const content = JSON.parse(msg.data);
    const data = content.data;
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


var dataChannel;
var input = document.getElementById("messageInput");
let localStream;
let peerConnection = new RTCPeerConnection(iceServerConfig);

//icecandidate handling
peerConnection.onicecandidate = async (e) => {
    if(e.candidate) {
        send({
            event : "candidate",
            data : e.candidate
        });
    }
}

// remoteStream 설정?
let remoteVideo = document.querySelector('#user-2')
peerConnection.addEventListener('track', async (event) => {
    const remoteStreams = event.streams;
    remoteVideo.srcObject = remoteStreams[0];
});



// 시작하기
// 화면정보 표현 해주기 및 click 이벤트 만들기
const initialize = async () => {
    console.log('initialize init')
    try {        
        // localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
        localStream = await window.navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream)
        })  
    } catch (err) {
        console.error(`Error: ${err}`)
    }

  
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('createOffer').addEventListener('click', ()=>{
        createOfferToSignalingServer()
    })

    document.getElementById('send').addEventListener('click', ()=>{
        sendMessage()
    })    
}

// createOffer 버튼 눌렀을때 offer signalingserver에 전달해주기
function createOfferToSignalingServer() {
    console.log('createOfferToSignalingServer init')    
    peerConnection.createOffer()
        .then((offer) => {
            // 여기서 이미 icecandidate가 추가 되나?
            peerConnection.setLocalDescription(offer);
            send({
                event : "offer",
                data : offer
            });
            
        })
        .catch((error) =>  {
            alert("Error creating an offer");
        });
}




function iceCandidateInit() {   
    console.log("iceCandidateInit start")

    console.log(peerConnection.iceConnectionState)

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

// 상대측으로부터 받은 offer를 처리
function handleOffer(offer) {
    console.log('handleOffer init')
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => {
        // remoteStream = new MediaStream()
        // console.log(remoteStream)
        // document.getElementById('user-2').srcObject = remoteStream
    

    })

    // create and send an answer to an offer
    peerConnection.createAnswer()
    .then((answer) => {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });
    })
    .catch(err =>{console.log(err)})


};

function handleCandidate(candidate) {
    console.log("handleCandidate init")
    peerConnection.addIceCandidate(candidate);
};

function handleAnswer(answer) {
    console.log('handleAnswer init')
    peerConnection.setRemoteDescription(answer);
    console.log("connection established successfully!!");
    // iceCandidateInit()
    // iceCandidateInit()
    // let remoteStream = new MediaStream()
    // document.getElementById('user-2').srcObject = remoteStream
};

function sendMessage() {
    dataChannel.send(input.value);
    input.value = "";
}