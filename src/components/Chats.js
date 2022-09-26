import { React, useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { AiOutlineCamera } from 'react-icons/ai'
import { IoIosSend } from 'react-icons/io'
import { useSelector, useDispatch } from 'react-redux'
import { activeChat } from '../Slice/activeChatUser'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database"
import { getAuth, getUser } from "firebase/auth"

const Chats = () => {


    const db = getDatabase()
    const auth = getAuth()
    const activeUser = useSelector((state) => state.activeChat.user)

    let [msg, setMsg] = useState('')
    let [singleMsg, setSingleMsg] = useState([])

    let handleMessage = (e) => {
        setMsg(e.target.value)
    }

    let sendMessage = () => {
        if (msg != '') {
            if (activeUser.status == "group") {

            }
            else if (activeUser.status == "single") {
                set(push(ref(db, "singleMessages")), {
                    senderId: auth.currentUser.uid,
                    senderName: auth.currentUser.displayName,
                    receiverId: activeUser.id,
                    receiverName: activeUser.name,
                    message: msg
                }).then(() => {
                    setMsg('')
                })
            }
        }

    }


    useEffect(() => {
        onValue(ref(db, 'singleMessages'), (snapshot) => {
            let messages = []
            snapshot.forEach(item => {
                messages.push(
                    item.val()
                )
            })

            setSingleMsg(messages)
        })
    }, [])

    return (
        <div className='chats'>
            <div className='topArea'>
                <div className='currentUser'>
                    <div className='profileImage'>
                        <img src={activeUser.photoUrl} />
                        <div className='online'></div>
                    </div>
                    <div className='userInfo'>
                        <h3>{activeUser.name}</h3>
                        <p>Online</p>
                    </div>

                </div>
                <BiDotsVerticalRounded className='dotIcon' />

            </div>


            <div className='messages'>

                {
                    singleMsg.map((item) => {


                        return (
                            (item.senderId == auth.currentUser.uid && item.receiverId == activeUser.id) ||
                                (item.senderId == activeUser.id && item.receiverId == auth.currentUser.uid)
                                ?
                                item.senderId == auth.currentUser.uid
                                    ?
                                    <div style={messageSend} className='messageBox'>
                                        <p style={messageSendBackground} >{item.message}</p>
                                        <p style={dateSend} className='date'>Today, 2:01pm</p>
                                    </div>
                                    :
                                    <div style={messageReceive} className='messageBox'>
                                        <p style={messageReceiveBackground} >{item.message}</p>
                                        <p style={dateReceive} className='date'>Today, 2:01pm</p>
                                    </div>
                                :
                                ""
                        )
                    })
                }


            </div>

            <div className='sendPart'>
                <div className={activeUser.blocked ? 'input inputBlock' : 'input'}>
                    <input type={'text'} placeholder='Message' onChange={handleMessage} value={msg}></input>
                    <AiOutlineCamera className='camera' />
                </div>
                <button onClick={sendMessage}><IoIosSend /></button>
            </div>
        </div>
    )
}

let messageReceive = {
    justifyContent: 'flex-start',
}

let messageSend = {
    justifyContent: 'flex-end',
}

let messageReceiveBackground = {
    background: "#EAEAEA",
    color: "#000",
}

let messageSendBackground = {
    background: "#5F35F5",
    color: "#fff",
}

let dateReceive = {
    left: "0",
}

let dateSend = {
    right: "0",
}

export default Chats