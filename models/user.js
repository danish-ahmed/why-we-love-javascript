var mongoose = require('mongoose');
var { Schema } = mongoose;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    username: {type:String, required:true, unique:true},
    password: {type:String, require:true},
    createdAt: {type:Date, default:Date.now()},
    displayName: {type:String},
    bio: {type:String}
});

// HASH PASSWORD BEFORE SAVE
var SALT_FACTOR = 10;
var noop = () => {}
userSchema.pre('save', function(done){
    user = this;
    if( !user.isModified("password") ){
        return done()
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
        if(err){ return done(err); }
        bcrypt.hash(user.password, salt, noop, function(err, hashedPassword){
            if(err){ return done(err); }
            user.password = hashedPassword;
            done();
        })
    })
})

// CHECK USER TYPED PASSWORD WITH DB PASSWORD
userSchema.methods.checkPassword = function(guessPassword, done){
    bcrypt.compare(guessPassword, this.password, function(err, isMatch){
        return done(err, isMatch);
    })
}

// GET DISPLAY NAME OF USERNAME
userSchema.methods.name = function(){
    return this.displayName || this.username
}
var User = mongoose.model('User', userSchema)
module.exports = User;