import { React, useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { AiOutlineCamera } from 'react-icons/ai'
import { IoIosSend } from 'react-icons/io'
import { useSelector, useDispatch } from 'react-redux'
import { activeChat } from '../Slice/activeChatUser'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database"
import { getAuth, getUser } from "firebase/auth"
import { Modal, Box, Typography, LinearProgress, Alert } from '@mui/material'
import { getStorage, ref as s_ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import moment from 'moment/moment'

const Chats = () => {


    const db = getDatabase()
    const storage = getStorage()
    const auth = getAuth()
    const activeUser = useSelector((state) => state.activeChat.user)

    let [msg, setMsg] = useState('')
    let [file, setFile] = useState('')
    let [singleMsg, setSingleMsg] = useState([])
    let [groupMsg, setGroupMsg] = useState([])
    let [uploadModalopen, setUploadModalOpen] = useState(false)
    let [progress, setProgress] = useState("")

    let handleMessage = (e) => {
        setMsg(e.target.value)
    }

    let sendMessage = () => {
        if (msg != '') {
            if (activeUser.status == "group") {
                set(push(ref(db, "groupMessages")), {
                    senderId: auth.currentUser.uid,
                    senderName: auth.currentUser.displayName,
                    receiverIds: activeUser.Members,
                    groupId: activeUser.id,
                    date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`,
                    message: msg
                }).then(() => {
                    setMsg('')
                })
            }
            else if (activeUser.status == "single") {
                set(push(ref(db, "singleMessages")), {
                    senderId: auth.currentUser.uid,
                    senderName: auth.currentUser.displayName,
                    receiverId: activeUser.id,
                    receiverName: activeUser.name,
                    date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`,
                    message: msg
                }).then(() => {
                    setMsg('')
                })
            }
        }

    }

    let uploadModalclose = () => {
        setUploadModalOpen(false)
    }

    let handleUploadImage = (value) => {
        setFile(value.target.files[0])
    }

    let uploadImage = () => {
        if (activeUser.status == "single") {
            const storageRef = s_ref(storage, "singleImageFiles/" + file.name);
            const upload = uploadBytesResumable(storageRef, file)

            upload.on('state_changed',
                (snapshot) => {

                    const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progressValue)
                },
                (error) => {

                    console.log(error)
                },
                () => {

                    getDownloadURL(upload.snapshot.ref).then((downloadURL) => {
                        if (file != "") {
                            set(push(ref(db, "singleMessages")), {
                                senderId: auth.currentUser.uid,
                                senderName: auth.currentUser.displayName,
                                receiverId: activeUser.id,
                                receiverName: activeUser.name,
                                date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`,
                                image: downloadURL
                            }).then(() => {
                                setUploadModalOpen(false)
                                setFile("")
                                setProgress("")
                            })
                        }
                    });
                }
            )
        }
        else if (activeUser.status == 'group'){
            const storageRef = s_ref(storage, "groupImageFiles/" + file.name);
            const upload = uploadBytesResumable(storageRef, file)

            upload.on('state_changed',
                (snapshot) => {

                    const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progressValue)
                },
                (error) => {

                    console.log(error)
                },
                () => {

                    getDownloadURL(upload.snapshot.ref).then((downloadURL) => {
                        if (file != "") {
                            set(push(ref(db, "groupMessages")), {
                                senderId: auth.currentUser.uid,
                                senderName: auth.currentUser.displayName,
                                receiverIds: activeUser.Members,
                                groupId: activeUser.id,
                                date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`,
                                image: downloadURL
                            }).then(() => {
                                setUploadModalOpen(false)
                                setFile("")
                                setProgress("")
                            })
                        }
                    });
                }
            )
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

        onValue(ref(db, 'groupMessages'), (snapshot) => {
            let messages = []
            snapshot.forEach(item => {
                messages.push(
                    item.val()
                )
            })

            setGroupMsg(messages)
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
                    activeUser.status == "group"
                        ?
                        activeUser.Members.includes(auth.currentUser.uid)
                            ?

                            groupMsg.map((item) => (


                                ((item.senderId == auth.currentUser.uid || item.receiverIds.includes(auth.currentUser.uid)) && activeUser.id == item.groupId)
                                    ?
                                    item.senderId == auth.currentUser.uid
                                        ?
                                        item.message
                                            ?
                                            <div style={messageSend} className='messageBox send'>

                                                <p style={messageSendBackground} >{item.message}</p>
                                                <p style={dateSend} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                            </div>
                                            :

                                            <div style={messageSend} className='messageBox send'>
                                                <div className='imgMessage' style={messageSendBackground}>
                                                    <img src={item.image} ></img>
                                                </div>
                                                <p style={dateSend} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                            </div>


                                        :
                                        item.message
                                            ?
                                            <div style={messageReceive} className='messageBox receive'>
                                                <p style={messageReceiveBackground} >{item.message}</p>
                                                <p style={dateReceive} className='date'>{item.senderName} , {moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                            </div>
                                            :
                                            <div style={messageReceive} className='messageBox receive'>
                                                <div className='imgMessage' style={messageReceiveBackground}>
                                                    <img src={item.image} ></img>
                                                </div>
                                                <p style={dateReceive} className='date'>{item.senderName} , {moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                            </div>

                                    :
                                    ""


                            ))

                            :
                            ""

                        :
                        singleMsg.map((item) => (


                            (item.senderId == auth.currentUser.uid && item.receiverId == activeUser.id) ||
                                (item.senderId == activeUser.id && item.receiverId == auth.currentUser.uid)
                                ?
                                item.senderId == auth.currentUser.uid
                                    ?
                                    item.message
                                        ?
                                        <div style={messageSend} className='messageBox send'>
                                            <p style={messageSendBackground} >{item.message}</p>
                                            <p style={dateSend} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                        </div>
                                        :

                                        <div style={messageSend} className='messageBox send'>
                                            <div className='imgMessage' style={messageSendBackground}>
                                                <img src={item.image} ></img>
                                            </div>
                                            <p style={dateSend} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                        </div>


                                    :
                                    item.message
                                        ?
                                        <div style={messageReceive} className='messageBox receive'>
                                            <p style={messageReceiveBackground} >{item.message}</p>
                                            <p style={dateReceive} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                        </div>
                                        :
                                        <div style={messageReceive} className='messageBox receive'>
                                            <div className='imgMessage' style={messageReceiveBackground}>
                                                <img src={item.image} ></img>
                                            </div>
                                            <p style={dateReceive} className='date'>{moment(item.date, "YYYYMMDD h:mm:ss a").calendar()}</p>
                                        </div>

                                :
                                ""


                        ))




                }


            </div>

            {activeUser.status == "group"
                ?
                activeUser.Members.includes(auth.currentUser.uid)
                    ?
                    <div className='sendPart'>

                        <div className={activeUser.blocked ? 'input inputBlock' : 'input'}>
                            <input type={'text'} placeholder='Message' onChange={handleMessage} value={msg}></input>
                            <AiOutlineCamera className='camera' onClick={() => setUploadModalOpen(true)} />
                        </div>
                        <button onClick={sendMessage}><IoIosSend /></button>
                    </div>
                    :
                    <div className='sendPart'>
                        <Alert variant="filled" severity="error" style={{ width: "100%" }}>
                            You are not a member of the {activeUser.name} group.
                        </Alert>

                    </div>
                :
                <div className='sendPart'>

                    <div className={activeUser.blocked ? 'input inputBlock' : 'input'}>
                        <input type={'text'} placeholder='Message' onChange={handleMessage} value={msg}></input>
                        <AiOutlineCamera className='camera' onClick={() => setUploadModalOpen(true)} />
                    </div>
                    <button onClick={sendMessage}><IoIosSend /></button>
                </div>
            }



            <Modal
                className="uploadImgMessage"
                open={uploadModalopen}
                onClose={uploadModalclose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="createBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Send Image
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>

                        <input type={"file"} onChange={handleUploadImage}></input>


                        {progress != ""
                            ?
                            <div className='progress'>
                                <LinearProgress variant="determinate" value={progress} className="progressBar" />
                                <span className='value'>{progress}%</span>
                            </div>
                            :
                            ""
                        }

                        <br />
                        <button onClick={uploadImage}>Send</button>
                    </Typography>
                </Box>
            </Modal>

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
    borderColor: "#EAEAEA",
    color: "#000",
}

let messageSendBackground = {
    background: "#5F35F5",
    borderColor: "#5F35F5",
    color: "#fff",
}

let dateReceive = {
    left: "0",
}

let sender = {
    top: "0",
}

let dateSend = {
    right: "0",
}

export default Chats