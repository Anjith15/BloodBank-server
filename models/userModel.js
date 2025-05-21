const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:[true, 'Username is required'],
        unique:true,
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        unique:true,
        lowercase:true,
        match: [/\S+@\S+\.\S+/, 'Email format is invalid'],
    },
    password:{
        type:String,
        required:[true, 'Password is required'],
        minlength:[8, 'Password must be at least 8 characters'],
    },
    age:{
        type:Number,
        required:[true, 'Age is required'],
        min:[18, 'Age must be at least 18'],
        max:[65, 'Age must be 65 or less'],
    },
    gender:{
        type:String,
        required:[true, 'Gender is required'],
    },
    bloodGroup:{
        type:String,
        enum:['A+','A-','B+','B-','O+','O-','AB+','AB-'],
        required:[true, 'Blood Group is required'],
    },
    phoneNumber:{
        type:Number,
        required:[true, 'Phone Number is required'],
        unique:true,
    },
    weight:{
        type:Number,
        required:[true, 'Weight is required'],
        min:[50, 'Weight must be at least 50 kg'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
    },
    state: {
        type: String,
        required: [true, 'State is required'],
    },
    pinCode: {
        type: Number,
        required: [true, 'Pin Code is required'],
    },
    lastDonationDate:{
        type:Date,
        required:false,
    },
    hasDonatedBefore:{
        type:Boolean,
        required:false,
        default: false
    }
},{"strict":"throw"})

// create a model for the above schema
const UserModel=mongoose.model('user',userSchema)

// export the model
module.exports=UserModel;