import { useState, React } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Grid, TextField, Collapse, Alert, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as fs_ref, uploadString, getDownloadURL } from "firebase/storage";

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

const Registration = () => {

    const auth = getAuth();
    const storage = getStorage()
    let navigate = useNavigate();
    const db = getDatabase();


    let [name, setName] = useState('')
    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let [cpassword, setCpassword] = useState('')

    let [err_name, setErr_name] = useState('')
    let [err_email, setErr_email] = useState('')
    let [err_pass, setErr_pass] = useState('')
    let [err_cpass, setErr_cpass] = useState('')
    let [existEmailErr, setExistEmailErr] = useState('')
    let [open, setOpen] = useState(false);




    let erroHandler = () => {
        if (!name) {
            setErr_name("Please input the name")
        }
        else if (!email) {
            setErr_name("")
            setErr_email("Please input the email")
        }
        else if (!password) {
            setErr_name("")
            setErr_email("")
            setErr_pass("Please input the password")
        }
        else if (password.length < 8) {
            setErr_name("")
            setErr_email("")
            setErr_pass("The length of the password must be greater or equal to 8")
        }
        else if (!cpassword) {
            setErr_name("")
            setErr_email("")
            setErr_pass("")
            setErr_cpass("Please confrim password")
        }
        else if (cpassword != password) {
            setErr_name("")
            setErr_email("")
            setErr_pass("")
            setErr_cpass("Password doesn't match")
        }
        else {
            setErr_name("")
            setErr_pass("")
            setErr_email("")
            setErr_cpass("")
            createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
                const user = userCredential.user;
                navigate('/login')
                sendEmailVerification(auth.currentUser)
                    .then(() => {
                        console.log("Email Send")
                        updateProfile(auth.currentUser, {
                            displayName: name
                        }).then(() => {
                            set(ref(db, 'users/' + auth.currentUser.uid), {
                                username: auth.currentUser.displayName,
                                email: email,
                                userProfilePicture: "none",
                            });

                            uploadString(fs_ref(storage, auth.currentUser.uid), "./assets/images/avaterPic.png", "data_url")
                        }).catch((error) => {
                            console.log("Error")
                            console.log(error)
                        });
                    });



            }).catch((error) => {
                const errorCode = error.code;
                if (errorCode.includes("email")) {
                    setExistEmailErr("The email is already in use. Please use another one.")
                    setOpen("True")
                }

            });
        }
    }

    return (

        <section id="registration">
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <div className='right'>
                        <div className='register'>
                            <div className='heading'>
                                <h1>Get started with easily register</h1>
                                <p style={{ marginBottom: "20px" }}>Free register and you can enjoy it</p>

                                <Collapse in={open}>
                                    <Alert variant="filled" severity="error"
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setOpen(false);
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                        sx={{ mb: 2 }}
                                    >
                                        {existEmailErr}
                                    </Alert>
                                </Collapse>

                            </div>

                            <TextField
                                className='inputBox'
                                helperText={err_name}
                                id="demo-helper-text-misaligned"
                                label="Full Name"
                                type="text"
                                onChange={(input) => { setName(input.target.value) }}
                            />
                            <br />
                            <TextField
                                className='inputBox'
                                helperText={err_email}
                                id="demo-helper-text-misaligned"
                                label="Email address"
                                type="email"
                                onChange={(input) => { setEmail(input.target.value) }}
                            />
                            <br />
                            <TextField
                                className='inputBox'
                                helperText={err_pass}
                                id="demo-helper-text-misaligned"
                                label="Password"
                                type="password"
                                onChange={(input) => { setPassword(input.target.value) }}
                            />
                            <br />
                            <TextField
                                className='inputBox'
                                helperText={err_cpass}
                                id="demo-helper-text-misaligned"
                                label="Confirm Password"
                                type="password"
                                onChange={(input) => { setCpassword(input.target.value) }}
                            />
                            <br />

                            <Button className='RegButton' variant="contained" onClick={erroHandler}>Sign up</Button>

                            <div className='link'>
                                <h2>Already have an account ? <Link to="/login">Sign in</Link></h2>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <div className='left'>
                        <img
                            src="./assets/images/RegistrationPageBg.png"
                            alt='Registration'
                        />
                    </div>
                </Grid>
            </Grid>
        </section>

    )
}

export default Registration