import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { Modal, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Alert } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { getStorage, ref as fs_ref, uploadString, getDownloadURL } from "firebase/storage";

const MyGroups = () => {

    const auth = getAuth()
    const db = getDatabase()
    const storage = getStorage();


    let [groupList, setGroupList] = useState([])
    let [groupJoinReqList, setGroupJoinReqList] = useState([])
    let [loading, setLoading] = useState(false)
    let [groupPhoto, setGroupPhoto] = useState('')
    let [image, setImage] = useState('');
    let [cropper, setCropper] = useState();
    let [openGroupPic, setOpenGroupPic] = useState(false)
    let [openGroupReq, setOpenGroupReq] = useState(false)
    let [currentGroupId, setcurrentGroupId] = useState('')
    let [currentGroupReqId, setcurrentGroupReqId] = useState('')
    let [pending, setPending] = useState([])


    let handleGroupPicClose = () => {
        setcurrentGroupId('')
        setOpenGroupPic(false)
        setImage('')
    }

    let openGroupPicModal = (item) => {
        setcurrentGroupId(item.GroupKey)
        setGroupPhoto(item.GroupPhotoUrl)
        setOpenGroupPic(true)
    }

    let openGroupReqModal = (item) => {
        setOpenGroupReq(true)
        setcurrentGroupReqId(item.GroupKey)
        let pen = []
        groupJoinReqList.map((member) => {
            if (member.GroupAdminId == auth.currentUser.uid && item.GroupKey == member.GroupKey) {
                pen.push(member)
            }
        })

        setPending(pen)
    }

    let handleGroupReqClose = () => {
        setOpenGroupReq(false)
        setcurrentGroupReqId("")
    }

    let handlePicUpload = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
    }

    let handleRejectRequest = (item, index) => {
        pending.splice(index, 1)
        let removePending = ""
        onValue(ref(db, "groups/" + item.GroupKey), (item) => {
            removePending = item.val().Pending
        })
        update(ref(db, "groups/" + item.GroupKey), {
            Pending: removePending.replace("," + item.MemberId, '')
        })

    }

    let handleAcceptRequest = (item, index) => {
        pending.splice(index, 1)
        let removePending = ""
        let addMember = ""
        onValue(ref(db, "groups/" + item.GroupKey), (item) => {
            removePending = item.val().Pending
            addMember = item.val().Members
        })
        update(ref(db, "groups/" + item.GroupKey), {
            Members: addMember + "," + item.MemberId,
            Pending: removePending.replace("," + item.MemberId, '')
        })

        set(push(ref(db, 'notification/')), {
            message: `"${auth.currentUser.displayName}"` + " has to accepted your request to join the group "+ `"${item.GroupName}"`,
            receieve: item.MemberId,
            seen: "unseen",
        })
    }


    const getCropData = () => {
        setLoading(true)
        const storageRef = fs_ref(storage, currentGroupId);
        const image = cropper.getCroppedCanvas().toDataURL()
        uploadString(storageRef, image, 'data_url').then((snapshot) => {
            getDownloadURL(storageRef).then((url) => {

                setOpenGroupPic(false)
                setLoading(false)
                setImage('')

                update(ref(db, "groups/" + currentGroupId), {
                    GroupProfilePicture: url,
                })
            })


        });
    };



    useEffect(() => {


        onValue(ref(db, 'groups'), (snapshot) => {
            let grouplist = []
            let pendingMembers = []
            snapshot.forEach((item) => {
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                    GroupKey: item.key,
                    GroupPhotoUrl: item.val().GroupProfilePicture,
                })

                item.val().Pending.split(",").map((member) => {
                    if (member != "") {
                        let memberInfo = {}
                        
                        memberInfo.GroupAdminId = item.val().GroupAdmin
                        memberInfo.GroupKey = item.key
                        memberInfo.MemberId = member
                        memberInfo.GroupTagline = item.val().GroupTagline
                        memberInfo.GroupName = item.val().GroupName


                        onValue(ref(db, 'users/' + member), (item2) => {

                            memberInfo.MemberName = item2.val().username
                            memberInfo.MemberProfilePic = item2.val().userProfilePicture
                        })

                        pendingMembers.push(memberInfo)

                    }

                })

                


            })
            setGroupList(grouplist)
            setGroupJoinReqList(pendingMembers)
        })

    }, [])


    return (
        <div className='groupList'>
            <h2>MyGroups</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists mygroups'>

                {
                    groupList.map((item) => {
                        if (item.GroupAdmin == auth.currentUser.uid) {
                            return (
                                <div className={'box'}>
                                    <div className='img'>
                                        {
                                            item.GroupPhotoUrl
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
                                        <div className='info'>
                                            <button onClick={() => openGroupPicModal(item)}>Edit</button>
                                            <br />
                                            <button onClick={() => openGroupReqModal(item)}>Join Requests</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    })
                }

            </div>

            <Modal
                className="UploadProfilePicModal"
                open={openGroupPic}
                onClose={handleGroupPicClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="leftBarBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Change Group Profile Picture
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {!groupPhoto
                            ?
                            image
                                ?
                                <div className='img-preview'></div>
                                :
                                <img className='currentPic' src={'./assets/images/GroupAvaterPic.png'} alt='profilePic' />
                            :
                            image
                                ?
                                <div className='img-preview'></div>
                                :
                                <img className='currentPic' src={groupPhoto} alt='profilePic' />

                        }

                        <input type={"file"} className='picUpload' onChange={(item) => handlePicUpload(item)}></input>

                        <Cropper
                            style={{ height: 200, width: "50%", margin: "20px auto" }}
                            zoomTo={0.5}
                            initialAspectRatio={1}
                            preview=".img-preview"
                            src={image}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={false}
                            onInitialized={(instance) => {
                                setCropper(instance);
                            }}
                            guides={true}
                        />

                        {image && <LoadingButton
                            className='cropButton'
                            loading={loading}
                            loadingPosition="end"
                            variant="contained"
                            onClick={() => getCropData(currentGroupId)}
                        >
                            {loading
                                ?
                                "Uploading"
                                :
                                "Upload Image"
                            }
                        </LoadingButton>}



                    </Typography>
                </Box>
            </Modal>

            <Modal
                className="GroupJoinReq"
                open={openGroupReq}
                onClose={handleGroupReqClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="leftBarBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Join Requests
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>


                            {   pending.length > 0
                                ?   

                                pending.map((item, index) => (

                                    <ListItem alignItems="center">
                                        <ListItemAvatar>
                                            <Avatar alt="Profile Pic" src={item.MemberProfilePic} sx={{ width: 60, height: 60, marginRight: 4 }} />
                                        </ListItemAvatar>
                                        <ListItemText sx={{ marginRight: 35 }}
                                            primary={item.MemberName}
                                            secondary={
                                                <React.Fragment>
                                                    {"Test"}
                                                </React.Fragment>
                                            }
                                        />
                                        <button className='groupReqAcceptButton' onClick={() => { handleAcceptRequest(item, index) }}>Accept</button>
                                        <button className='groupReqRejectButton' onClick={() => { handleRejectRequest(item, index) }}>Reject</button>

                                    </ListItem>
                                    

                                ))

                                :
                                <Alert severity="info" style={{ width: "100%" }}>No Join Requests</Alert>
                            
                            }






                        </List>
                    </Typography>
                </Box>
            </Modal>

        </div>
    )
}

export default MyGroups