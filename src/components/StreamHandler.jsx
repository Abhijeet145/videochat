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
    
    let APP_ID = "e996accb35234d22bf92922376441efb"
    let token = null

    let uid = String(Math.floor(Math.random()*10000))

    let client
    let channel
    const memIds = new Set([2,3,4,5])
    const members = new Map([])
    let memberNumber = 1
    const maxUsers = 5
    const audioVal = true
    //  //later need to create a roomID to get from user
    let roomID = 'Test room 2'

    let localStream
    let localVideoStream
    let remoteStream = new Map([])
    let peerConnection = new Map([])
    let init = async()=>{
        window.addEventListener('beforeunload',leaveChannel)
        // Create a client instance 
        client = await AgoraRTM.createInstance(APP_ID)
        
        await client.login({uid,token})

        channel = client.createChannel(roomID)
        await channel.join()

        channel.on('MemberJoined',handleUserJoined)

        client.on('MessageFromPeer',handleMessageFromPeer)

        channel.on('MemberLeft' , handleUserLeft)

        localVideoStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
        localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:audioVal})
        document.getElementById('user-1').srcObject = localVideoStream

    }

    let leaveChannel = async()=>{
        console.log("Leave channel was called")
        members.forEach(member=>{
            client.sendMessageToPeer({text:JSON.stringify({'type':'Leaving'}),member})
        })
        await channel.leaveChannel()
        await client.logout()
    }
    
    let initialize=()=>{
        if(first===true){
            first = false
            init()
        }
    }
    
    initialize()

    let handleMessageFromPeer = async(message,MemberId)=>{
        
        message = JSON.parse(message.text)
        // console.log('Handling some message from user')
        if(message.type === 'offer'){
            for(let i=2;i<=maxUsers;i++){
                if(memIds.has(i) === true){
                    memberNumber = i;
                    memIds.delete(i);//delete this user
                    break;
                }
            }
            members.set(MemberId,memberNumber)
            createAnswer(MemberId, message.offer,memberNumber)
        }
    
        else if(message.type === 'answer'){
            addAnswer(message.answer,MemberId)
        }
    
        else if(message.type === 'candidate'){
            if(peerConnection.get(MemberId)){
                peerConnection.get(MemberId).addIceCandidate(message.candidate)
            }
        }
        else if(message.type === 'Leaving'){
            console.log("Leaving was called")
            for(let i = 2;i<=maxUsers;i++){
                if(members.get(MemberId) === i){
                    document.getElementById(`user-${i}`).style.display = 'none'
                    memIds.add(i)//when user leaves add this as a potential user
                    members.delete(MemberId)
                }
            }
        }
    
    }

    let handleUserJoined = async (MemberId)=>{
        for(let i=2;i<=maxUsers;i++){
            if(memIds.has(i) === true){
                memberNumber = i;
                memIds.delete(i);//delete this user
                break;
            }
        }
        members.set(MemberId,memberNumber)
        console.log('A new user joined this channel: ',MemberId)
        createOffer(MemberId,memberNumber)
    }

    let handleUserLeft = async (MemberId)=>{
        for(let i = 2;i<=maxUsers;i++){
            if(members.get(MemberId) === i){
                document.getElementById(`user-${i}`).style.display = 'none'
                memIds.add(i)//when user leaves add this as a potential user
                members.delete(MemberId)
            }
        }
    }

    let createPeerConnectoion = async(MemberId,memberNumber)=>{
        let connection = new RTCPeerConnection(servers)
        peerConnection.set(MemberId,connection)

        //handle the remote stream
        let stream = new MediaStream()
        remoteStream.set(MemberId,stream)
        document.getElementById(`user-${memberNumber}`).srcObject = stream
        document.getElementById(`user-${memberNumber}`).style.display = 'block'
        // console.log('I am adding remote stream');

        if(!localStream){
            localVideoStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
            localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:audioVal})
            document.getElementById('user-1').srcObject = localVideoStream
        }

        //Adds all the tracks to peerConnection
        localStream.getTracks().forEach( async track => {
            await connection.addTrack(track,localStream)
        })
        console.log("Tracks added to localstream");

        connection.ontrack = (event)=>{
            event.streams[0].getTracks().forEach(async track=>{
                await stream.addTrack(track)
            })
        }

        connection.onicecandidate = async (event)=>{
            if(event.candidate){
                await client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberId)
            }
        }
       
    }

    let createOffer = async(MemberId,memberNumber)=>{
        await createPeerConnectoion(MemberId,memberNumber)

        console.log('connection established successfully')

        let offer = await peerConnection.get(MemberId).createOffer()
        await peerConnection.get(MemberId).setLocalDescription(offer)
        console.log('Offer created')

        client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId)
        console.log('Offer sent')
    }


    let createAnswer = async(MemberId,offer,memberNumber)=>{
        await createPeerConnectoion(MemberId,memberNumber)

        await peerConnection.get(MemberId).setRemoteDescription(offer)

        let answer = await peerConnection.get(MemberId).createAnswer()
        await peerConnection.get(MemberId).setLocalDescription(answer)
        
        client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})},MemberId)
    }

    let addAnswer = async(answer,MemberId)=>{
        if(!peerConnection.get(MemberId).currentRemoteDescription){
            peerConnection.get(MemberId).setRemoteDescription(answer)
        }
    }

    
    return(<>
    </>
    )
}

export default StreamHandler
