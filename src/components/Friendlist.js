import React, { useEffect } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useState } from 'react';
import { Button, Grid, TextField, Collapse, Alert, IconButton } from '@mui/material'

const Friendlist = () => {

    const db = getDatabase();
    const auth = getAuth();

    let [friendReqs, setFriendReqs] = useState([])
    let [ReqAccept, setReqAccept] = useState(false)

    useEffect(() => {

        let friendReqLists = []
        const friendReqList = ref(db, 'friendRequests/')
        onValue(friendReqList, (snapshot) => {
            snapshot.forEach(item => {

                let userInfo = {}

                if (item.val().recieverId == auth.currentUser.uid) {
                    onValue(ref(db, 'users/' + item.val().senderId), (snapshot) => {
                        userInfo.recieverId = auth.currentUser.uid
                        userInfo.recieverName = auth.currentUser.displayName
                        userInfo.PhotoUrl = snapshot.val().userProfilePicture
                        userInfo.senderId = item.val().senderId
                        userInfo.senderName = snapshot.val().username
                        userInfo.dataKey = item.key
                    })
                    friendReqLists.push(userInfo)
                }

            })

            setFriendReqs(friendReqLists)
        })
    }, [ReqAccept])


    let friendReqHandler = (info) => {
        let date = new Date()
        set(push(ref(db, 'friends/')), {
            receiverId: info.recieverId,
            receiver_name: info.recieverName,
            senderId: info.senderId,
            sender_name: info.senderName,
            accDate: date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear(),
            block: false,
            userBlocked: "none"
        }).then(() => {
            remove(ref(db, 'friendRequests/' + info.dataKey)).then(() => { setReqAccept(!ReqAccept) })

        })

    }

    return (
        <div className='groupList'>
            <h2>Friend  Request</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists'>

                {friendReqs.map((item) => {
                    return (

                        <div className='box'>
                            <div className='img'>
                                <img src={item.PhotoUrl} />
                            </div>
                            <div className='name'>
                                <h2>{item.senderName}</h2>
                                <h4>Hi Guys, Wassup!</h4>
                            </div>
                            <div className='button'>
                                <button onClick={() => { friendReqHandler(item) }}>Accept</button>
                            </div>
                        </div>
                    )


                })}

                {friendReqs.length == 0 &&
                    <Alert severity="info" style={{ marginTop: "20px" }}>No Friend Request</Alert>
                }



            </div>
        </div>
    )
}

export default Friendlist