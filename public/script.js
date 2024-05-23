let peerConnection;
let localStream;
let remoteStream;



let servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

let init = async () => {
    
    try {        
        // localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
        localStream = await window.navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    } catch (err) {
        console.error(`Error: ${err}`)
    }
    document.getElementById('user-1').srcObject = localStream
}


let createPeerConnection = async (sdpType) => {
    peerConnection = new RTCPeerConnection(servers)
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = async (e) => {
        e.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (e) => {
        if(e.candidate) {
            document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
        }
    }
}


let createOffer = async () => {
    console.log("hello?")
    createPeerConnection('offer-sdp')


    // RTCSessionDescription 객체 생성
    let offer = await peerConnection.createOffer()
    // 세션 설명: 로컬 설명으로 설정
    await peerConnection.setLocalDescription(offer)
    console.log(offer)

    document.getElementById('offer-sdp').value = JSON.stringify(offer)
}


let createAnswer = async () => {
    createPeerConnection('answer-sdp')

    let offer = document.getElementById('offer-sdp').value 
    if(!offer) return alert('Retrieve offer from peer first')

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    // console.log(JSON.stringify(answer))
    document.getElementById('answer-sdp').value = JSON.stringify(answer)
}


let addAnswer = async () => {
    let answer = document.getElementById('answer-sdp').value
    if(!answer) return alert('Retrieve answer from peer first')
    
    answer = JSON.parse(answer)

    if(!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}

init()


document.getElementById('createoffer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)