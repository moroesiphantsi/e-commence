import React, {useEffect, useState} from "react";

import {
Box,
Paper,
Typography,
TextField,
Button,
Grid,
MenuItem,
Chip,
Divider
} from "@mui/material";



import {
Add,
Save
} from "@mui/icons-material";


import {
ref,
push,
set,
onValue,
update
} from "firebase/database";


import {db} from "../firebase";





const agents = [
"Moroesi",
"Rosina",
"Mercyh",
"Phantsi"
];







const FieldUpdates=()=>{


const [updates,setUpdates]=useState<any[]>([]);


const [search]=useState("");

const [month]=useState("");

const [year]=useState("");

const [agentFilter]=useState("");


const [editing,setEditing]=useState<any>(null);




const emptyForm={


agentName:"",

date:new Date()
.toISOString()
.split("T")[0],


visitType:"Attended House",


customerName:"",

surname:"",

idNumber:"",

phone:"",


address:"",


houseNumber:"",


saleType:"Prepaid",

packagePlan:"",

price:"",

commission:0,

adminConfirmation:"Pending",


status:"Pending",


comments:""

};



const [form,setForm]=useState(emptyForm);





useEffect(()=>{


const fieldRef=ref(
db,
"fieldUpdates"
);


onValue(fieldRef,(snap)=>{


const data=snap.val();


if(data){


setUpdates(

Object.keys(data)
.map(key=>({

id:key,

...data[key]

}))

.reverse()

);


}else{

setUpdates([]);

}


});


},[]);







const handleChange=(e:any)=>{


setForm({

...form,

[e.target.name]:e.target.value

});


};






// PACKAGE + COMMISSION

const selectPackage = (value:string)=>{

let price="";
let commission=0;

if(form.saleType==="Prepaid"){

    if(value==="20/10"){
        price="R349.00 p/m";
        commission=50;
    }

    if(value==="25/25"){
        price="R499.00 p/m";
        commission=50;
    }

    if(value==="50/25"){
        price="R700.00 p/m";
        commission=50;
    }

}else{

    if(value==="20/10 Contract"){
        price="R345 x 12 Months";
        commission=200;
    }

    if(value==="25/25 Contract"){
        price="R499 x 12 Months";
        commission=200;
    }

    if(value==="40/20 Contract"){
        price="R425 x 12 Months";
        commission=200;
    }

    if(value==="50/25 Contract"){
        price="R695 x 12 Months";
        commission=200;
    }

    if(value==="50/50 Contract"){
        price="R805 x 12 Months";
        commission=200;
    }

    if(value==="100/50 Contract"){
        price="R895 x 12 Months";
        commission=200;
    }

    if(value==="100/100 Contract"){
        price="R1025 x 12 Months";
        commission=200;
    }

    if(value==="200/100 Contract"){
        price="R1299 x 12 Months";
        commission=200;
    }

    if(value==="200/200 Contract"){
        price="R1365 x 12 Months";
        commission=200;
    }

    if(value==="300/150 Contract"){
        price="R1529 x 12 Months";
        commission=200;
    }

    if(value==="500/250 Contract"){
        price="R1699 x 12 Months";
        commission=200;
    }

}

setForm({

...form,

packagePlan:value,

price,

commission

});

};



const saveUpdate=async()=>{


if(!form.agentName){

alert("Please select agent");

return;

}



if(editing){


await update(
ref(db,`fieldUpdates/${editing}`),
form
);


setEditing(null);



}else{


const newRef=push(
ref(db,"fieldUpdates")
);



await set(newRef,{

...form,

createdAt:new Date().toISOString()

});


}



setForm(emptyForm);



};





const filteredUpdates =
updates.filter(item=>{


const text=`

${item.agentName}

${item.customerName}

${item.surname}

${item.address}

${item.houseNumber}

`;


return (

text
.toLowerCase()
.includes(
search.toLowerCase()
)

&&

(month?
new Date(item.date)
.getMonth()
===Number(month)
:true)

&&

(year?
new Date(item.date)
.getFullYear()
===Number(year)
:true)

&&

(agentFilter?
item.agentName===agentFilter
:true)

);


});



return(

        
<Box>

{/* ===========================
        AGENT PERFORMANCE
=========================== */}


<Typography
variant="h5"
fontWeight="bold"
color="white"
sx={{mt:4}}
>
📊 Agent Monthly Performance
</Typography>



<Grid container spacing={3} sx={{mt:2}}>


{
agents.map((agent)=>{


const agentReports =
updates.filter((item)=>{


const d = new Date(item.date);


return (

item.agentName === agent &&

(month === "" ||
d.getMonth()===Number(month))

&&

(year === "" ||
d.getFullYear()===Number(year))

);


});




const totalReports =
agentReports.length;



const confirmedSales =
agentReports.filter(
x=>x.adminConfirmation==="Confirmed"
);

const totalCustomers=confirmedSales.length;

const prepaidSales=
confirmedSales.filter(
x=>x.saleType==="Prepaid"
).length;

const contractSales=
confirmedSales.filter(
x=>x.saleType==="Contract"
).length;

const prepaidCommission=
confirmedSales
.filter(x=>x.saleType==="Prepaid")
.reduce((t,x)=>t+Number(x.commission),0);

const contractCommission=
confirmedSales
.filter(x=>x.saleType==="Contract")
.reduce((t,x)=>t+Number(x.commission),0);

const totalCommission=
prepaidCommission+contractCommission;





const commission = agentReports.reduce((total,item)=>{

if(item.adminConfirmation!=="Confirmed")
    return total;

return total + Number(item.commission);

},0);


return(


<Grid
item
xs={12}
md={3}
key={agent}
>


<Paper
sx={performanceCard}
>


<Typography
fontWeight="bold"
fontSize="20px"
>

👤 {agent}

</Typography>



<Divider sx={{my:2}}/>




<Typography>

📋 Reports:
<b>
{" "}
{totalReports}
</b>

</Typography>




<Typography>

👥 Confirmed Customers

<b>{totalCustomers}</b>

</Typography>

<Typography>

📦 Prepaid Sales

<b>{prepaidSales}</b>

</Typography>

<Typography>

📑 Contract Sales

<b>{contractSales}</b>

</Typography>

<Typography>

💵 Prepaid Commission

<b>R{prepaidCommission}</b>

</Typography>

<Typography>

💰 Contract Commission

<b>R{contractCommission}</b>

</Typography>

<Typography
fontWeight="bold"
color="green"
>

🏆 Total Commission

R{totalCommission}

</Typography>





<Typography>

💰 Commission:
<b>
R{commission.toFixed(2)}
</b>

</Typography>





<Chip

label={
commission > 0
?
"Active Seller"
:
"No Sales"
}

color={
commission > 0
?
"success"
:
"default"
}

sx={{mt:2}}





/>



</Paper>


</Grid>


)


})

}



</Grid>





{/* ===========================
       PACKAGE SELECTION
=========================== */}

<Typography

variant="h5"

fontWeight="bold"

color="white"

sx={{mt:5}}

>

📦 Prepaid And Contract Package Sales

</Typography>


<Paper sx={formCard}>


<Grid container spacing={2}>


<Grid item xs={12} md={4}>

<TextField

select

fullWidth

label="Sale Type"

name="saleType"

value={form.saleType}

onChange={(e)=>{

setForm({

...form,

saleType:e.target.value,

packagePlan:"",

price:"",

commission:0

});

}}

>

<MenuItem value="Prepaid">
Prepaid
</MenuItem>

<MenuItem value="Contract">
Contract
</MenuItem>

</TextField>

</Grid>

<Grid item xs={12} md={4}>

<TextField
select
fullWidth
name="packagePlan"
label="Package"
value={form.packagePlan}
onChange={(e)=>selectPackage(e.target.value)}
>

{
form.saleType==="Prepaid"
?
<>

<MenuItem value="20/10">
20/10 Mbps
</MenuItem>

<MenuItem value="25/25">
25/25 Mbps
</MenuItem>

<MenuItem value="50/25">
50/25 Mbps
</MenuItem>

</>

:

<>

<MenuItem value="20/10 Contract">
20/10 Mbps - R345 x12
</MenuItem>

<MenuItem value="25/25 Contract">
25/25 Mbps - R499 x12
</MenuItem>

<MenuItem value="40/20 Contract">
40/20 Mbps - R425 x12
</MenuItem>

<MenuItem value="50/25 Contract">
50/25 Mbps - R695 x12
</MenuItem>

<MenuItem value="50/50 Contract">
50/50 Mbps - R805 x12
</MenuItem>

<MenuItem value="100/50 Contract">
100/50 Mbps - R895 x12
</MenuItem>

<MenuItem value="100/100 Contract">
100/100 Mbps - R1025 x12
</MenuItem>

<MenuItem value="200/100 Contract">
200/100 Mbps - R1299 x12
</MenuItem>

<MenuItem value="200/200 Contract">
200/200 Mbps - R1365 x12
</MenuItem>

<MenuItem value="300/150 Contract">
300/150 Mbps - R1529 x12
</MenuItem>

<MenuItem value="500/250 Contract">
500/250 Mbps - R1699 x12
</MenuItem>

</>

}

</TextField>

</Grid>





<Grid item xs={12} md={4}>


<Paper
sx={{
p:2,
background:"#0f172a",
color:"white"
}}
>


<Typography>

Customer Commission

</Typography>


<Typography
fontSize="30px"
fontWeight="bold"
>

R {form.commission.toFixed(2)}

</Typography>

</Paper>


</Grid>




</Grid>


</Paper>





{/* ===========================
          CHART AREA
=========================== */}


<Typography

variant="h5"

fontWeight="bold"

color="white"

sx={{mt:5}}

>

📈 Field Growth Analytics

</Typography>




<Paper
sx={{
mt:2,
p:3,
borderRadius:4
}}
>


<Box

sx={{
display:"flex",
gap:3,
flexWrap:"wrap"
}}

>



{

agents.map((agent)=>{


const count =
updates.filter(
(x)=>
x.agentName===agent
).length;



return(


<Box

key={agent}

sx={{
flex:1,
minWidth:180
}}

>


<Typography
fontWeight="bold"
>

{agent}

</Typography>



<Box

sx={{
height:15,
background:"#e2e8f0",
borderRadius:5,
overflow:"hidden"
}}

>


<Box

sx={{

height:"100%",


width:
`${count*10}%`,


background:
"linear-gradient(90deg,#4DA3FF,#22c55e)"

}}


/>


</Box>



<Typography>

Reports : {count}

</Typography>

<Typography>

Prepaid :
{
updates.filter(
x=>x.agentName===agent &&
x.saleType==="Prepaid"
).length
}

</Typography>

<Typography>

Contract :
{
updates.filter(
x=>x.agentName===agent &&
x.saleType==="Contract"
).length
}

</Typography>

<Typography>

Confirmed :
{
updates.filter(
x=>x.agentName===agent &&
x.adminConfirmation==="Confirmed"
).length
}

</Typography>



</Box>


)


})

}




{/* =========================
        DAILY FIELD FORM
========================= */}

<Paper sx={formCard}>

<Typography
fontSize="22px"
fontWeight="bold"
>
📝 Add Daily Field Report
</Typography>


<Grid container spacing={2} sx={{mt:2}}>


<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Agent"
name="agentName"
value={form.agentName}
onChange={handleChange}
>

{
agents.map(a=>(

<MenuItem key={a} value={a}>
{a}
</MenuItem>

))
}

</TextField>

</Grid>



<Grid item xs={12} md={4}>

<TextField
fullWidth
type="date"
label="Date"
InputLabelProps={{shrink:true}}
name="date"
value={form.date}
onChange={handleChange}
/>

</Grid>



<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Visit Type"
name="visitType"
value={form.visitType}
onChange={handleChange}
>

<MenuItem value="Attended House">
🏠 Attended House
</MenuItem>


<MenuItem value="Unattended House">
🚪 Unattended House
</MenuItem>


</TextField>

</Grid>





{
form.visitType==="Attended House" &&

<>


<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Customer Name"
name="customerName"
value={form.customerName}
onChange={handleChange}
/>

</Grid>


<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Surname"
name="surname"
value={form.surname}
onChange={handleChange}
/>

</Grid>



<Grid item xs={12} md={4}>

<TextField
fullWidth
label="ID Number"
name="idNumber"
value={form.idNumber}
onChange={handleChange}
/>

</Grid>


<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Phone"
name="phone"
value={form.phone}
onChange={handleChange}
/>

</Grid>


<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Installation Address"
name="address"
value={form.address}
onChange={handleChange}
/>

</Grid>


<Grid item xs={12} md={4}>

<TextField
select
fullWidth
name="packagePlan"
label="Package"
value={form.packagePlan}
onChange={(e)=>selectPackage(e.target.value)}
>


<MenuItem value="20/10">
20/10 Mbps - R349
</MenuItem>


<MenuItem value="25/25">
25/25 Mbps - R499
</MenuItem>


<MenuItem value="50/25">
50/25 Mbps - R700
</MenuItem>


</TextField>

</Grid>


</>

}

<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Customer Status"
name="status"
value={form.status}
onChange={handleChange}
>

<MenuItem value="Completed">
Completed
</MenuItem>

<MenuItem value="Pending">
Pending
</MenuItem>

<MenuItem value="Follow Up">
Follow Up
</MenuItem>

<MenuItem value="Not Interested">
Not Interested
</MenuItem>

</TextField>

</Grid>


{
form.visitType==="Unattended House" &&


<Grid item xs={12} md={4}>


<TextField
fullWidth
label="Installation Address"
name="address"
value={form.address}
onChange={handleChange}
/>


</Grid>


}



<Grid item xs={12}>


<TextField
fullWidth
multiline
rows={3}
label="Comments"
name="comments"
value={form.comments}
onChange={handleChange}
/>


</Grid>



<Grid item xs={12}>


<Button

variant="contained"

startIcon={
editing?<Save/>:<Add/>
}

onClick={saveUpdate}

>

{
editing?
"Update Report":
"Save Report"
}


</Button>


</Grid>



</Grid>


</Paper>



</Box>

</Paper>


</Box>

);
};



export default FieldUpdates;



/* ===========================
          STYLES
=========================== */


const formCard={

p:4,

borderRadius:4,

background:
"rgba(255,255,255,0.95)",

boxShadow:
"0 20px 40px rgba(0,0,0,0.25)"

};



const performanceCard={

p:3,

borderRadius:4,

background:
"linear-gradient(135deg,#ffffff,#e0f2fe)",


boxShadow:
"0 15px 35px rgba(0,0,0,0.2)",


transition:"0.3s",


"&:hover":{

transform:"translateY(-8px)"

}

};
