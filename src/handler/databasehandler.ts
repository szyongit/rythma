import * as mongoose from 'mongoose';

async function connectToDB() {
    const uri = process.env.DATABASE_URI;
    if(!uri) return;

    return mongoose.connect(uri);
}

function isConnected(): boolean {
    return (mongoose.connection != undefined);
}

const playTimeData = mongoose.model("Playtime", new mongoose.Schema({
    guild:{
        type: String,
        required:true
    },
    lastStart: {
        type: Number
    },
    time: {
        type:Number
    },
    playing: {
        type:Boolean
    }
}));

export default {
    connectToDB:connectToDB,
    isConnected:isConnected,
    connection:mongoose.connection,
    PlayTime:playTimeData
};