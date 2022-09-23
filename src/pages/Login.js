import React, { useState } from 'react'
import { Link, useNavigate} from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, sendEmailVerification } from "firebase/auth";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { Button, Grid, TextField, Collapse, Alert, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';



const Login = () => {

    const auth = getAuth();
    const g_provider = new GoogleAuthProvider();
    const fb_provider = new FacebookAuthProvider();

    let navigate = useNavigate();

    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')

    let [err_email, setErr_email] = useState('')
    let [err_pass, setErr_pass] = useState('')

    let [showpass, setShowpass] = useState('false')

    let [passErr, setPassErr] = useState('')

    let [open, setOpen] = useState(false);

    let erroHandler = () => {
        if (!email) {
            setErr_email("Please input the email")
        }
        else if (!password) {
            setErr_email("")
            setErr_pass("Please input the password")
        }
        else if (password.length < 8) {
            setErr_email("")
            setErr_pass("The length of the password must be greater or equal to 8")
        }
        else {
            setErr_email("")
            setErr_pass("")
            signInWithEmailAndPassword(auth, email, password).then((userCredential) => {

                navigate('/home')

            }).catch((error) => {

                console.log(error.code)

                let errorCode = error.code

                if (errorCode.includes("password") || errorCode.includes("user")) {
                    setPassErr("The email / password is wrong. Please try again.")
                    setOpen("True")
                }
            });
        }
    }

    let handleEye = () => {
        setShowpass(!showpass)
    }

    let googleSignIn = () => {
        signInWithPopup(auth, g_provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
                navigate('/home')
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
            });
    }

    let facebookSignIn = () => {
        signInWithPopup(auth, fb_provider)
            .then((fbresult) => {
                // The signed-in user info.
                const user = fbresult.user;

                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                const credential = FacebookAuthProvider.credentialFromResult(fbresult);
                const accessToken = credential.accessToken;
                console.log(fbresult.user.emailVerified)
                navigate('/home')
                if (!fbresult.user.emailVerified){
                    sendEmailVerification(auth.currentUser)
                    .then(() => {
                        console.log("Email Send")
                    });
                }
                

                // ...
            })
            .catch((err) => {
                // Handle Errors here.
                const errorCode = err.code;
                const errorMessage = err.message;
                // The email of the user's account used.
                const email = err.customData.email;
                // The AuthCredential type that was used.
                const credential = FacebookAuthProvider.credentialFromError(err);
                console.log(err.message)

                
                // ...
            });

    }


    return (

        <section id="login">
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <div className='left'>
                        <div className='login'>
                            <div className='heading'>
                                <h1>Login to your account!</h1>
                            </div>
                            <div className='socials'>
                                <div className='box' onClick={googleSignIn}>
                                    <img src='./assets/images/GoogleLogo.png' />
                                    <h2>Login with Google</h2>
                                </div>
                                <div className='box' onClick={facebookSignIn}>
                                    <img src='./assets/images/FacebookLogo.png' />
                                    <h2>Login with Facebook</h2>
                                </div>

                            </div>

                            <Collapse in={open}>
                                <Alert variant="filled" severity="error"
                                    style={{ width: "459px", marginTop: "20px" }}
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
                                    {passErr}
                                </Alert>
                            </Collapse>

                            <TextField
                                helperText={err_email}
                                id="demo-helper-text-aligned"
                                label="Email Address"
                                type={'email'}
                                onChange={(input) => { setEmail(input.target.value) }}
                            />
                            <br />
                            <div className='eye'>
                                <TextField
                                    helperText={err_pass}
                                    id="demo-helper-text-aligned"
                                    label="Password"
                                    type={showpass ? 'password' : 'text'}
                                    onChange={(input) => { setPassword(input.target.value) }}
                                />
                                {showpass
                                    ?
                                    <AiFillEyeInvisible onClick={handleEye} className='eyeicon' />

                                    :
                                    <AiFillEye onClick={handleEye} className='eyeicon' />
                                }


                            </div>

                            <br />
                            <Button className='loginButton' variant="contained" onClick={erroHandler}>Login to Continue</Button>
                            <div className='link'>
                                <h2>Don’t have an account ? <Link to="/">Sign up</Link></h2>
                                <h2>Forgot Password ? <Link to="/resetpassword">Click here</Link></h2>
                            </div>

                        </div>
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <div className='right'>
                        <img style={{ width: "100%", height: "100vh" }} src='./assets/images/LoginPageBg.png' alt='Login page Background' />
                    </div>
                </Grid>
            </Grid>
        </section>
    )
}

export default Login