 // let remoteStreamElement = document.querySelector('#remoteStream');
 let localStreamElement = document.querySelector('#user-1');
 //자신을 식별하기위한 랜덤한 key 
 const myKey = Math.random().toString(36).substring(2, 11);
 let pcListMap = new Map();
 let roomId;
 let otherKeyList = [];
 let localStream = undefined;
    
 const startCam = async () =>{
     if(navigator.mediaDevices !== undefined){
         await navigator.mediaDevices.getUserMedia({ audio: false, video : true })
             .then(async (stream) => {
                 console.log('Stream found');
 								//웹캠, 마이크의 스트림 정보를 글로벌 변수로 저장한다.
                 localStream = stream;
                 // Disable the microphone by default
                //  stream.getAudioTracks()[0].enabled = true;
                 localStreamElement.srcObject = localStream;
                 // Connect after making sure that local stream is availble
    
             }).catch(error => {
                 console.error("Error accessing media devices:", error);
             });
     }
    
 }

startCam();


// websocket 연결

const conn = new WebSocket('ws://192.168.6.49:8080/signaling');
