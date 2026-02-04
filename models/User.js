const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    name: {
        type: String,
        require: [true, "Please provide a name"]
    },
    email: {
        type: String,
        require: [true, "Please provide a email"],
        unique: true,
        // match: [

        //     /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        //     "Please provide a valid email"

        // ],
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
    password: {
        type: String,
        minlength: [6, "Please provide a password with min length 6"],
        require: [true, "Please provide a password"],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String
    },
    about: {
        type: String
    },
    place: {
        type: String

    },
    website: {
        type: String
    },
    profile_image: {
        type: String,
        default: "default.jpg"
    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }

});

//UserScema Method

UserSchema.methods.generateJwtFromUser = function () {
    const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

    const payload = {
        id: this._id,
        name: this.name
    };
    const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRE
    });
    return token;
};


UserSchema.methods.getResetPasswordTokenFromUser = function () {
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const { RESET_PASSWORD_EXPIRE } = process.env;

    const resetPasswordToken = crypto
        .createHash("SHA256")
        .update(randomHexString)
        .digest("hex");

    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);
    return resetPasswordToken;
};



//Pre Hooks

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        console.log(this.password);
    }

    // next();
});



// UserSchema.pre("save", function () {
//     console.log(this.password + "--1");
//     bcrypt.genSalt(10, (err, salt) => {
//         console.log(this.password + "--2");

//         bcrypt.hash(this.password, salt, (err, hash) => {

//             this.password = await bcrypt(user.password, 8)
//             // Store hash in your password DB
//             console.log(this.password + "--3");
//             this.password = hash;

//         });
//     });
// });



module.exports = mongoose.model("User", UserSchema);