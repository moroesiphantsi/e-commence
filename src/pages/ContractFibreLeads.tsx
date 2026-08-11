
import React, { useState } from "react";

import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  InputAdornment
} from "@mui/material";

import {
  Person,
  Phone,
  Email,

  Home,
  Badge,
  Wifi,
  Send,
  Security,
  Bolt,
  RocketLaunch,
  Public,
  Apartment,
  Verified
} from "@mui/icons-material";

import { motion } from "framer-motion";

import { ref, push } from "firebase/database";

import { db } from "../firebase";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const ContractFibreLeads = () => {

const [loading,setLoading]=useState(false);

const [success,setSuccess]=useState(false);

const [form,setForm]=useState({

firstName:"",
lastName:"",
phone:"",
email:"",
idNumber:"",
address:"",
suburb:"",
city:"",
province:"",
postalCode:"",

packageName:"",
monthlyPrice:"",
agentName:"",
notes:"",

createdAt:new Date().toISOString(),

status:"Pending"

});

const packagePlans=[

{
name:"OpenServe Home Fibre 20 Mbps",
price:"R399"
},

{
name:"OpenServe Home Fibre 50 Mbps",
price:"R599"
},

{

name:"OpenServe Home Fibre 100 Mbps",
price:"R799"
},

{
name:"OpenServe Home Fibre 200 Mbps",
price:"R999"
},

{
name:"OpenServe Business Fibre 500 Mbps",
price:"R1 499"
},

{
name:"OpenServe Business Fibre 1 Gbps",
price:"R1 999"
}

];

const handleChange=(e:any)=>{

const {name,value}=e.target;


setForm(prev=>({

...prev,

[name]:value

}));

};

const submitApplication=async()=>{

setLoading(true);

try{

await push(
ref(db,"contractFibreLeads"),
form
);

setSuccess(true);

setForm({

firstName:"",
lastName:"",
phone:"",
email:"",
idNumber:"",
address:"",
suburb:"",
city:"",
province:"",
postalCode:"",
packageName:"",
monthlyPrice:"",
agentName:"",
notes:"",
createdAt:new Date().toISOString(),
status:"Pending"

});

}catch(err){

console.log(err);


}

setLoading(false);

};

const styles={

page:{

minHeight:"100vh",

position:"relative",

overflow:"hidden",

padding:"50px 20px",

background:
"linear-gradient(145deg,#00143C 0%,#003D99 22%,#006BFF 45%,#008CFF 70%,#39C8FF 100%)"

},

background:{

position:"absolute",

top:0,

left:0,

right:0,

bottom:0,

overflow:"hidden",

zIndex:0

},

glass:{

position:"relative",

zIndex:5,

maxWidth:1400,

margin:"auto",

overflow:"hidden",

borderRadius:"38px",

background:"rgba(255,255,255,.08)",

backdropFilter:"blur(30px)",

border:"1px solid rgba(255,255,255,.18)",

boxShadow:"0 35px 90px rgba(0,0,0,.35)"

},

whiteCard:{

background:"#ffffff",

borderRadius:"28px",

padding:5,

boxShadow:"0 25px 60px rgba(0,0,0,.12)"

},

blueCard:{

background:
"linear-gradient(135deg,#003C9E,#005CFF,#007BFF)",

color:"#fff",

borderRadius:"30px",

padding:5,

boxShadow:"0 30px 80px rgba(0,92,255,.35)"

},

input:{

"& .MuiOutlinedInput-root":{

background:"#ffffff",

borderRadius:"18px",

transition:".4s",

"& fieldset":{

borderColor:"#d6e4ff"

},

"&:hover fieldset":{

borderColor:"#2196f3"

},

"&.Mui-focused fieldset":{

borderWidth:2,

borderColor:"#005CFF"

}

}

},

submitButton:{

height:65,

fontSize:20,

fontWeight:900,

borderRadius:"18px",

textTransform:"none",

background:
"linear-gradient(90deg,#005CFF,#00AEEF)",


boxShadow:
"0 20px 50px rgba(0,92,255,.45)",

"&:hover":{

background:
"linear-gradient(90deg,#0047D6,#0098E8)"

}

}

};


return (

<Box sx={styles.page}>

{/* ==========================================
            PREMIUM 2026 BACKGROUND

========================================== */}

<Box sx={styles.background}>

<motion.div
animate={{
x:[0,180,0],
y:[0,-120,0],
scale:[1,1.25,1]
}}
transition={{
duration:20,
repeat:Infinity
}}
style={{
position:"absolute",
width:520,
height:520,
borderRadius:"50%",
background:"rgba(0,102,255,.20)",
filter:"blur(140px)",
top:-180,
left:-150

}}
/>

<motion.div
animate={{
x:[0,-150,0],
y:[0,150,0],
scale:[1,1.2,1]
}}
transition={{
duration:24,
repeat:Infinity
}}
style={{
position:"absolute",
width:460,
height:460,
borderRadius:"50%",
background:"rgba(0,217,255,.18)",
filter:"blur(140px)",
top:80,
right:-150
}}
/>


<motion.div
animate={{
rotate:[0,360],
scale:[1,1.15,1]
}}
transition={{
duration:35,
repeat:Infinity,
ease:"linear"
}}
style={{
position:"absolute",
width:700,
height:700,
borderRadius:"50%",
border:"2px solid rgba(255,255,255,.08)",
left:"35%",
top:"25%"
}}
/>

<motion.div
animate={{

opacity:[0.2,1,0.2],
x:[-300,300,-300]
}}
transition={{
duration:14,
repeat:Infinity
}}
style={{
position:"absolute",
top:"15%",
width:"140%",
height:3,
background:"linear-gradient(90deg,transparent,#6DD5FA,transparent)"
}}
/>

<motion.div
animate={{
opacity:[0.3,1,0.3],
x:[300,-300,300]
}}
transition={{

duration:18,
repeat:Infinity
}}
style={{
position:"absolute",
bottom:"22%",
width:"140%",
height:2,
background:"linear-gradient(90deg,transparent,#ffffff,transparent)"
}}
/>

</Box>

{/* ==========================================
          MAIN GLASS CONTAINER
========================================== */}

<MotionPaper

sx={styles.glass}

initial={{
opacity:0,
y:80
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:1
}}

>

{/* ==========================================
               HERO SECTION
========================================== */}


<Grid
container
spacing={5}
alignItems="center"
sx={{p:5}}
>

<Grid item xs={12} md={8}>

<MotionTypography

variant="h2"

fontWeight={900}

animate={{
x:[0,18,0]
}}

transition={{
duration:6,
repeat:Infinity
}}


>

<span style={{color:"#6EC6FF"}}>Open</span>

<span style={{color:"#B9E6FF"}}>Serve </span>

<span style={{color:"#FFFFFF"}}>Contract </span>

<span style={{color:"#67D8FF"}}>Fibre</span>

</MotionTypography>

<MotionTypography

mt={3}

fontSize={22}

color="rgba(255,255,255,.95)"

lineHeight={1.8}

animate={{

y:[0,-8,0]
}}

transition={{
duration:5,
repeat:Infinity
}}

>

Please Complete The Following Form!

</MotionTypography>

</Grid>

<Grid item xs={12} md={4}>

<MotionBox

display="flex"

justifyContent="center"

animate={{
y:[0,-25,0],
rotate:[0,6,0,-6,0]
}}

transition={{
duration:8,
repeat:Infinity
}}

>

<Avatar

sx={{

width:260,

height:260,

background:
"linear-gradient(135deg,#006BFF,#00B8FF)",

boxShadow:

"0 35px 80px rgba(0,107,255,.45)"

}}

>

<Wifi

sx={{
fontSize:130,
color:"#fff"
}}

/>

</Avatar>

</MotionBox>

</Grid>

</Grid>

<Divider

sx={{
borderColor:"rgba(255,255,255,.18)"
}}
/>

{/* ==========================================
        PERSONAL INFORMATION (WHITE CARD)
========================================== */}

<Paper
sx={{
mt:5,
p:5,
borderRadius:"30px",
background:"#ffffff",
boxShadow:"0 25px 70px rgba(0,0,0,.15)"
}}
>

<Box
display="flex"

alignItems="center"
justifyContent="space-between"
mb={4}
flexWrap="wrap"
>

<Box>

<Typography
variant="h4"
fontWeight={900}
color="#0f172a"
>

Personal Information

</Typography>

<Typography
color="text.secondary"
mt={1}
>

Please complete your personal details to 

continue your
OpenServe Contract Fibre application.

</Typography>

</Box>

<motion.div

animate={{
rotate:[0,360]
}}

transition={{
duration:20,
repeat:Infinity,
ease:"linear"
}}

>

<Avatar
sx={{
width:90,

height:90,
background:"linear-gradient(135deg,#006BFF,#00C6FF)"
}}
>

<Person sx={{fontSize:45}}/>

</Avatar>

</motion.div>

</Box>

<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="First Name"
name="firstName"
value={form.firstName}
onChange={handleChange}

sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Person color="primary"/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="Last Name"
name="lastName"
value={form.lastName}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">

<Person color="primary"/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="South African ID Number/ Passport"
name="idNumber"
value={form.idNumber}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Badge color="primary"/>
</InputAdornment>
)
}}

/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="Phone Number"
name="phone"
value={form.phone}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Phone color="primary"/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12}>

<TextField
fullWidth
label="Email Address"
name="email"
value={form.email}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Email color="primary"/>
</InputAdornment>
)
}}
/>

</Grid>

</Grid>

</Paper>

{/* ==========================================
        BLUE INSTALLATION SECTION STARTS
========================================== */}

<Paper

sx={{

mt:5,

p:5,

borderRadius:"30px",

background:
"linear-gradient(135deg,#003B99,#005CFF,#009DFF)",

color:"#fff",

boxShadow:"0 30px 80px rgba(0,92,255,.35)",


overflow:"hidden",

position:"relative"

}}

>

<motion.div

animate={{
x:[-300,300,-300]
}}

transition={{
duration:14,
repeat:Infinity
}}

style={{
position:"absolute",
top:0,
left:0,

width:"100%",
height:3,
background:"linear-gradient(90deg,transparent,#ffffff,transparent)"
}}

/>

<Typography

variant="h4"

fontWeight={900}

mb={1}

>

Installation Address

</Typography>

<Typography

color="rgba(255,255,255,.9)"

mb={4}

>

Tell us where your OpenServe Fibre service will be installed.

</Typography>

<Grid container spacing={3}>

<Grid item xs={12}>

<TextField
fullWidth
label="Street Address"
name="address"
value={form.address}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(

<InputAdornment position="start">
<Home sx={{color:"#2196f3"}}/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Suburb"
name="suburb"
value={form.suburb}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="City / Town"
name="city"
value={form.city}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Apartment sx={{color:"#2196f3"}}/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Postal Code"
name="postalCode"

value={form.postalCode}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
select
fullWidth
label="Province"
name="province"
value={form.province}
onChange={handleChange}
sx={styles.input}
>

<MenuItem value="Gauteng">Gauteng</MenuItem>
<MenuItem value="Limpopo">Limpopo</MenuItem>
<MenuItem value="Mpumalanga">Mpumalanga</

MenuItem>
<MenuItem value="Free State">Free State</MenuItem>
<MenuItem value="KwaZulu-Natal">KwaZulu-Natal</MenuItem>
<MenuItem value="North West">North West</MenuItem>
<MenuItem value="Northern Cape">Northern Cape</MenuItem>
<MenuItem value="Western Cape">Western Cape</MenuItem>
<MenuItem value="Eastern Cape">Eastern Cape</MenuItem>

</TextField>

</Grid>

<Grid item xs={12} md={6}>

<motion.div

animate={{
y:[0,-12,0],

rotate:[0,5,0,-5,0]
}}

transition={{
duration:5,
repeat:Infinity
}}

>

<Paper

sx={{

height:"100%",

borderRadius:"24px",

background:"rgba(255,255,255,.12)",

border:"1px solid rgba(255,255,255,.25)",

backdropFilter:"blur(20px)",

display:"flex",

flexDirection:"column",

justifyContent:"center",

alignItems:"center",

py:4

}}

>

<Avatar

sx={{

width:90,

height:90,

mb:2,

background:"linear-gradient(135deg,#38bdf8,#2563eb)",

boxShadow:"0 15px 40px rgba(0,0,0,.25)"

}}

>

<Public sx={{fontSize:50}}/>

</Avatar>

<Typography
fontWeight={800}
fontSize={22}
color="#fff"
>

OpenServe Coverage

</Typography>

<Typography

color="rgba(255,255,255,.85)"
textAlign="center"
mt={1}
px={3}
>

We will verify fibre availability at your address and
arrange the fastest possible installation.

</Typography>

</Paper>

</motion.div>

</Grid>

</Grid>

</Paper>

{/* =======================================

===
          BLUE PACKAGE SECTION
========================================== */}

<Paper

sx={{

mt:5,

p:5,

borderRadius:"30px",

background:
"linear-gradient(135deg,#001F5C,#005BFF,#00B8FF)",

color:"#fff",

boxShadow:"0 30px 80px rgba(0,92,255,.35)"

}}


>

<Typography
variant="h4"
fontWeight={900}
>

Choose Your Fibre Package

</Typography>

<Typography
mt={1}
mb={4}
color="rgba(255,255,255,.9)"
>

Select the perfect OpenServe fibre package for your
home or business.

</Typography>

<Grid container spacing={3}>


<Grid item xs={12} md={6}>

<TextField
select
fullWidth
label="OpenServe Fibre Package"
name="packageName"
value={form.packageName}
onChange={(e)=>{

const selected = packagePlans.find(
p=>p.name===e.target.value
);

setForm(prev=>({

...prev,

packageName:e.target.value,

monthlyPrice:selected?.price || ""


}));

}}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Wifi sx={{color:"#2196f3"}}/>
</InputAdornment>
)
}}
>

{packagePlans.map((item)=>(

<MenuItem
key={item.name}
value={item.name}
>

{item.name} • {item.price}/Month

</MenuItem>


))}

</TextField>

</Grid>

<Grid item xs={12} md={6}>

<motion.div

animate={{
scale:[1,1.04,1]
}}

transition={{
duration:3,
repeat:Infinity
}}

>

<Paper

sx={{

height:"100%",

borderRadius:"25px",

background:"rgba(255,255,255,.12)",

border:"1px solid rgba(255,255,255,.25)",

backdropFilter:"blur(25px)",

display:"flex",

flexDirection:"column",

justifyContent:"center",

alignItems:"center",

py:4

}}

>

<Typography
color="rgba(255,255,255,.8)"
fontWeight={700}
>

Monthly Subscription

</Typography>

<Typography

fontSize={42}

fontWeight={900}

color="#fff"

>

{form.monthlyPrice || "Select Package"}

</Typography>


<Typography
color="rgba(255,255,255,.75)"
>

VAT Included

</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12}>

<TextField
fullWidth
multiline
rows={5}
label="Additional Notes (Optional)"
name="notes"
value={form.notes}

onChange={handleChange}
sx={styles.input}
/>

</Grid>

</Grid>

</Paper>


<Box
display="flex"
justifyContent="center"

mt={6}
>

<motion.div
whileHover={{
scale:1.05
}}
whileTap={{
scale:.98
}}
animate={{
y:[0,-8,0]
}}
transition={{
duration:3,
repeat:Infinity
}}
>

<Button
size="large"
variant="contained"
onClick={submitApplication}
disabled={loading}

endIcon={
loading
?
<CircularProgress
size={24}
color="inherit"
/>
:
<Send/>
}
sx={{
height:68,
minWidth:360,
fontSize:20,
fontWeight:900,
borderRadius:"50px",
textTransform:"none",
background:
"linear-gradient(90deg,#00C6FF,#0072FF)",
boxShadow:
"0 20px 50px rgba(0,150,255,.45)",
"&:hover":{
background:
"linear-gradient(90deg,#0099FF,#005CFF)"

}
}}
>

{
loading
?
"Submitting Application..."
:
"Submit OpenServe Fibre Application"
}

</Button>

</motion.div>

</Box>


{/* ==========================================
        WHY CHOOSE OPENSERVE
========================================== */}

<Paper

sx={{

mt:5,

p:5,


borderRadius:"30px",

background:
"linear-gradient(135deg,#003C99,#0066FF,#00BFFF)",

color:"#fff",

boxShadow:"0 30px 80px rgba(0,92,255,.35)"

}}

>

<motion.div

animate={{
x:[-30,30,-30]
}}

transition={{
duration:8,
repeat:Infinity

}}

>

<Typography

variant="h4"

fontWeight={900}

textAlign="center"

mb={4}

>

Why Choose OpenServe Fibre?

</Typography>

</motion.div>

<Grid container spacing={3}>


<Grid item xs={12} md={3}>

<motion.div
whileHover={{scale:1.08,y:-8}}
animate={{y:[0,-8,0]}}
transition={{duration:4,repeat:Infinity}}
>

<Paper
sx={{
p:3,
height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,.18)",
color:"#fff"
}}
>

<Avatar
sx={{

mx:"auto",
mb:2,
width:75,
height:75,
background:"linear-gradient(135deg,#00C6FF,#0072FF)"
}}
>
<Bolt sx={{fontSize:40}}/>
</Avatar>

<Typography
fontWeight={800}
fontSize={22}
mb={1}
>
Ultra Fast Speeds
</Typography>

<Typography color="rgba(255,255,255,.85)">
Experience lightning-fast fibre with stable,
high-performance internet built for streaming,
gaming, remote work and smart homes.
</Typography>


</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div
whileHover={{scale:1.08,y:-8}}
animate={{y:[0,8,0]}}
transition={{duration:5,repeat:Infinity}}
>

<Paper
sx={{
p:3,
height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,.18)",

color:"#fff"
}}
>

<Avatar
sx={{
mx:"auto",
mb:2,
width:75,
height:75,
background:"linear-gradient(135deg,#00E5FF,#0088FF)"
}}
>
<Security sx={{fontSize:40}}/>
</Avatar>

<Typography
fontWeight={800}
fontSize={22}
mb={1}
>
Secure Network
</Typography>


<Typography color="rgba(255,255,255,.85)">
Advanced fibre infrastructure designed for
maximum reliability, security and uninterrupted
connectivity across South Africa.
</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div
whileHover={{scale:1.08,y:-8}}
animate={{y:[0,-10,0]}}
transition={{duration:6,repeat:Infinity}}
>

<Paper
sx={{
p:3,

height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,.18)",
color:"#fff"
}}
>

<Avatar
sx={{
mx:"auto",
mb:2,
width:75,
height:75,
background:"linear-gradient(135deg,#0099FF,#005CFF)"
}}
>
<RocketLaunch sx={{fontSize:40}}/>
</Avatar>

<Typography

fontWeight={800}
fontSize={22}
mb={1}
>
Fast Installation
</Typography>

<Typography color="rgba(255,255,255,.85)">
Professional installation by experienced
technicians with quick turnaround and quality
service from start to finish.
</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div
whileHover={{scale:1.08,y:-8}}
animate={{y:[0,8,0]}}

transition={{duration:7,repeat:Infinity}}
>

<Paper
sx={{
p:3,
height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,.18)",
color:"#fff"
}}
>

<Avatar
sx={{
mx:"auto",
mb:2,
width:75,
height:75,
background:"linear-gradient(135deg,#38BDF8,#2563EB)"

}}
>
<Verified sx={{fontSize:40}}/>
</Avatar>

<Typography
fontWeight={800}
fontSize={22}
mb={1}
>
Trusted Fibre
</Typography>

<Typography color="rgba(255,255,255,.85)">
Join thousands of South Africans enjoying
premium OpenServe fibre connectivity backed by
trusted infrastructure.
</Typography>

</Paper>

</motion.div>

</Grid>


</Grid>

</Paper>

{/* ===========================
        SUBMIT SECTION
=========================== */}


<Grid item xs={12}>

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:1.2}}
>

<Paper
sx={{
mt:5,
p:5,
borderRadius:"32px",
background:

"linear-gradient(135deg,#012A63,#004AAD,#007BFF,#00B4FF)",
color:"#fff",
overflow:"hidden",
position:"relative",
boxShadow:"0 30px 80px rgba(0,70,255,.35)"
}}
>

<motion.div
animate={{
x:[-250,1200]
}}
transition={{
duration:12,
repeat:Infinity,
ease:"linear"
}}
style={{
position:"absolute",
top:0,
left:0,
width:220,

height:"100%",
background:
"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)",
transform:"skewX(-20deg)"
}}
/>

<Typography
variant="h4"
fontWeight={900}
textAlign="center"
mb={2}
>

OpenServe Contract Fibre

</Typography>

<motion.div
animate={{
x:[-40,40,-40]
}}

transition={{
duration:8,
repeat:Infinity
}}
>

<Typography
textAlign="center"
fontSize={19}
color="rgba(255,255,255,.92)"
>

Experience next-generation fibre technology built for
homes and businesses. Enjoy lightning-fast speeds,
low latency, professional installation and reliable
connectivity designed for South Africa's digital future.

</Typography>

</motion.div>

<Grid
container
spacing={3}
sx={{mt:4}}
>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:3,
height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(20px)",
color:"#fff"
}}
>

<Wifi sx={{fontSize:55,mb:2}}/>

<Typography
fontWeight={800}

fontSize={22}
>

Reliable Fibre

</Typography>

<Typography mt={1}>

Consistent high-speed internet designed for streaming,
gaming, video conferencing and smart living.

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:3,

height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(20px)",
color:"#fff"
}}
>

<RocketLaunch sx={{fontSize:55,mb:2}}/>

<Typography
fontWeight={800}
fontSize={22}
>

Fast Installation

</Typography>

<Typography mt={1}>

Professional installation teams ensure quick,
safe and efficient fibre activation.


</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:3,
height:"100%",
textAlign:"center",
borderRadius:"24px",
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(20px)",
color:"#fff"
}}
>

<Verified sx={{fontSize:55,mb:2}}/>

<Typography

fontWeight={800}
fontSize={22}
>

Trusted Network

</Typography>

<Typography mt={1}>

Built on OpenServe's trusted fibre infrastructure,
connecting thousands of homes nationwide.

</Typography>

</Paper>

</Grid>

</Grid>

</Paper>

</motion.div>
</Grid>

</MotionPaper>

<Snackbar
open={success}
autoHideDuration={5000}
onClose={()=>setSuccess(false)}
anchorOrigin={{
vertical:"top",
horizontal:"center"
}}
>

<Alert
severity="success"
variant="filled"
sx={{
borderRadius:"18px",
fontSize:16,
fontWeight:700
}}
>

🎉 Your OpenServe Contract Fibre application has been submitted successfully. Our team will contact you soon.

</Alert>

</Snackbar>

</Box>

);

};

export default ContractFibreLeads;
