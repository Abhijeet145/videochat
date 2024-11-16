import React from "react"
import AgoraRTM from "agora-rtm-sdk"
let first=true

const StreamHandler = () => {

    const servers = {
        iceServers : [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun.l.google.com:5349",
                    "stun:stun1.l.google.com:3478",
                    "stun:stun1.l.google.com:5349",
                ]
            }  
        ]
    }
    
    let APP_ID = "USE_APP_ID"
    let token = null

    let uid = String(Math.floor(Math.random()*10000))

    let client
    let channel
    let curretMember
    //  //later need to create a roomID to get from user
    let roomID = 'Test room 2'

    let localStream
    let remoteStream
    let peerConnection
    let init = async()=>{
          
        // Create a client instance 
        client = await AgoraRTM.createInstance(APP_ID)
        
        await client.login({uid,token})

        channel = client.createChannel(roomID)
        await channel.join()

        channel.on('MemberJoined',handleUserJoined)

        client.on('MessageFromPeer',handleMessageFromPeer)

        channel.on('MemberLeft' , handleUserLeft)

        localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
        document.getElementById('user-1').srcObject = localStream

    }

    let leaveChannel = async()=>{
        await channel.leaveChannel()
        await client.logout()
    }

    let initialize=()=>{
        if(first===true){
            first = false
            window.addEventListener('beforeunload',leaveChannel)
            init()
        }
    }
    
    initialize()

    let handleMessageFromPeer = async(message,MemberId)=>{
        message = JSON.parse(message.text)
        console.log('Handling some message from user')
        if(message.type === 'offer'){
            createAnswer(MemberId, message.offer)
        }
    
        if(message.type === 'answer'){
            addAnswer(message.answer)
        }
    
        if(message.type === 'candidate'){
            if(peerConnection){
                peerConnection.addIceCandidate(message.candidate)
            }
        }
    
    }

    let handleUserJoined = async (MemberId)=>{
        curretMember = MemberId
        console.log('A new user joined this channel: ',MemberId)
        createOffer(MemberId)
    }

    let handleUserLeft = async (MemberId)=>{
        if(MemberId === curretMember)
            document.getElementById('user-2').style.display = 'none'
    }

    let createPeerConnectoion = async(MemberId)=>{
        peerConnection = new RTCPeerConnection(servers)

        //handle the remote stream
        remoteStream = new MediaStream()
        document.getElementById('user-2').srcObject = remoteStream
        document.getElementById('user-2').style.display = 'block'
        console.log('I am adding remote stream');

        if(!localStream){
            localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
            document.getElementById('user-1').srcObject = localStream
        }

        //Adds all the tracks to peerConnection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track,localStream)
        })
        console.log("Tracks added to localstream");

        peerConnection.ontrack = (event)=>{
            event.streams[0].getTracks().forEach(track=>{
                remoteStream.addTrack(track)
            })
            console.log(event.streams[0]);
        }

        peerConnection.onicecandidate = async (event)=>{
            if(event.candidate){
                await client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberId)
            }
        }
       
    }

    let createOffer = async(MemberId)=>{
        await createPeerConnectoion(MemberId)

        console.log('connection established successfully')

        let offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        console.log('Offer created')

        client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId)
        console.log('Offer sent')
    }


    let createAnswer = async(MemberId,offer)=>{
        await createPeerConnectoion(MemberId)

        await peerConnection.setRemoteDescription(offer)

        let answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})},MemberId)
    }

    let addAnswer = async(answer)=>{
        if(!peerConnection.currentRemoteDescription){
            peerConnection.setRemoteDescription(answer)
        }
    }

    
    return(<>
    </>
    )
}

export default StreamHandler
