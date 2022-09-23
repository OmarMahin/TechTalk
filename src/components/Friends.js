import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'
import { TiMessages } from 'react-icons/ti'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { Button, Grid, TextField, Collapse, Alert, Menu, MenuItem } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { activeChat } from '../Slice/activeChatUser'

const Friends = (props) => {

    const db = getDatabase();
    const auth = getAuth();
    const dispatch = useDispatch()

    let [friendList, setFriendList] = useState([])
    let [reset, setReset] = useState(false)

    let blockHandle = (value) => {
        setReset(!reset)
        if (value.blocked) {
            update(ref(db, 'friends/' + value.dataKey), {
                block: false,
                userBlocked: "none"
            })
        }
        else {
            let currentUser = auth.currentUser.uid
            if (currentUser == value.receiverId) {
                update(ref(db, 'friends/' + value.dataKey), {
                    block: true,
                    userBlocked: value.senderId
                })
            }
            else if (currentUser == value.senderId) {
                update(ref(db, 'friends/' + value.dataKey), {
                    block: true,
                    userBlocked: value.receiverId
                })
            }

        }
    }

    let handleActiveUser = (item) => {
        let userInfo = {}
        if (item.receiverId == auth.currentUser.uid) {
            userInfo.status = "single"
            userInfo.id = item.senderId
            userInfo.name = item.senderName
        }
        else {
            userInfo.status = "single"
            userInfo.id = item.receiverId
            userInfo.name = item.receiverName
        }
        dispatch(activeChat(userInfo))
    }


    useEffect(() => {
        let friends = []

        onValue(ref(db, 'friends/'), (snapshot) => {
            snapshot.forEach(item => {

                if (item.val().receiverId == auth.currentUser.uid || item.val().senderId == auth.currentUser.uid) {
                    friends.push({
                        receiverName: item.val().receiver_name,
                        receiverId: item.val().receiverId,
                        senderName: item.val().sender_name,
                        senderId: item.val().senderId,
                        dataKey: item.key,
                        date: item.val().accDate,
                        blocked: item.val().block,
                        userBlocked: item.val().userBlocked

                    })
                }



            })
            setFriendList(friends)

        })

    }, [reset])

    return (
        <div className='groupList'>
            <h2>Friends</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className={(props.item == "message" ? 'lists friendlist messageFriendlist' : 'lists friendlist')}>


                {
                    friendList.map((item) => {

                        return (

                            <div className={(item.blocked) ? 'box blockBox' : 'box'} onClick={() => {
                                if (props.item == 'message') { handleActiveUser(item) }
                            }}>
                                <div className='img'>
                                    <img src='assets/images/FriendImg.png' />
                                </div>
                                <div className='name'>
                                    {(item.senderId == auth.currentUser.uid)
                                        ?

                                        <h2>{item.receiverName}</h2>
                                        :
                                        <h2>{item.senderName}</h2>
                                    }
                                    <h4>Hi Guys, Wassup!</h4>
                                </div>
                                <div className='button'>
                                    {
                                        props.item == "message"
                                            ?
                                            <button><TiMessages /></button>

                                            :
                                            (auth.currentUser.uid == item.userBlocked)
                                                ?
                                                <button className='blockButton' style={{ zIndex: "1", visibility: "hidden" }}
                                                    onClick={() => blockHandle(item)}>{item.blocked ? "Unblock" : "Block"}</button>
                                                :
                                                <button className='blockButton' style={{ zIndex: "9" }}
                                                    onClick={() => blockHandle(item)}>{item.blocked ? "Unblock" : "Block"}</button>

                                    }

                                    <p>{item.date}</p>
                                </div>
                            </div>
                        )

                    }
                    )
                }

                {friendList.length == 0 &&
                    <Alert severity="info" style={{ marginTop: "20px" }}>No Friend</Alert>
                }

            </div>
        </div>
    )
}

export default Friends