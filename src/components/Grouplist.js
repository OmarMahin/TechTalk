import { React, useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { Modal, Box, Typography } from '@mui/material'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { useDispatch, useSelector } from 'react-redux';
import { notification } from '../Slice/notificationSlice'


const Grouplist = (props) => {

    const auth = getAuth()
    const db = getDatabase()
    let dispatch = useDispatch()
    let selector = useSelector((state)=>(state))

    let [groupModalopen, setGroupModalOpen] = useState(false)
    let [groupname, setGroupName] = useState('')
    let [grouptagline, setGroupTagline] = useState('')
    let [groupList, setGroupList] = useState([])
    let [refresh, setRefresh] = useState(false)
    let [pendingMembers, setPendingMembers] = useState([])
    let [members, setMembers] = useState([])

    let groupModal = () => {
        setGroupModalOpen(true)
    }

    let groupModalclose = () => {
        setGroupModalOpen(false)
    }

    let groupName = (item) => {
        setGroupName(item.target.value)
    }

    let groupTagline = (item) => {
        setGroupTagline(item.target.value)
    }

    let createGroup = () => {

        set(push(ref(db, 'groups/')), {
            GroupName: groupname,
            GroupTagline: grouptagline,
            GroupAdmin: auth.currentUser.uid,
            GroupProfilePicture: '',
            Members: auth.currentUser.uid,
            Pending: ""
        }).then(() => {
            setGroupModalOpen(false)
            setRefresh(!refresh)
        })
    }

    let handleGroupJoinReq = (item) => {
        set(push(ref(db, 'notification/')), {
            message: `"${auth.currentUser.displayName}"` + " wants to join your group "+ `"${item.GroupName}"`,
            
            receieve: item.GroupAdmin,
            seen: "unseen",
        })
        let pending = ""
        onValue(ref(db, "groups/" + item.GroupKey), (item) => {
            pending = item.val().Pending
        })
        update(ref(db, "groups/" + item.GroupKey), {
            Pending: pending + "," + auth.currentUser.uid
        })
        setRefresh(!refresh)
        
    }


    useEffect(() => {
        let grouplist = []
        let pend = []
        let mem = []

        onValue(ref(db, 'groups'), (snapshot) => {
            
            snapshot.forEach((item) => {
                
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                    GroupKey: item.key,
                    GroupPhotoUrl: item.val().GroupProfilePicture,
                })
                pend.push(item.val().Pending)
                mem.push(item.val().Members)
                

            })
            setPendingMembers(pend)
            setMembers(mem)
            setGroupList(grouplist)
        })

    }, [refresh])

    return (
        <div className='groupList'>
            <div className='top'>
                <h2>Groups Request</h2>
                <div className='button'>
                    <button onClick={groupModal}>Create Group</button>
                </div>
            </div>

            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists'>
                {groupList.map((item, index) => {
                    if (item.GroupAdmin != auth.currentUser.uid) {
                        return (
                            <div className='box' >
                                <div className='img'>
                                    {item.GroupPhotoUrl
                                        ?
                                        <img src={item.GroupPhotoUrl} />
                                        :
                                        <img src={'./assets/images/GroupAvaterPic.png'} />
                                    }
                                </div>
                                <div className='name'>
                                    <h2>{item.GroupName}</h2>
                                    <h4>{item.GroupTagline}</h4>
                                </div>
                                <div className='button'>
                                    {pendingMembers[index].includes(auth.currentUser.uid)
                                        ?
                                        <button onClick={() => { handleGroupJoinReq(item) }} >Pending</button>
                                        :
                                        members[index].includes(auth.currentUser.uid)
                                            ?
                                            ""
                                            :
                                            <button onClick={() => { handleGroupJoinReq(item) }} >Join</button>
                                    }

                                </div>
                            </div>
                        )
                    }


                })}


            </div>

            <Modal
                className="groupmodal"
                open={groupModalopen}
                onClose={groupModalclose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="createBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Create A Group
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <input placeholder='Group Name' onChange={groupName}></input>
                        <br />
                        <input placeholder='Group Tagline' onChange={groupTagline}></input>
                        <br />
                        <button onClick={createGroup}>Create group</button>
                    </Typography>
                </Box>
            </Modal>

        </div>


    )
}

export default Grouplist